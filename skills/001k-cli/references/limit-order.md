# Limit Order

All limit order commands require authentication.

## Pairs

```bash
001k limit-order pairs [--symbol <sym>] [--ordering <field>]
```

Lists available trading pairs for limit orders. Both flags are optional.

## List Orders

```bash
001k limit-order list [--code <code>] [--pair <pair>] [--custom-id <id>]
  [--status <s>] [--side <side>]
  [--start-at <iso>] [--end-at <iso>] [--limit <n>] [--offset <n>] [--ordering <field>]
```

All flags are optional. Returns a paginated list of limit orders.

| Notable Flag | Description |
|-------------|-------------|
| `--pair` | Trading pair symbol (e.g. `BTC_USDT`) |
| `--side` | Order side: `BUY` or `SELL` |

## Get Order

```bash
001k limit-order get --code <code>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | yes | Limit order code |

## Create Order

```bash
001k limit-order create --pair <pair> --side <side>
  [--limit-price <price>] [--spend-amount <amt>] [--receive-amount <amt>]
  [--custom-id <id>] [--callback-url <url>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--pair` | yes | Trading pair (e.g. `BTC_USDT`) |
| `--side` | yes | `BUY` or `SELL` |
| `--limit-price` | no | Limit price for the order |
| `--spend-amount` | no | Amount to spend |
| `--receive-amount` | no | Amount to receive |
| `--custom-id` | no | Your custom identifier |
| `--callback-url` | no | Webhook URL for status updates |

**Example:**

```bash
001k limit-order create --pair BTC_USDT --side BUY --limit-price 60000 --spend-amount 600
```

**Example response:**

```json
{
  "code": "LO-ghi789",
  "pair": "BTC_USDT",
  "side": "BUY",
  "limit_price": "60000.00",
  "spend_amount": "600.00",
  "status": "open",
  "created_at": "2025-06-01T12:00:00Z"
}
```

## Cancel Order

```bash
001k limit-order cancel (--code <code> | --custom-id <id>)
```

Provide either `--code` or `--custom-id` to identify the order to cancel.

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | one of | Limit order code |
| `--custom-id` | one of | Your custom identifier |

## Order Statuses

`queued` | `open` | `cancelling` | `success` | `failed`
