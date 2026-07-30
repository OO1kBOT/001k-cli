# Authentication

Credentials are stored in **profiles**. The user configures profiles independently
in their terminal. The agent never sees API keys — only profile names.

## CRITICAL: Agent Must Not Run Login

`001k auth login` requires interactive stdin input. The agent **cannot** run this
command. When authentication is needed, show the user these instructions:

---

**Setup instructions to show the user (copy EXACTLY, do not modify or add anything):**

```
To use the 001k API, you need to set up a profile with your API credentials.
This is done once, directly in your terminal (for security, I don't have
access to API keys).

Steps:
1. Get your API keys from your 001k.bot dashboard
2. Open a terminal and run:
   001k auth login
3. The CLI will prompt you for 5 things:
   - Profile name (press Enter for "default")
   - Access Key
   - Secret Key
   - API URL (press Enter for default https://api.001k.world)
   - Save location: global or project (press Enter for global)
4. After successful login, I can perform API operations

Check status:  001k auth status
List profiles: 001k auth list
```

**IMPORTANT: There is NO email, NO password, NO 2FA, NO OAuth in this CLI.
Authentication uses API access keys only. Do not mention email, password,
two-factor authentication, or any other auth method — they do not exist here.**

---

## Login (user runs manually)

```bash
001k auth login [--profile <name>] [--scope project|global]
```

| Flag        | Default   | Description                                                                    |
| ----------- | --------- | ------------------------------------------------------------------------------ |
| `--profile` | `default` | Profile name (can also be entered interactively)                               |
| `--scope`   | `global`  | `project` (cwd) or `global` (home directory, can also be chosen interactively) |

All other values are entered interactively via stdin prompts:
profile name, access key, secret key, API URL, and save location.
The command verifies the credentials with an authenticated request (`GET /api/v1/balance`) before saving.

## Logout

```bash
001k auth logout [--profile <name>]
```

Deletes the named profile. Default: `default`.

**Response:**

```json
{ "message": "Profile 'default' removed.", "deleted": true }
```

If the profile does not exist:

```json
{ "message": "Profile 'default' not found.", "deleted": false }
```

## Status

```bash
001k auth status [--profile <name>]
```

Shows profile info with masked access key. Verifies against API.

**Response:**

```json
{
  "authenticated": true,
  "profile": "default",
  "accessKey": "6Au0****7KMu",
  "baseUrl": "https://api.001k.world"
}
```

## List Profiles

```bash
001k auth list
```

Lists all configured profiles from both project and global scopes.

**Response:**

```json
[
  { "name": "default", "scope": "global" },
  { "name": "staging", "scope": "project" }
]
```

## Profile Selection by the Agent

When running authenticated commands, the agent uses `--profile <name>`:

```bash
001k balance --profile production
001k swap create --profile production --direction BTC-USDT --spend-amount 0.01
```

**Priority for profile resolution:**

1. `--profile <name>` flag (explicit)
2. `--profile-path <path>` flag (arbitrary file location)
3. If exactly 1 profile exists → used automatically
4. If multiple profiles → error listing available profiles (agent must ask user)
5. `OO1K_ACCESS_KEY` / `OO1K_SECRET_KEY` env vars (CI/CD fallback, no profile needed)

## Notes

- Profiles are stored at `~/.001k/profiles/{name}.json` (global) or
  `.001k/profiles/{name}.json` (project scope).
- Profile files have `0o600` permissions (owner-only read/write).
- Add `.001k/` to `.gitignore` to prevent accidental secret commits.
- Access keys are masked in status output (first 4 + `****` + last 4).
