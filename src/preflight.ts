import { writeSuccess, writeCliError } from "./output.js";
import { getVersion } from "./constants.js";

type Args = Record<string, string | boolean>;

/** true when `current` is older than `required` (exported for tests). */
export function compareVersions(current: string, required: string): boolean {
  const cur = current.split(".").map(s => parseInt(s, 10) || 0);
  const req = required.split(".").map(s => parseInt(s, 10) || 0);

  for (let i = 0; i < Math.max(cur.length, req.length); i++) {
    const c = cur[i] ?? 0;
    const r = req[i] ?? 0;
    if (c < r) return true;
    if (c > r) return false;
  }
  return false;
}

export async function cliCheck(flags: Args): Promise<void> {
  const requiredVersion =
    typeof flags["required-version"] === "string"
      ? flags["required-version"]
      : undefined;

  if (!requiredVersion) {
    writeCliError(
      "Missing --required-version flag.",
      "missing_required_version",
    );
  }

  const currentVersion = getVersion();
  const needUpdate = compareVersions(currentVersion, requiredVersion);

  writeSuccess({
    currentVersion,
    requiredVersion,
    needUpdate,
  });
}

// The skill passes its own version (SKILL.md frontmatter, kept in lockstep
// with the CLI by scripts/sync-version.mjs). Skill older than CLI -> stale.
// The opposite direction (CLI older than skill) is covered by cli-check.
export async function skillCheck(flags: Args): Promise<void> {
  const skillVersion =
    typeof flags["required-version"] === "string"
      ? flags["required-version"]
      : undefined;

  if (!skillVersion) {
    writeCliError(
      "Missing --required-version flag.",
      "missing_required_version",
    );
  }

  const currentVersion = getVersion();
  const needUpdateSkill = compareVersions(skillVersion, currentVersion);

  writeSuccess({
    currentVersion,
    skillVersion,
    needUpdateSkill,
  });
}
