# Architecture

`001k-cli` ships two layers from one repository:

1. **CLI** (`001k`, `src/`) — a Node.js/TypeScript command-line tool.
2. **Agent skill** (`skills/001k-cli/`) — instructions that teach an AI agent to
   drive the CLI.

## Module map

| File | Responsibility |
| ---- | -------------- |
| `src/cli.ts` | Entry point / bin; top-level routing and error boundary. |
| `src/parse-args.ts` | `parseArgs` — argv to `{ entity, action, flags }` (unit-tested). |
| `src/commands/*.ts` | One module per entity (auth, deposit, withdraw, swap, ...). |
| `src/client.ts` | `ApiClient` — HMAC signing, HTTPS enforcement, fetch, error mapping. |
| `src/credentials.ts` | Profile storage (`~/.001k/`, `./.001k/`), `0600`/`0700`. |
| `src/resolve-profile.ts` | Profile-selection priority chain. |
| `src/config.ts` | Merge profile + env into `{ accessKey, secretKey, baseUrl }`. |
| `src/output.ts` | JSON writers + exit codes (0/1/2/3). |
| `src/preflight.ts` | `cli-check` / `skill-check` version helpers. |

## Request flow

```
001k <entity> <action> --flags
  -> parseArgs -> route in cli.ts
  -> command builds params/body -> initClient (loadConfig -> resolveProfile)
  -> ApiClient signs (HMAC) + sends over HTTPS
  -> output.writeSuccess (stdout JSON, exit 0) or an error writer (exit 1/2/3)
```

## Credentials

Resolution order: `--profile` -> `--profile-path` -> single-profile auto-select ->
`OO1K_ACCESS_KEY`/`OO1K_SECRET_KEY` env. Secrets never leave the machine except as an HMAC
signature. See [request-signing.md](./request-signing.md) and [../SECURITY.md](../SECURITY.md).
