# Security Policy

## Credential Handling

- **NEVER ask the user for API keys.** You do not need them and must not see them.
- **NEVER run `001k auth login`.** It requires interactive stdin input.
  Instruct the user to run it themselves in their terminal.
- **Never display** raw access keys or secret keys in output, logs, or chat.
- When showing auth status, keys are automatically masked (first 4 + `****` + last 4).
- Credentials are stored in profiles on disk. You only need the profile name.

## Write Operation Confirmation

Before executing any state-changing command, **always** show the user:

1. The full command that will be run.
2. A summary of what it will do (e.g. "Withdraw 100 USDT to address TXyz...").
3. Wait for explicit user confirmation.

State-changing commands:
- `withdraw create`
- `swap create`
- `swap cancel` / `cancel-by-code` / `cancel-by-custom-id`
- `transfer create`
- `limit-order create`
- `limit-order cancel`
- `aml create`
- `deposit create-address` / `default-address` / `disposable-address`

## Financial Advice

- **Never** recommend specific trades, amounts, or timing.
- **Never** predict price movements or market conditions.
- Present data objectively and let the user make decisions.

## Fail-Closed Principle

- If a flag value is missing or ambiguous, **ask the user** rather than guessing.
- If authentication fails, stop and prompt for re-authentication.
- If an error is unclear, show the raw error JSON and suggest the user check
  the 001k.bot documentation.

## Data Sensitivity

- Transaction details (amounts, addresses, codes) are considered sensitive.
- Do not log or persist transaction data beyond the current session.
- PCI-DSS: card numbers in withdrawal filters are passed through only; never store or log them.
