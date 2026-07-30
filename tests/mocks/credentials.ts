import { vi } from "vitest";

/**
 * Shared vi.mock factory for ../src/credentials.js with "no profiles" defaults.
 * Usage (async factory keeps vi.mock hoisting happy):
 *   vi.mock("../src/credentials.js", async () =>
 *     (await import("./mocks/credentials.js")).credentialsMock());
 */
export function credentialsMock() {
  return {
    loadProfile: vi.fn(() => null),
    loadProfileFromPath: vi.fn(() => null),
    listProfiles: vi.fn(() => []),
    saveProfile: vi.fn(),
    deleteProfile: vi.fn(() => true),
  };
}
