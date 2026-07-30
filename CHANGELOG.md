# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-29

Initial public release of **001k-cli** — a command-line client for 001k.bot
(binary `001k`) together with a bundled AI-agent skill for driving it.

### Added

**CLI**

- Entity/action command structure — `001k <entity> <action> [--flag value]`,
  plus `--help` and `--version`.
- Authentication & profiles: `auth login` (interactive), `auth logout`,
  `auth status`, `auth list`. Named profiles in global (`~/.001k/`) and project
  (`./.001k/`) scopes; project scope overrides global.
- Account: `status` (API health), `currency`, `balance`, `ledger`.
- Deposits: `deposit methods | list | get | create-address | default-address | disposable-address`.
- Withdrawals: `withdraw methods | list | get | create`.
- Swaps: `swap directions | list | get | get-by-code | get-by-custom-id | create | cancel | cancel-by-code | cancel-by-custom-id`.
- Transfers: `transfer list | get | create`.
- Limit orders: `limit-order pairs | list | get | create | cancel`.
- AML: `aml list | get | plan | token | create`.
- Preflight utilities: `cli-check` and `skill-check --required-version <v>`
  (compares the skill's version against the installed CLI and reports
  `needUpdateSkill: true` when the skill is older).
- Structured JSON output on stdout; exit codes: `0` success, `1` API error,
  `2` CLI error, `3` network error (transport failures — DNS, connection
  refused, timeout — are typed and mapped to exit 3).
- Global flags: `--profile`, `--profile-path`.

**Authentication & security**

- HMAC-SHA256 request signing; the secret key is used only locally and is never
  transmitted or logged.
- Credential resolution order: `--profile` → `--profile-path` → single-profile
  auto-select → `OO1K_ACCESS_KEY` / `OO1K_SECRET_KEY` environment variables
  (for CI/CD); API base URL override via `OO1K_BASE_URL`.
- Profiles stored as JSON with owner-only permissions (files `0600`, dirs `0700`),
  re-applied on every save.
- HTTPS enforced on the API base URL (localhost exempt for local testing).
- Access keys masked in `auth status` output.

**AI-agent skill (`skills/001k-cli` — "001k CLI Skill")**

- `SKILL.md` with a full command routing matrix, preflight checks, display rules,
  a security policy, and composite multi-step scenarios.
- Per-entity reference docs under `references/`.
- Discovery triggers in English and Russian (including Cyrillic variants).
- One-command install: `npx skills add OO1kBOT/001k-cli`.

[1.0.0]: https://github.com/OO1kBOT/001k-cli/releases/tag/v1.0.0
