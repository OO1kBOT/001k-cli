# Swap

All swap commands require authentication.

## Directions

```bash
001k swap directions [--ordering <field>]
```

Lists available swap direction pairs. The `--ordering` flag is optional.

## List Swaps

```bash
001k swap list [--direction <d>] [--status <s>] [--code <code>] [--custom-id <id>]
  [--spend-currency <c>] [--receive-currency <c>]
  [--start-at <iso>] [--end-at <iso>] [--limit <n>] [--offset <n>] [--ordering <field>]
```

All flags are optional. Returns a paginated list of swaps.

## Get Swap

```bash
001k swap get --code <code>
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | yes | Swap code |

## Get by Code

```bash
001k swap get-by-code --code <code>
```

Returns swap details using the swap code via a dedicated endpoint.

## Get by Custom ID

```bash
001k swap get-by-custom-id --custom-id <id>
```

Returns swap details using your custom identifier.

## Create Swap

```bash
001k swap create --direction <code> (--spend-amount <amt> | --receive-amount <amt>)
  [--custom-id <id>] [--callback-url <url>] [--time-to-live <seconds>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--direction` | yes | Swap direction code from `swap directions` |
| `--spend-amount` | one of | Amount to spend (mutually exclusive with receive) |
| `--receive-amount` | one of | Amount to receive (mutually exclusive with spend) |
| `--custom-id` | no | Your custom identifier |
| `--callback-url` | no | Webhook URL for status updates |
| `--time-to-live` | no | TTL in seconds before auto-cancel |

**Example:**

```bash
001k swap create --direction <direction_code> --spend-amount 0.01
```

The `<direction_code>` value comes from `001k swap directions`. Use the `code`
field exactly as returned by the API.

**Example response:**

```json
{
  "code": "SW-xyz789",
  "spend_currency": "BTC",
  "receive_currency": "USDT",
  "spend_amount": "0.01000000",
  "receive_amount": "650.00",
  "spend_rate": "1",
  "receive_rate": "65000.00",
  "fee_percent": "0.10",
  "fee_amount": "0.65",
  "fee_currency": "USDT",
  "status": "success",
  "created_at": "2025-06-01T12:00:00Z"
}
```

## Cancel Swap

```bash
001k swap cancel (--code <code> | --custom-id <id>)
```

Provide either `--code` or `--custom-id`. Cancels an open swap.

## Cancel by Code

```bash
001k swap cancel-by-code --code <code>
```

## Cancel by Custom ID

```bash
001k swap cancel-by-custom-id --custom-id <id>
```

## Swap Statuses

`open` | `success` | `failed`
