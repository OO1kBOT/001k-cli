import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveProfile } from "../src/resolve-profile.js";
import { loadProfile, loadProfileFromPath, listProfiles } from "../src/credentials.js";

vi.mock("../src/credentials.js", () => ({
  loadProfile: vi.fn(() => null),
  loadProfileFromPath: vi.fn(() => null),
  listProfiles: vi.fn(() => []),
}));

const mockLoadProfile = loadProfile as ReturnType<typeof vi.fn>;
const mockLoadProfileFromPath = loadProfileFromPath as ReturnType<typeof vi.fn>;
const mockListProfiles = listProfiles as ReturnType<typeof vi.fn>;

describe("resolveProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("--profile flag", () => {
    it("selects a named profile", () => {
      const cred = { apiKey: "key-123", apiSecret: "secret" };
      mockLoadProfile.mockReturnValueOnce(cred);

      const result = resolveProfile({ profile: "main" });

      expect(loadProfile).toHaveBeenCalledWith("main");
      expect(result).toEqual({ name: "main", data: cred });
    });

    it("returns null if profile not found", () => {
      mockLoadProfile.mockReturnValueOnce(null);

      const result = resolveProfile({ profile: "missing" });

      expect(result).toBeNull();
    });
  });

  describe("--profile-path flag", () => {
    it("loads from a custom json path", () => {
      const cred = { apiKey: "k", apiSecret: "s" };
      mockLoadProfileFromPath.mockReturnValueOnce(cred);

      const result = resolveProfile({ "profile-path": "/tmp/my.json" });

      expect(loadProfileFromPath).toHaveBeenCalledWith("/tmp/my.json");
      expect(result).toEqual({ name: "(custom path)", data: cred });
    });

    it("returns null if path profile not found", () => {
      mockLoadProfileFromPath.mockReturnValueOnce(null);

      const result = resolveProfile({ "profile-path": "/tmp/empty.json" });

      expect(result).toBeNull();
    });

    it("throws if path does not end with .json", () => {
      expect(() =>
        resolveProfile({ "profile-path": "/tmp/creds.yaml" }),
      ).toThrow("--profile-path must point to a .json file");
    });
  });

  describe("auto-select", () => {
    it("selects the only available profile", () => {
      const cred = { apiKey: "k", apiSecret: "s" };
      mockListProfiles.mockReturnValueOnce([{ name: "default", scope: "user" }]);
      mockLoadProfile.mockReturnValueOnce(cred);

      const result = resolveProfile({});

      expect(loadProfile).toHaveBeenCalledWith("default");
      expect(result).toEqual({ name: "default", data: cred });
    });

    it("throws when multiple profiles exist", () => {
      mockListProfiles.mockReturnValueOnce([
        { name: "alice", scope: "user" },
        { name: "bob", scope: "project" },
      ]);

      expect(() => resolveProfile({})).toThrow(
        /Multiple profiles found/,
      );
    });

    it("returns null when no profiles exist", () => {
      mockListProfiles.mockReturnValueOnce([]);

      const result = resolveProfile({});

      expect(result).toBeNull();
    });
  });
});
