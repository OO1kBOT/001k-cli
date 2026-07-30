# Transfer (Internal)

All transfer commands require authentication. Transfers move funds between
accounts on the 001k.bot platform.

## List Transfers

```bash
001k transfer list [--code <code>] [--currency <c>] [--recipient-uid <uid>]
  [--sender-uid <uid>] [--custom-id <id>] [--role <role>] [--status <s>]
  [--start-at <iso>] [--end-at <iso>] [--limit <n>] [--offset <n>] [--ordering <field>]
```

All flags are optional. Returns a paginated list of transfers.

| Notable Flag | Description |
|-------------|-------------|
| `--role` | Filter by your role: `sender` or `recipient` |
| `--recipient-uid` | Filter by recipient UID |
| `--sender-uid` | Filter by sender UID |

## Get Transfer

```bash
001k transfer get --code <code>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | yes | Transfer code |

## Create Transfer

```bash
001k transfer create --currency-code <code> --amount <amount> --recipient <uid>
  [--custom-id <id>] [--callback-url <url>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--currency-code` | yes | Currency code (e.g. `USDT`) |
| `--amount` | yes | Amount to transfer |
| `--recipient` | yes | Recipient user UID |
| `--custom-id` | no | Your custom identifier |
| `--callback-url` | no | Webhook URL for status updates |

**Example:**

```bash
001k transfer create --currency-code USDT --amount 50 --recipient usr_abc123
```

**Example response:**

```json
{
  "code": "TR-def456",
  "currency": "USDT",
  "amount": "50.00",
  "recipient": "usr_abc123",
  "status": "success",
  "created_at": "2025-06-01T12:00:00Z"
}
```

## Transfer Statuses

`pending` | `rejected` | `success`
