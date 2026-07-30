// Stamp package.json's version into the skill docs. Run automatically by the
// npm `version` lifecycle hook so the CLI and skill versions never drift.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function patch(rel, replacers) {
  const path = join(root, rel);
  let text = readFileSync(path, "utf8");
  for (const [re, repl] of replacers) text = text.replace(re, repl);
  writeFileSync(path, text);
  console.log(`synced ${rel} -> ${version}`);
}

patch("skills/001k-cli/SKILL.md", [
  [/^(\s*version:\s*")[^"]*(")/m, `$1${version}$2`],
  [/^(\s*requiredCliVersion:\s*")[^"]*(")/m, `$1${version}$2`],
]);

patch("skills/001k-cli/references/preflight.md", [
  [/001k-cli@[0-9]+\.[0-9]+\.[0-9]+/g, `001k-cli@${version}`],
  [/--required-version [0-9]+\.[0-9]+\.[0-9]+/g, `--required-version ${version}`],
  [/("(?:currentVersion|requiredVersion|skillVersion)":\s*")[0-9]+\.[0-9]+\.[0-9]+(")/g, `$1${version}$2`],
  [/(version satisfies `)[0-9]+\.[0-9]+\.[0-9]+(`)/g, `$1${version}$2`],
]);
