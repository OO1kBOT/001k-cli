import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const prompts: string[] = [];

vi.mock("node:readline/promises", () => ({
  default: {
    createInterface: () => ({
      question: vi.fn(async () => {
        const next = prompts.shift();
        if (next === undefined) throw new Error("unexpected prompt");
        return next;
      }),
      close: vi.fn(),
    }),
  },
}));

vi.mock("../src/credentials.js", async () =>
  (await import("./mocks/credentials.js")).credentialsMock());

import { login, logout, authStatus, authListProfiles } from "../src/commands/auth.js";
import { saveProfile, deleteProfile, listProfiles, loadProfile } from "../src/credentials.js";
import { captureProcess, expectExit, lastJson, type CapturedProcess } from "./exit-helper.js";

const mockedSave = vi.mocked(saveProfile);
const mockedDelete = vi.mocked(deleteProfile);
const mockedList = vi.mocked(listProfiles);
const mockedLoad = vi.mocked(loadProfile);

let proc: CapturedProcess;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // resetAllMocks (not clearAllMocks): mockReturnValue set in one test must
  // not leak into the next. Defaults are re-established explicitly.
  vi.resetAllMocks();
  mockedList.mockReturnValue([]);
  mockedLoad.mockReturnValue(null);
  mockedDelete.mockReturnValue(true);
  prompts.length = 0;
  proc = captureProcess();
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  proc.restore();
  vi.unstubAllGlobals();
});

describe("login", () => {
  it("verifies credentials and saves the profile", async () => {
    // --profile and --scope given -> prompts: access key, secret key, base URL
    prompts.push("ak_1", "sk_1", "");

    await expectExit(() => login({ profile: "work", scope: "project" }), 0);

    expect(mockedSave).toHaveBeenCalledWith(
      "work",
      { accessKey: "ak_1", secretKey: "sk_1", baseUrl: "https://api.001k.world" },
      "project",
    );
    expect(lastJson(proc.out)).toEqual({
      message: "Login successful.",
      profile: "work",
      scope: "project",
    });
  });

  it("empty --profile= falls through to the prompt instead of saving \"\"", async () => {
    // profile flag is "" -> prompts: profile name (empty -> "default"), keys, base URL
    prompts.push("", "ak_1", "sk_1", "");

    await expectExit(() => login({ profile: "", scope: "global" }), 0);

    expect(mockedSave).toHaveBeenCalledWith(
      "default",
      { accessKey: "ak_1", secretKey: "sk_1", baseUrl: "https://api.001k.world" },
      "global",
    );
  });

  it("exits 2 with missing_credentials when a key is empty", async () => {
    prompts.push("default", "", "");

    await expectExit(() => login({}), 2);

    expect(lastJson(proc.err)).toMatchObject({ code: "missing_credentials" });
    expect(mockedSave).not.toHaveBeenCalled();
  });

  it("exits 2 with login_verification_failed when the API rejects the keys", async () => {
    prompts.push("ak_1", "sk_1", "");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 401 }));

    await expectExit(() => login({ profile: "work", scope: "global" }), 2);

    expect(lastJson(proc.err)).toMatchObject({ code: "login_verification_failed" });
    expect(mockedSave).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("removes the resolved profile", async () => {
    mockedList.mockReturnValue([{ name: "solo", scope: "global" }]);
    mockedLoad.mockReturnValue({ accessKey: "a", secretKey: "b" });

    await expectExit(() => logout({}), 0);

    expect(mockedDelete).toHaveBeenCalledWith("solo");
    expect(lastJson(proc.out)).toMatchObject({ deleted: true });
  });

  it("reports when nothing was deleted", async () => {
    mockedDelete.mockReturnValue(false);

    await expectExit(() => logout({}), 0);

    expect(lastJson(proc.out)).toMatchObject({ deleted: false });
  });
});

describe("authStatus", () => {
  it("reports authenticated: false when no profile exists", async () => {
    await expectExit(() => authStatus({}), 0);
    expect(lastJson(proc.out)).toEqual({
      authenticated: false,
      message: "No profile found.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports authenticated: true with a masked key", async () => {
    mockedList.mockReturnValue([{ name: "solo", scope: "global" }]);
    mockedLoad.mockReturnValue({ accessKey: "ak_123456789", secretKey: "sk" });

    await expectExit(() => authStatus({}), 0);

    expect(lastJson(proc.out)).toEqual({
      authenticated: true,
      profile: "solo",
      accessKey: "ak_1****6789",
      baseUrl: "https://api.001k.world",
    });
  });

  it("masks short keys entirely", async () => {
    mockedList.mockReturnValue([{ name: "solo", scope: "global" }]);
    mockedLoad.mockReturnValue({ accessKey: "short", secretKey: "sk" });

    await expectExit(() => authStatus({}), 0);

    expect(lastJson(proc.out)).toMatchObject({ accessKey: "****" });
  });

  it("reports authenticated: false when the API rejects the key", async () => {
    mockedList.mockReturnValue([{ name: "solo", scope: "global" }]);
    mockedLoad.mockReturnValue({ accessKey: "ak_123456789", secretKey: "sk" });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 401 }));

    await expectExit(() => authStatus({}), 0);

    expect(lastJson(proc.out)).toMatchObject({
      authenticated: false,
      error: "API returned 401",
    });
  });
});

describe("authListProfiles", () => {
  it("prints the profile list", async () => {
    mockedList.mockReturnValue([{ name: "a", scope: "project" }]);
    await expectExit(() => authListProfiles(), 0);
    expect(lastJson(proc.out)).toEqual([{ name: "a", scope: "project" }]);
  });
});
