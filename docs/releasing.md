# Releasing

1. Ensure `main` is green: `npm run typecheck && npm run build && npm test`.
2. Bump the version **in lockstep**:
   - `package.json` (`version`)
   - `skills/001k-cli/SKILL.md` frontmatter (`version`, `requiredCliVersion`)
   - `skills/001k-cli/references/preflight.md` (pinned version examples)
3. Add a new section to `CHANGELOG.md`.
4. Tag the release: `npm version <x.y.z>` (or `git tag vX.Y.Z`).
5. `git push && git push --tags`.

Pushing a `v*` tag triggers `.github/workflows/publish.yml`, which verifies the tag
matches `package.json`, builds, tests, publishes to npm with provenance
(`--provenance`), and creates a GitHub Release. Requires the `NPM_TOKEN` secret.
