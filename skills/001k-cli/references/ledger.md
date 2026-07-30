# Ledger

Requires authentication. Returns a chronological log of all balance changes.

## List Ledger Entries

```bash
001k ledger [--code <code>] [--currency <c>]
  [--start-at <iso>] [--end-at <iso>]
  [--ordering <field>] [--limit <n>] [--offset <n>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--code` | no | Filter by entry code |
| `--currency` | no | Filter by currency code (e.g. `BTC`) |
| `--start-at` | no | Start datetime (ISO 8601) |
| `--end-at` | no | End datetime (ISO 8601) |
| `--ordering` | no | Sort field |
| `--limit` | no | Page size |
| `--offset` | no | Page offset |

**Example:**

```bash
001k ledger --currency USDT --limit 5
```

**Example response:**

```json
[
  {
    "code": "LE-001",
    "created_at": "2025-06-01T12:00:00Z",
    "currency": "USDT",
    "balance": "1350.00",
    "reserve": "50.00",
    "available": "1300.00",
    "txid": null,
    "operation_name": "deposit"
  },
  {
    "code": "LE-002",
    "created_at": "2025-06-01T11:30:00Z",
    "currency": "USDT",
    "balance": "1250.00",
    "reserve": "0.00",
    "available": "1250.00",
    "txid": "0xabc123...",
    "operation_name": "withdrawal"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Ledger entry code |
| `created_at` | datetime | When the entry was created |
| `currency` | string | Currency code |
| `balance` | decimal string | Total balance after this entry |
| `reserve` | decimal string | Reserved (frozen) amount |
| `available` | decimal string | Available balance after this entry |
| `txid` | string / null | Related transaction ID |
| `operation_name` | string / null | Operation type (deposit, withdrawal, swap, etc.) |
