# Withdraw

All withdrawal commands require authentication.

## Methods

```bash
001k withdraw methods [--code <code>] [--ordering <field>]
```

Lists available withdrawal methods. Both flags are optional filters.

## List Withdrawals

```bash
001k withdraw list [--status <s>] [--currency <c>] [--method <m>] [--custom-id <id>]
  [--code <code>] [--address <addr>] [--card-number <num>] [--txid <txid>]
  [--start-at <iso>] [--end-at <iso>] [--limit <n>] [--offset <n>] [--ordering <field>]
```

All flags are optional. Returns a paginated list of withdrawals.

## Get Withdrawal

```bash
001k withdraw get --code <code>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | yes | Withdrawal code |

## Create Withdrawal

```bash
001k withdraw create --currency <code> --method <method> --amount <amount> --address <addr>
  [--receive-mode] [--tag <tag>] [--custom-id <id>] [--callback-url <url>]
  [--address-book-code <code>]
  [--beneficiary-first-name <name>] [--beneficiary-middle-name <name>]
  [--beneficiary-last-name <name>] [--beneficiary-edrpou <code>]
  [--beneficiary-iban <iban>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--currency` | yes | Currency code (e.g. `USDT`) |
| `--method` | yes | Withdrawal method code |
| `--amount` | yes | Amount to withdraw |
| `--address` | yes | Destination address |
| `--receive-mode` | no | Boolean flag — amount is what recipient receives |
| `--tag` | no | Destination tag / memo |
| `--custom-id` | no | Your custom identifier |
| `--callback-url` | no | Webhook URL for status updates |
| `--address-book-code` | no | Address book entry code |
| `--beneficiary-*` | no | Beneficiary details for fiat withdrawals |

**Example:**

```bash
001k withdraw create --currency USDT --method trc20 --amount 100 --address TXyz...
```

**Example response:**

```json
{
  "code": "WD-abc123",
  "status": "moderation",
  "currency": "USDT",
  "amount": "100.00",
  "fee_amount": "1.00",
  "address": "TXyz...",
  "method": "trc20",
  "created_at": "2025-06-01T12:00:00Z"
}
```

## Withdrawal Statuses

`approved` | `confirmed` | `moderation` | `quarantine` | `rejected` | `sending` | `success` | `suspended` | `verified`
