import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

let projectDir: string;
let homeDir: string;

beforeEach(() => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "001k-creds-test-"));
  projectDir = path.join(base, "project");
  homeDir = path.join(base, "home");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(homeDir, { recursive: true });
  vi.spyOn(process, "cwd").mockReturnValue(projectDir);
  vi.spyOn(os, "homedir").mockReturnValue(homeDir);
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(path.dirname(projectDir), { recursive: true, force: true });
});

async function loadModule() {
  vi.resetModules();
  return import("../src/credentials.js");
}

describe("credentials", () => {
  it("saveProfile writes and loadProfile reads back", async () => {
    const { saveProfile, loadProfile } = await loadModule();
    const data = { accessKey: "ak1", secretKey: "sk1", baseUrl: "https://x.io" };

    saveProfile("default", data, "global");

    const result = loadProfile("default");
    expect(result).toEqual(data);
  });

  it("loadProfile reads back saved profile from project scope", async () => {
    const { saveProfile, loadProfile } = await loadModule();
    saveProfile("dev", { accessKey: "pak", secretKey: "psk" }, "project");

    const result = loadProfile("dev");
    expect(result?.accessKey).toBe("pak");
    expect(result?.secretKey).toBe("psk");
  });

  it("loadProfile returns null for missing profile", async () => {
    const { loadProfile } = await loadModule();
    expect(loadProfile("nonexistent")).toBeNull();
  });

  it("loadProfile returns null for malformed JSON", async () => {
    const { loadProfile } = await loadModule();
    const dir = path.join(projectDir, ".001k", "profiles");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "bad.json"), "not-json{{{");

    expect(loadProfile("bad")).toBeNull();
  });

  it("loadProfile returns null for missing required fields", async () => {
    const { loadProfile } = await loadModule();
    const dir = path.join(projectDir, ".001k", "profiles");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "partial.json"),
      JSON.stringify({ accessKey: "only-one" }),
    );

    expect(loadProfile("partial")).toBeNull();
  });

  it("deleteProfile removes the file", async () => {
    const { saveProfile, deleteProfile } = await loadModule();
    saveProfile("temp", { accessKey: "a", secretKey: "b" }, "global");

    const result = deleteProfile("temp");
    expect(result).toBe(true);

    const filePath = path.join(homeDir, ".001k", "profiles", "temp.json");
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("project scope is checked before global", async () => {
    const { saveProfile, loadProfile } = await loadModule();
    saveProfile("main", { accessKey: "global-ak", secretKey: "global-sk" }, "global");
    saveProfile("main", { accessKey: "project-ak", secretKey: "project-sk" }, "project");

    const result = loadProfile("main");
    expect(result?.accessKey).toBe("project-ak");
  });

  it("deleteProfile removes a project-scoped profile", async () => {
    const { saveProfile, deleteProfile } = await loadModule();
    saveProfile("proj-temp", { accessKey: "pa", secretKey: "pb" }, "project");

    const filePath = path.join(projectDir, ".001k", "profiles", "proj-temp.json");
    expect(fs.existsSync(filePath)).toBe(true);

    const result = deleteProfile("proj-temp");
    expect(result).toBe(true);
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("listProfiles returns profiles from both scopes", async () => {
    const { saveProfile, listProfiles } = await loadModule();
    saveProfile("alpha", { accessKey: "a", secretKey: "b" }, "global");
    saveProfile("beta", { accessKey: "c", secretKey: "d" }, "project");

    const profiles = listProfiles();
    const names = profiles.map((p: { name: string }) => p.name).sort();
    expect(names).toEqual(["alpha", "beta"]);
  });
});
