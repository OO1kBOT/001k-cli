# AML (Anti-Money Laundering)

All AML commands require authentication.

## List Checks

```bash
001k aml list [--code <code>] [--custom-id <id>] [--plan <plan>]
  [--transaction <tx>] [--address <addr>] [--token <token>]
  [--status <s>]
  [--start-at <iso>] [--end-at <iso>] [--limit <n>] [--offset <n>] [--ordering <field>]
```

All flags are optional. Returns a paginated list of AML checks.

## Get Check

```bash
001k aml get --code <code>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | yes | AML check code |

## List Plans

```bash
001k aml plan [--code <code>] [--check-type <type>] [--ordering <field>]
  [--limit <n>] [--offset <n>]
```

Lists available AML check plans. All flags are optional.

## List Tokens

```bash
001k aml token [--id <id>] [--symbol <sym>] [--ordering <field>]
  [--limit <n>] [--offset <n>]
```

Lists blockchain tokens supported for AML checks. All flags are optional.

## Create Check

```bash
001k aml create --token <id> --address <addr>
  [--transaction <tx>] [--custom-id <id>] [--callback-url <url>]
```

Two modes:
- **Address check** (no `--transaction`): `direction` is always `"withdrawal"` automatically.
- **Transaction check** (`--transaction` provided): you must specify `--direction deposit` or `--direction withdrawal` to indicate which side of the transaction to check.

| Flag | Required | Description |
|------|----------|-------------|
| `--token` | yes | Token ID (numeric, from `aml token`) |
| `--address` | yes | Blockchain address to check |
| `--transaction` | no | Transaction hash (triggers transaction check mode) |
| `--direction` | only with `--transaction` | `deposit` or `withdrawal` — which side to check |
| `--custom-id` | no | Your custom identifier |
| `--callback-url` | no | Webhook URL for result notification |

**Example (address check):**

```bash
001k aml create --token 1 --address bc1q...
```

**Example response:**

```json
{
  "code": "AML-jkl012",
  "direction": "withdrawal",
  "token": 1,
  "address": "bc1q...",
  "status": "pending",
  "created_at": "2025-06-01T12:00:00Z"
}
```

## Check Statuses

`queued` | `pending` | `success` | `failed`
