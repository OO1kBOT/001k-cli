import { loadProfile, loadProfileFromPath, listProfiles, type CredentialData } from "./credentials.js";

export interface ResolvedProfile {
  name: string;
  data: CredentialData;
}

/**
 * Resolve which profile to use. Shared by all commands.
 *
 * Priority:
 * 1. --profile <name> flag
 * 2. --profile-path <path> flag
 * 3. Auto-select if exactly 1 profile exists
 * 4. Error if multiple profiles
 * 5. null if no profiles
 */
export function resolveProfile(
  flags: Record<string, string | boolean>,
): ResolvedProfile | null {
  if (typeof flags["profile"] === "string") {
    const name = flags["profile"];
    const data = loadProfile(name);
    if (!data) return null;
    return { name, data };
  }

  if (typeof flags["profile-path"] === "string") {
    const filePath = flags["profile-path"];
    if (!filePath.endsWith(".json")) {
      throw new Error("--profile-path must point to a .json file");
    }
    const data = loadProfileFromPath(filePath);
    if (!data) return null;
    return { name: "(custom path)", data };
  }

  const profiles = listProfiles();
  if (profiles.length === 1) {
    const name = profiles[0].name;
    const data = loadProfile(name);
    if (!data) return null;
    return { name, data };
  }
  if (profiles.length > 1) {
    const names = profiles.map((p) => `  ${p.name} (${p.scope})`).join("\n");
    throw new Error(
      `Multiple profiles found. Specify one with --profile <name>:\n${names}`,
    );
  }

  return null;
}
