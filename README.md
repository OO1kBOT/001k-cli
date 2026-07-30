# 001k-cli

**English** · [Русский](README.ru.md) · [Українська](README.uk.md)

CLI and AI-agent skill for [001k.bot](https://001k.bot) — deposits, withdrawals, swaps, transfers, limit orders, and AML checks.

[![npm version](https://img.shields.io/npm/v/001k-cli)](https://www.npmjs.com/package/001k-cli)
[![CI](https://github.com/OO1kBOT/001k-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/OO1kBOT/001k-cli/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/001k-cli)](./LICENSE)

- 🌐 Website: <https://001k.bot>
- 📖 API docs: <https://docs.001k.bot>
- 💬 Telegram: [@OO1kBOT](https://t.me/OO1kBOT)

> **⚠️ Disclaimer.** `001k-cli` is an official 001k tool that executes real financial
> operations (deposits, withdrawals, swaps, transfers). It is provided **"AS IS",
> without warranty of any kind** (see [LICENSE](./LICENSE)). Use at your own risk;
> nothing here is financial advice. Always review state-changing commands before running them.

---

## Features

- **Full API coverage** — deposits, withdrawals, swaps, transfers, limit orders, AML checks, balance, and ledger.
- **AI-agent skill included** — a bundled skill (`001k-cli`) drives the CLI from Claude Code and any agent in natural language.
- **Secure by design** — HMAC-SHA256 request signing; your secret key is used only locally and never transmitted or logged.
- **Multi-profile** — named credential profiles in `~/.001k/` (global) or `./.001k/` (project), selected with `--profile`.
- **HTTPS-enforced** — the CLI refuses to send credentials over anything but `https://`.
- **JSON output** — structured JSON on stdout with a clear exit-code contract (0/1/2/3) — pipe into `jq` or any automation.
- **CI/CD friendly** — supply credentials via `OO1K_ACCESS_KEY` / `OO1K_SECRET_KEY` environment variables for non-interactive pipelines.

---

## Quick Start

```bash
# 1. Install the CLI globally
npm install -g 001k-cli
# or with another package manager:
# pnpm add -g 001k-cli  |  yarn global add 001k-cli  |  bun add -g 001k-cli

# 2. Authenticate (interactive prompt for access key and secret key)
001k auth login

# 3. (Optional) Install the AI-agent skill for Claude Code
npx skills add OO1kBOT/001k-cli
```

## How It Works

The project ships two layers:

1. **CLI** (`001k`) — a standalone command-line tool that signs requests with
   HMAC-SHA256, calls the 001k.bot API, and returns structured JSON.
2. **Skill** (`001k-cli`) — an instruction set that teaches an AI agent (e.g. Claude
   Code) *when* and *how* to call the CLI. The agent reads the skill, interprets
   natural-language requests, and translates them into `001k` commands.

All secrets stay local. The CLI signs requests with your HMAC keys; neither the skill
nor the agent ever sees raw credentials.

---

## Commands

Usage: `001k <entity> <action> [--flag value]`

### Auth

| Action        | Description                     |
| ------------- | ------------------------------- |
| `auth login`  | Interactive login, saves a profile |
| `auth logout` | Remove a saved profile          |
| `auth status` | Show current auth status        |
| `auth list`   | List saved profiles             |

### General

| Command    | Description                |
| ---------- | -------------------------- |
| `status`   | Check API availability     |
| `currency` | List supported currencies  |
| `balance`  | Show account balances      |
| `ledger`   | Show ledger entries        |

### Deposit

| Action                       | Description                      |
| ---------------------------- | -------------------------------- |
| `deposit methods`            | List deposit methods             |
| `deposit list`               | List deposits                    |
| `deposit get`                | Get a deposit by code            |
| `deposit create-address`     | Create a deposit address         |
| `deposit default-address`    | Get the default deposit address  |
| `deposit disposable-address` | Get a disposable deposit address |

### Withdraw

| Action             | Description               |
| ------------------ | ------------------------- |
| `withdraw methods` | List withdrawal methods   |
| `withdraw list`    | List withdrawals          |
| `withdraw get`     | Get a withdrawal by code  |
| `withdraw create`  | Create a withdrawal       |

### Swap

| Action                     | Description                  |
| -------------------------- | ---------------------------- |
| `swap directions`          | List swap directions         |
| `swap list`                | List swaps                   |
| `swap get`                 | Get a swap by internal ID    |
| `swap get-by-code`         | Get a swap by code           |
| `swap get-by-custom-id`    | Get a swap by custom ID      |
| `swap create`              | Create a swap                |
| `swap cancel`              | Cancel a swap                |
| `swap cancel-by-code`      | Cancel a swap by code        |
| `swap cancel-by-custom-id` | Cancel a swap by custom ID   |

### Transfer

| Action            | Description               |
| ----------------- | ------------------------- |
| `transfer list`   | List transfers            |
| `transfer get`    | Get a transfer by code    |
| `transfer create` | Create a transfer         |

### Limit Order

| Action               | Description               |
| -------------------- | ------------------------- |
| `limit-order pairs`  | List trading pairs        |
| `limit-order list`   | List limit orders         |
| `limit-order get`    | Get a limit order by code |
| `limit-order create` | Create a limit order      |
| `limit-order cancel` | Cancel a limit order      |

### AML

| Action       | Description             |
| ------------ | ----------------------- |
| `aml list`   | List AML checks         |
| `aml get`    | Get an AML check by code |
| `aml plan`   | List AML plans          |
| `aml token`  | List AML tokens         |
| `aml create` | Create an AML check     |

### Utility

| Command       | Description                                        |
| ------------- | -------------------------------------------------- |
| `cli-check --required-version <ver>`   | Compare the CLI version against a required version |
| `skill-check --required-version <ver>` | Check whether the skill needs updating (pass the skill's own version) |

Global flags: `--profile <name>`, `--profile-path <file>`, `--help`, `--version`.

---

## Authentication

```bash
# Interactive login — prompts for access key and secret key
001k auth login

# Named profile / project scope
001k auth login --profile staging
001k auth login --scope project
```

Credentials resolve in this order (first match wins):

1. `--profile <name>`
2. `--profile-path <file>`
3. Auto-select if exactly one profile exists
4. Error if multiple profiles exist (specify `--profile`)
5. `OO1K_ACCESS_KEY` / `OO1K_SECRET_KEY` environment variables (CI/CD)

Profiles are stored as JSON with owner-only permissions:

- Global: `~/.001k/profiles/<name>.json`
- Project: `./.001k/profiles/<name>.json` (overrides a global profile of the same name)

> Keys are stored **unencrypted** at rest (files `0600`). Don't sync `~/.001k/` to
> cloud backups, and use least-privilege keys. See [SECURITY.md](./SECURITY.md).

## Configuration

| Variable     | Default                  | Description                          |
| ------------ | ------------------------ | ------------------------------------ |
| `OO1K_ACCESS_KEY` | —                        | API access key (CI/CD only)          |
| `OO1K_SECRET_KEY` | —                        | API secret key (CI/CD only)          |
| `OO1K_BASE_URL`   | `https://api.001k.world` | API base URL (must be `https://`)    |

For local use, prefer `001k auth login` over environment variables. The base URL must
use HTTPS (localhost is exempt for testing).

---

## Using with AI Agents

The skill works with **any AI agent that can run shell commands** — Claude Code, Cursor, Windsurf, Codex, and more. After installing it, the agent translates natural language into CLI calls.

| Prompt                          | CLI command                                             |
| ------------------------------- | ------------------------------------------------------- |
| "Check my balance"              | `001k balance`                                          |
| "Show swap directions"          | `001k swap directions`                                  |
| "Swap 0.01 BTC to USDT"         | `001k swap create --direction <code> --spend-amount 0.01` |
| "List my recent deposits"       | `001k deposit list --limit 10`                          |
| "Cancel limit order ABC123"     | `001k limit-order cancel --code ABC123`                 |
| "Run an AML check on 0x…"       | `001k aml create --token 1 --address 0x…`               |

> `--direction` for swaps is the `code` from `001k swap directions` (not a human pair
> name). `--token` for AML is the numeric id from `001k aml token`.

### Setup with Claude Code

> `npx skills add` targets Claude Code. Other agents can use the same skill — point them at `skills/001k-cli/SKILL.md` and load it into the agent context; the CLI and commands are identical.


```bash
# 1. Ensure the CLI is installed and authenticated
001k auth status

# 2. Install the skill
npx skills add OO1kBOT/001k-cli

# 3. Start Claude Code and ask
claude
> Check my balance and show recent swaps
```

---

## Development

Requires Node.js >= 24.

```bash
npm ci                  # install dependencies
npm run build           # compile to dist/
npm run dev -- status   # run from source via tsx
npm run typecheck       # tsc --noEmit (src + tests)
npm test                # run tests
npm run test:coverage
```

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Troubleshooting

- **`No profile found.` / `No credentials found`** — run `001k auth login`, or set
  `OO1K_ACCESS_KEY` / `OO1K_SECRET_KEY`. Verify with `001k auth status`.
- **`ECONNREFUSED` / `ENOTFOUND` / `ETIMEDOUT`** — check your connection and that
  `OO1K_BASE_URL` is reachable (default `https://api.001k.world`). Network failures
  exit with code 3 and print `{ "network_error": true, "message": "..." }` to stderr.
- **Insecure base URL error** — `OO1K_BASE_URL` must use `https://` (localhost is exempt).
- **Node version** — the CLI requires Node.js 24+ (`node --version`).

API errors are returned as structured JSON with a code and message. Pass `--help` for flags.

## Security

Report vulnerabilities privately — see [SECURITY.md](./SECURITY.md). Never paste API keys into issues.

## License

[Apache-2.0](./LICENSE) © 001k bot
