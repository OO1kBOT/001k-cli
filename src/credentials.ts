import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface CredentialData {
  accessKey: string;
  secretKey: string;
  baseUrl?: string;
}

const GLOBAL_PROFILES_DIR = path.join(os.homedir(), ".001k", "profiles");
const PROJECT_PROFILES_DIR = path.join(process.cwd(), ".001k", "profiles");

const VALID_PROFILE_NAME = /^[a-zA-Z0-9_-]+$/;

function profilePath(name: string, scope: "project" | "global"): string {
  if (!VALID_PROFILE_NAME.test(name)) {
    throw new Error(
      `Invalid profile name "${name}". Use only letters, digits, hyphens, and underscores.`,
    );
  }
  const dir = scope === "project" ? PROJECT_PROFILES_DIR : GLOBAL_PROFILES_DIR;
  const resolved = path.resolve(dir, `${name}.json`);
  if (!resolved.startsWith(path.resolve(dir) + path.sep)) {
    throw new Error("Invalid profile name");
  }
  return resolved;
}

function isValid(parsed: unknown): parsed is CredentialData {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    typeof (parsed as Record<string, unknown>).accessKey === "string" &&
    typeof (parsed as Record<string, unknown>).secretKey === "string"
  );
}

function readJson(filePath: string): CredentialData | null {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProfile(
  name: string,
  data: CredentialData,
  scope: "project" | "global",
): void {
  const filePath = profilePath(name, scope);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  // writeFileSync's `mode` is ignored when the file already exists, and the
  // directory may have pre-existed with looser permissions — enforce explicitly
  // so credentials are never left group/other-readable.
  fs.chmodSync(dir, 0o700);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.chmodSync(filePath, 0o600);
}

export function loadProfile(name: string): CredentialData | null {
  return readJson(profilePath(name, "project")) ?? readJson(profilePath(name, "global"));
}

export function loadProfileFromPath(filePath: string): CredentialData | null {
  return readJson(filePath);
}

export function deleteProfile(name: string): boolean {
  const projectFile = profilePath(name, "project");
  if (fs.existsSync(projectFile)) {
    fs.unlinkSync(projectFile);
    return true;
  }
  const globalFile = profilePath(name, "global");
  if (fs.existsSync(globalFile)) {
    fs.unlinkSync(globalFile);
    return true;
  }
  return false;
}

function listDir(dir: string, scope: "project" | "global"): { name: string; scope: "project" | "global" }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ name: f.replace(/\.json$/, ""), scope }));
}

export function listProfiles(): { name: string; scope: "project" | "global" }[] {
  return [
    ...listDir(PROJECT_PROFILES_DIR, "project"),
    ...listDir(GLOBAL_PROFILES_DIR, "global"),
  ];
}
