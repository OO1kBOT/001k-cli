# Error Handling

## Exit Codes

| Code | Meaning | Source |
|------|---------|--------|
| `0` | Success | stdout contains JSON result |
| `1` | API error | stdout contains API error body |
| `2` | CLI error | stderr contains `{ "cli_error": true, "message": "...", "code": "..." }` |
| `3` | Network error | stderr contains `{ "network_error": true, "message": "..." }` |

## CLI Error Codes

| Code | Description |
|------|-------------|
| `missing_flag` | A required flag was not provided |
| `invalid_flag` | A flag value is invalid (e.g. non-integer where integer expected) |
| `missing_credentials` | Access key or secret key was empty when prompted via stdin |
| `unknown_action` | The action is not valid for the given entity |
| `unknown_entity` | The entity is not recognized |
| `missing_required_version` | `cli-check` / `skill-check` called without `--required-version` |
| `login_verification_failed` | Login credentials failed API verification |
| `cli_error` | Unclassified thrown error — e.g. no credentials found, invalid or insecure base URL |
| `unknown_error` | Non-`Error` value reached the top-level boundary (should not happen in practice) |

## API Error Shape

API errors (exit code 1) return the raw response body. Common shapes:

```json
{
  "type": "validation_error",
  "errors": [
    { "attr": "amount", "code": "min_value", "detail": "Ensure this value is greater than 0." }
  ]
}
```

```json
{
  "type": "client_error",
  "errors": [
    { "attr": null, "code": "insufficient_balance", "detail": "Insufficient balance." }
  ]
}
```

```json
{
  "type": "authentication_error",
  "errors": [
    { "attr": null, "code": "signature.invalid", "detail": "The signature is invalid." }
  ]
}
```

## Common API Error Scenarios

| Scenario | Likely Error | Resolution |
|----------|-------------|------------|
| Invalid credentials | `authentication_error` | Re-run `auth login` with correct keys |
| Expired signature | `authentication_error` | Check system clock sync |
| Insufficient balance | `client_error` | Check `001k balance` first |
| Invalid currency code | `validation_error` | Check `001k currency` for valid codes |
| Invalid swap direction | `validation_error` | Check `001k swap directions` |
| Amount too small | `validation_error` | Check method minimums |
| Amount too large | `validation_error` | Check method maximums |
| Duplicate custom_id | `client_error` | Use a unique custom ID |
| Order already cancelled | `client_error` | No action needed |
| Rate limit exceeded | HTTP 429 | Wait and retry |
| Invalid address format | `validation_error` | Verify the address |
| Method not available | `validation_error` | Check available methods |
| Transfer to self | `client_error` | Use a different recipient UID |
| AML token not found | `validation_error` | Check `001k aml token` for valid IDs |
| Server error (5xx) | API error with status 500+ | Retry or contact support |

## Network Failures (exit code 3)

Network-level failures (DNS, connection refused, timeout) are **not** API errors:
no response body exists. They exit with code 3 and print
`{ "network_error": true, "message": "..." }` to stderr — the message includes
the underlying cause code (e.g. `ECONNREFUSED`) when available.

| Scenario | Resolution |
|----------|------------|
| Network unreachable | Check connectivity and base URL |
| API timeout | Retry after a moment |

## Handling Strategy

1. Show the error JSON to the user exactly as returned.
2. Match the error code/type to the table above for guidance.
3. Never invent an explanation that is not supported by the error response.
4. For persistent errors, suggest the user contact 001k.bot support.
