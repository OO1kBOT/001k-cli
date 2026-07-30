# Balance, Status, and Currency

## API Status (public)

```bash
001k status
```

No authentication required. Checks whether the API is reachable.

**Example response:**

```json
{ "timestamp": 1779952451908 }
```

## Currency List (public)

```bash
001k currency
```

No authentication required. Lists all supported currencies.

**Example response:**

```json
[
  { "code": "BTC", "name": "Bitcoin", "type": "crypto" },
  { "code": "USDT", "name": "Tether", "type": "crypto" },
  { "code": "UAH", "name": "Ukrainian Hryvnia", "type": "fiat" }
]
```

## Account Balance (auth required)

```bash
001k balance
```

Returns balances for all currencies in the account.

**Example response:**

```json
[
  {
    "currency": "BTC",
    "available": "0.05000000",
    "frozen": "0.00000000",
    "updated_at": "2025-06-01T12:00:00Z"
  },
  {
    "currency": "USDT",
    "available": "1250.00",
    "frozen": "50.00",
    "updated_at": "2025-06-01T12:00:00Z"
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `currency` | string | Currency code |
| `available` | decimal string | Available balance |
| `frozen` | decimal string | Frozen (in-flight) balance |
| `updated_at` | datetime / null | Last update timestamp |

## Profile Selection

Authenticated commands accept `--profile <name>` to select a saved profile and
`--profile-path <path>` to point at an arbitrary credentials file. See
[authentication.md](authentication.md) for full profile resolution rules.
