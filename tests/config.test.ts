import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/credentials.js", async () =>
  (await import("./mocks/credentials.js")).credentialsMock());

import { loadConfig } from "../src/config.js";
import {
  loadProfile,
  loadProfileFromPath,
  listProfiles,
} from "../src/credentials.js";

const mockedLoadProfile = loadProfile as ReturnType<typeof vi.fn>;
const mockedLoadProfileFromPath = loadProfileFromPath as ReturnType<
  typeof vi.fn
>;
const mockedListProfiles = listProfiles as ReturnType<typeof vi.fn>;

beforeEach(() => {
  // resetAllMocks (not clearAllMocks): wipes mockReturnValue set by a previous
  // test, so re-establish the "no profiles" defaults explicitly.
  vi.resetAllMocks();
  mockedLoadProfile.mockReturnValue(null);
  mockedLoadProfileFromPath.mockReturnValue(null);
  mockedListProfiles.mockReturnValue([]);
  delete process.env.OO1K_ACCESS_KEY;
  delete process.env.OO1K_SECRET_KEY;
  delete process.env.OO1K_BASE_URL;
});

describe("loadConfig", () => {
  it("profile credentials take precedence over env vars", () => {
    process.env.OO1K_ACCESS_KEY = "env-ak";
    process.env.OO1K_SECRET_KEY = "env-sk";
    mockedListProfiles.mockReturnValue([{ name: "default", scope: "global" }]);
    mockedLoadProfile.mockReturnValue({
      accessKey: "cred-ak",
      secretKey: "cred-sk",
    });

    const config = loadConfig({});

    expect(config.accessKey).toBe("cred-ak");
    expect(config.secretKey).toBe("cred-sk");
  });

  it("env vars used as fallback when no profile exists", () => {
    process.env.OO1K_ACCESS_KEY = "env-ak";
    process.env.OO1K_SECRET_KEY = "env-sk";
    mockedListProfiles.mockReturnValue([]);
    mockedLoadProfile.mockReturnValue(null);

    const config = loadConfig({});

    expect(config.accessKey).toBe("env-ak");
    expect(config.secretKey).toBe("env-sk");
  });

  it("--profile flag selects a named profile", () => {
    mockedLoadProfile.mockReturnValue({
      accessKey: "prof-ak",
      secretKey: "prof-sk",
    });

    const config = loadConfig({ profile: "staging" });

    expect(mockedLoadProfile).toHaveBeenCalledWith("staging");
    expect(config.accessKey).toBe("prof-ak");
    expect(config.secretKey).toBe("prof-sk");
  });

  it("auto-selects single profile when no flag given", () => {
    mockedListProfiles.mockReturnValue([{ name: "solo", scope: "global" }]);
    mockedLoadProfile.mockReturnValue({
      accessKey: "solo-ak",
      secretKey: "solo-sk",
    });

    const config = loadConfig({});

    expect(mockedLoadProfile).toHaveBeenCalledWith("solo");
    expect(config.accessKey).toBe("solo-ak");
  });

  it("default baseUrl is https://api.001k.world", () => {
    process.env.OO1K_ACCESS_KEY = "env-ak";
    process.env.OO1K_SECRET_KEY = "env-sk";

    const config = loadConfig({});

    expect(config.baseUrl).toBe("https://api.001k.world");
  });

  it("throws when multiple profiles exist and no flag given", () => {
    mockedListProfiles.mockReturnValue([
      { name: "a", scope: "global" },
      { name: "b", scope: "project" },
    ]);

    expect(() => loadConfig({})).toThrow("Multiple profiles found");
  });

  it("--profile-path flag loads credentials from a custom file path", () => {
    mockedLoadProfileFromPath.mockReturnValue({
      accessKey: "path-ak",
      secretKey: "path-sk",
    });

    const config = loadConfig({ "profile-path": "/tmp/custom-creds.json" });

    expect(mockedLoadProfileFromPath).toHaveBeenCalledWith(
      "/tmp/custom-creds.json",
    );
    expect(config.accessKey).toBe("path-ak");
    expect(config.secretKey).toBe("path-sk");
  });
});
