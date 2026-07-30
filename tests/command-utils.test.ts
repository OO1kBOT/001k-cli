import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/credentials.js", async () =>
  (await import("./mocks/credentials.js")).credentialsMock());

import { callApi, initClient, initPublicClient } from "../src/command-utils.js";
import { ApiError, NetworkError } from "../src/client.js";
import { DEFAULT_BASE_URL } from "../src/constants.js";
import { captureProcess, expectExit, lastJson, type CapturedProcess } from "./exit-helper.js";

let proc: CapturedProcess;

beforeEach(() => {
  proc = captureProcess();
  delete process.env.OO1K_ACCESS_KEY;
  delete process.env.OO1K_SECRET_KEY;
  delete process.env.OO1K_BASE_URL;
});

afterEach(() => {
  proc.restore();
  vi.unstubAllGlobals();
});

describe("callApi", () => {
  it("writes the result as JSON and exits 0", async () => {
    await expectExit(() => callApi(async () => ({ balance: "1" })), 0);
    expect(lastJson(proc.out)).toEqual({ balance: "1" });
  });

  it("propagates ApiError/NetworkError to the caller (cli.ts boundary)", async () => {
    await expect(callApi(async () => { throw new ApiError(400, {}); }))
      .rejects.toBeInstanceOf(ApiError);
    await expect(callApi(async () => { throw new NetworkError("down"); }))
      .rejects.toBeInstanceOf(NetworkError);
    expect(proc.out).toHaveLength(0);
    expect(proc.err).toHaveLength(0);
  });
});

describe("initClient", () => {
  it("throws when no credentials are available", () => {
    expect(() => initClient({})).toThrow(/No credentials found/);
  });

  it("builds a client from OO1K_* env vars", () => {
    process.env.OO1K_ACCESS_KEY = "ak";
    process.env.OO1K_SECRET_KEY = "sk";
    expect(() => initClient({})).not.toThrow();
  });
});

describe("initPublicClient", () => {
  it("uses OO1K_BASE_URL when no profile provides one", () => {
    process.env.OO1K_BASE_URL = "http://example.com";
    // Insecure URL proves the env var reached the client constructor.
    expect(() => initPublicClient()).toThrow(/Insecure base URL/);
  });

  it("falls back to the default base URL", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await initPublicClient().getPublic("/api/v1/currency");

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin).toBe(DEFAULT_BASE_URL);
  });
});
