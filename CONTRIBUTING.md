# Contributing

Thanks for your interest in improving `001k-cli`.

## Development Setup

Requires **Node.js >= 24**.

```bash
npm ci                  # install exact dependencies from package-lock.json
npm run build           # compile TypeScript to dist/
npm run dev -- status   # run the CLI from source via tsx
```

## Before Opening a Pull Request

```bash
npm run typecheck       # tsc --noEmit (src + tests)
npm test                # vitest run
npm run test:coverage   # aim for the 80% target
```

- Write tests for new behavior.
- Keep changes small and focused; one concern per PR.
- Do **not** commit secrets, `.env`, or anything under `.001k/`.
- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`.

## Project Layout

- `src/` — CLI source. `src/cli.ts` is the entry (arg parsing + routing);
  `src/commands/` one file per entity; `src/client.ts` handles HMAC signing.
- `skills/001k-cli/` — the AI-agent skill (`SKILL.md` + `references/*.md`).
- `tests/` — vitest suites.

## Distribution (two channels, keep them in sync)

- **CLI** ships to npm as `001k-cli` (binary `001k`).
- **Skill** ships from this repo via `npx skills add OO1kBOT/001k-cli`.

Release the skill and CLI together: bump the version in lockstep across
`package.json`, `skills/001k-cli/SKILL.md` (`version` + `requiredCliVersion`),
and `skills/001k-cli/references/preflight.md`, then tag `vX.Y.Z`.

## Reporting Security Issues

See [SECURITY.md](SECURITY.md). Never paste API keys into issues or PRs.
