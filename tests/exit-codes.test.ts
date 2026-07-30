/**
 * End-to-end exit-code contract (0/1/2/3) against the built CLI.
 * Spawns `node dist/cli.js` with an isolated HOME/cwd so real profiles
 * on the machine never leak into the tests.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync, spawnSync } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const CLI = path.join(ROOT, "dist", "cli.js");

let sandbox: string;
let server: Server;
let serverPort: number;
let closedPort: number;
// Some environments (macOS firewall, CI sandboxes) drop loopback connections
// from child processes while allowing in-process ones. Probed in beforeAll;
// server-dependent cases are skipped when false. Refused connections (RST)
// still work, so the exit-3 case always runs.
let childLoopbackOk = false;

function runCli(
  args: string[],
  env: Record<string, string> = {},
): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd: sandbox,
    env: { PATH: process.env.PATH ?? "", HOME: sandbox, ...env },
    encoding: "utf-8",
    timeout: 15_000,
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const AUTH_ENV = { OO1K_ACCESS_KEY: "ak", OO1K_SECRET_KEY: "sk" };

beforeAll(async () => {
  execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
  sandbox = mkdtempSync(path.join(tmpdir(), "001k-cli-e2e-"));

  server = createServer((req, res) => {
    if (req.url?.startsWith("/api/v1/balance")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ type: "client_error" }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  serverPort = (server.address() as { port: number }).port;

  // Grab a port that is guaranteed closed: bind, read, release.
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  closedPort = (probe.address() as { port: number }).port;
  await new Promise<void>((resolve) => probe.close(() => resolve()));

  const probeResult = spawnSync(
    process.execPath,
    ["-e", `fetch("http://127.0.0.1:${serverPort}/api/v1/status",{signal:AbortSignal.timeout(2000)}).then(()=>console.log("ok")).catch(()=>console.log("fail"))`],
    { encoding: "utf-8", timeout: 5_000, env: { PATH: process.env.PATH ?? "" } },
  );
  childLoopbackOk = probeResult.stdout.trim() === "ok";
  if (!childLoopbackOk) {
    // Loud, not silent: the exit-0/exit-1 e2e contract is NOT verified in this
    // environment, and cli.ts is excluded from coverage in reliance on it.
    console.warn(
      "[exit-codes] child-process loopback blocked — skipping exit-0/exit-1 e2e tests; " +
        "the exit-code contract is only partially verified in this run.",
    );
  }
}, 180_000);

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  rmSync(sandbox, { recursive: true, force: true });
});

describe("exit-code contract", () => {
  it("exit 0: success JSON on stdout", (ctx) => {
    if (!childLoopbackOk) return ctx.skip();
    const r = runCli(["balance"], {
      ...AUTH_ENV,
      OO1K_BASE_URL: `http://127.0.0.1:${serverPort}`,
    });
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout)).toEqual({ ok: true });
    expect(r.stderr).toBe("");
  });

  it("exit 1: API error body on stdout", (ctx) => {
    if (!childLoopbackOk) return ctx.skip();
    const r = runCli(["ledger"], {
      ...AUTH_ENV,
      OO1K_BASE_URL: `http://127.0.0.1:${serverPort}`,
    });
    expect(r.status).toBe(1);
    expect(JSON.parse(r.stdout)).toEqual({ type: "client_error" });
  });

  it("exit 2: unknown entity", () => {
    const r = runCli(["nonsense"]);
    expect(r.status).toBe(2);
    expect(JSON.parse(r.stderr)).toMatchObject({
      cli_error: true,
      code: "unknown_entity",
    });
  });

  it("exit 2: missing credentials", () => {
    const r = runCli(["balance"]);
    expect(r.status).toBe(2);
    expect(JSON.parse(r.stderr)).toMatchObject({ code: "cli_error" });
    expect(JSON.parse(r.stderr).message).toContain("No credentials found");
  });

  it("exit 2: insecure base URL is a CLI error, not a network error", () => {
    const r = runCli(["balance"], {
      ...AUTH_ENV,
      OO1K_BASE_URL: "http://api.example.com",
    });
    expect(r.status).toBe(2);
    expect(JSON.parse(r.stderr).message).toContain("Insecure base URL");
  });

  it("exit 2: cli-check without --required-version", () => {
    const r = runCli(["cli-check"]);
    expect(r.status).toBe(2);
    expect(JSON.parse(r.stderr)).toMatchObject({ code: "missing_required_version" });
  });

  it("exit 3: connection refused is a network error", () => {
    const r = runCli(["balance"], {
      ...AUTH_ENV,
      OO1K_BASE_URL: `http://127.0.0.1:${closedPort}`,
    });
    expect(r.status).toBe(3);
    expect(JSON.parse(r.stderr)).toMatchObject({ network_error: true });
  }, 20_000);

  it("skill-check reports a stale skill", () => {
    const r = runCli(["skill-check", "--required-version", "0.0.1"]);
    expect(r.status).toBe(0);
    expect(JSON.parse(r.stdout)).toMatchObject({ needUpdateSkill: true });
  });

  it("--version and --help exit 0", () => {
    expect(runCli(["--version"]).status).toBe(0);
    const help = runCli(["--help"]);
    expect(help.status).toBe(0);
    expect(help.stdout).toContain("Usage:");
  });
});
