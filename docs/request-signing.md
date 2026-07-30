# Request Signing

Authenticated requests are signed with HMAC-SHA256 (`src/client.ts`).

## Scheme

```
message   = accessKey + path + timestamp [ + JSON.stringify(body) ]
signature = HMAC_SHA256(secretKey, message)   // hex
```

Headers sent:

| Header         | Value                       |
|----------------|-----------------------------|
| `X-Access-Key` | access key                  |
| `X-Timestamp`  | `Date.now()` (milliseconds) |
| `X-Signature`  | hex HMAC                    |

- For POST, the JSON body is appended to the signed message and sent as
  `Content-Type: application/json`.
- Public endpoints (`getPublic`) send no auth headers.

## Transport rules

- The base URL **must** be `https://` (localhost is exempt for local testing);
  enforced in the `ApiClient` constructor.
- Default base URL: `https://api.001k.world` (override via `OO1K_BASE_URL`).

## To verify / harden (open items)

Confirm the exact canonicalization against the API spec at <https://docs.001k.bot>:

- Whether GET query parameters are part of the signed message.
- Field delimiting in the signed string.
- The server's timestamp tolerance window and any nonce/idempotency requirement.
