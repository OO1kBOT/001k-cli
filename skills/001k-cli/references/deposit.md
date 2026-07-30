# Deposit

All deposit commands require authentication.

## Methods

```bash
001k deposit methods [--code <code>] [--ordering <field>]
```

Lists available deposit methods. Both flags are optional filters.

## List Deposits

```bash
001k deposit list [--status <s>] [--currency <c>] [--method <m>] [--custom-id <id>]
  [--code <code>] [--txid <txid>] [--start-at <iso>] [--end-at <iso>]
  [--limit <n>] [--offset <n>] [--ordering <field>]
```

All flags are optional. Returns a paginated list of deposits.

## Get Deposit

```bash
001k deposit get --code <code>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | yes | Deposit code |

## Create Address

```bash
001k deposit create-address --currency <code> [--method <m>] [--custom-id <id>]
  [--callback-url <url>] [--label <text>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--currency` | yes | Currency code (e.g. `BTC`) |
| `--method` | no | Deposit method code |
| `--custom-id` | no | Your custom identifier |
| `--callback-url` | no | Webhook URL for status updates |
| `--label` | no | Human-readable label |

**Example:**

```bash
001k deposit create-address --currency BTC --label "Main wallet"
```

**Example response:**

```json
{
  "address": "bc1q...",
  "currency": "BTC",
  "label": "Main wallet"
}
```

## Default Address

```bash
001k deposit default-address --currency <code> [--deposit-method <m>]
  [--label <text>] [--is-new-address]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--currency` | yes | Currency code |
| `--deposit-method` | no | Deposit method code |
| `--label` | no | Human-readable label |
| `--is-new-address` | no | Boolean flag — force new address generation |

## Disposable Address

```bash
001k deposit disposable-address --currency <code> [--method <m>]
  [--callback-url <url>] [--custom-id <id>] [--label <text>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--currency` | yes | Currency code |
| `--method` | no | Deposit method code |
| `--callback-url` | no | Webhook URL |
| `--custom-id` | no | Your custom identifier |
| `--label` | no | Human-readable label |

## Deposit Statuses

`pending` | `quarantine` | `refunded` | `refunding` | `rejected` | `success` | `suspended`
