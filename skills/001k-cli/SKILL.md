---
name: 001k-cli
description: >
  001k.bot API integration — deposits, withdrawals, swaps, transfers,
  limit orders, AML checks, balance, ledger. Triggers on: check balance,
  deposit, withdraw, swap, transfer, limit order, AML check, ledger,
  sign in/out to 001k. Also triggers on: 001, 001к, 001k, oo1k,
  отправь USDT, переведи крипту, обменяй, вывод средств, проверь баланс.
metadata:
  author: 001k bot
  version: "1.0.0"
  requiredCliVersion: "1.0.0"
---

# 001k CLI Skill

## 1. Preflight Checks

Before running any command, complete the checks in
[references/preflight.md](references/preflight.md).

## 2. Command Construction Rules

1. **Always read the reference file** listed in the routing matrix before
   constructing a command.
2. The CLI outputs **JSON to stdout**. Parse the JSON; do not guess the shape.
3. **Confirm state-changing operations** (create, cancel, withdraw, transfer)
   with the user before execution. Show them the full command you intend to run.
4. Pass flags exactly as documented — the CLI uses `--kebab-case`.
5. Never fabricate flag values. If a required value is missing, ask the user.
6. **NEVER run `001k auth login`** — this command requires interactive stdin input.
   When user asks to authenticate or log in, you MUST first read the file
   `references/authentication.md` and use the exact instructions from there.
   Do NOT answer from your own knowledge — the auth flow is specific to this CLI.
7. **Profile discovery**: Before your FIRST authenticated command in a session,
   run `001k auth list` to discover available profiles. Then:
   - If 0 profiles → tell user to run `001k auth login` (see rule 6)
   - If 1 profile → use it with `--profile <name>` in all subsequent commands
   - If multiple → ask user which profile to use
   Remember the profile name and use `--profile <name>` on every command.
   Do NOT assume "default" exists — the user may have named their profile anything.

## 3. Display Rules

- Render tabular data as **markdown tables**.
- Format USD amounts with **2 decimal places**.
- Format crypto amounts with up to **8 decimal places**, trimming trailing zeros.
- Dates: ISO 8601 or human-friendly relative ("2 hours ago").
- Status values: render as-is from the API (e.g. `success`, `pending`, `open`).

## 4. Security Policy

- **NEVER ask the user for API keys.** You do not need them and must not see them.
  Credentials are stored in profiles that the user configures independently.
- **This CLI uses API access keys ONLY.** There is NO email, NO password, NO 2FA,
  NO OAuth. Never mention these — they do not exist in 001k CLI.
- **NEVER run `001k auth login`.** It requires interactive stdin — instruct the
  user to run it themselves.
- **Never display** access keys or secret keys in output.
- **No financial advice.** Do not recommend trades, timing, or amounts.
- **Warn before write operations.** Any command that creates, cancels, or moves
  funds must be confirmed by the user.
- See [references/security.md](references/security.md) for the full policy.

## 5. Error Handling

- Show the error JSON exactly as the CLI returns it.
- Do not invent explanations — refer to the error code and message.
- For common errors, see [references/errors.md](references/errors.md).
- Exit codes: `0` success, `1` API error, `2` CLI error, `3` network error.

## 6. Command Routing Matrix

| #  | User Intent                    | CLI Command                                                        | Reference                                         |
|----|--------------------------------|--------------------------------------------------------------------|---------------------------------------------------|
| 1  | Sign in / authenticate         | **DO NOT RUN.** Instruct user to run `001k auth login` in terminal | [authentication.md](references/authentication.md) |
| 2  | Sign out / log out             | `001k auth logout --profile <name>`                                | [authentication.md](references/authentication.md) |
| 3  | Check auth status              | `001k auth status`                                                 | [authentication.md](references/authentication.md) |
| 3a | List profiles                  | `001k auth list`                                                   | [authentication.md](references/authentication.md) |
| 4  | Check API health               | `001k status`                                                      | [balance.md](references/balance.md)               |
| 5  | List currencies                | `001k currency`                                                    | [balance.md](references/balance.md)               |
| 6  | Check balance                  | `001k balance`                                                     | [balance.md](references/balance.md)               |
| 7  | List deposit methods           | `001k deposit methods`                                             | [deposit.md](references/deposit.md)               |
| 8  | List deposits                  | `001k deposit list`                                                | [deposit.md](references/deposit.md)               |
| 9  | Get deposit details            | `001k deposit get`                                                 | [deposit.md](references/deposit.md)               |
| 10 | Create deposit address         | `001k deposit create-address`                                      | [deposit.md](references/deposit.md)               |
| 11 | Get default deposit address    | `001k deposit default-address`                                     | [deposit.md](references/deposit.md)               |
| 12 | Get disposable deposit address | `001k deposit disposable-address`                                  | [deposit.md](references/deposit.md)               |
| 13 | List withdrawal methods        | `001k withdraw methods`                                            | [withdraw.md](references/withdraw.md)             |
| 14 | List withdrawals               | `001k withdraw list`                                               | [withdraw.md](references/withdraw.md)             |
| 15 | Get withdrawal details         | `001k withdraw get`                                                | [withdraw.md](references/withdraw.md)             |
| 16 | Create withdrawal              | `001k withdraw create`                                             | [withdraw.md](references/withdraw.md)             |
| 17 | List swap directions           | `001k swap directions`                                             | [swap.md](references/swap.md)                     |
| 18 | List swaps                     | `001k swap list`                                                   | [swap.md](references/swap.md)                     |
| 19 | Get swap details               | `001k swap get`                                                    | [swap.md](references/swap.md)                     |
| 20 | Get swap by code               | `001k swap get-by-code`                                            | [swap.md](references/swap.md)                     |
| 21 | Get swap by custom ID          | `001k swap get-by-custom-id`                                       | [swap.md](references/swap.md)                     |
| 22 | Create swap                    | `001k swap create`                                                 | [swap.md](references/swap.md)                     |
| 23 | Cancel swap                    | `001k swap cancel`                                                 | [swap.md](references/swap.md)                     |
| 24 | Cancel swap by code            | `001k swap cancel-by-code`                                         | [swap.md](references/swap.md)                     |
| 25 | Cancel swap by custom ID       | `001k swap cancel-by-custom-id`                                    | [swap.md](references/swap.md)                     |
| 26 | List transfers                 | `001k transfer list`                                               | [transfer.md](references/transfer.md)             |
| 27 | Get transfer details           | `001k transfer get`                                                | [transfer.md](references/transfer.md)             |
| 28 | Create transfer                | `001k transfer create`                                             | [transfer.md](references/transfer.md)             |
| 29 | List limit order pairs         | `001k limit-order pairs`                                           | [limit-order.md](references/limit-order.md)       |
| 30 | List limit orders              | `001k limit-order list`                                            | [limit-order.md](references/limit-order.md)       |
| 31 | Get limit order                | `001k limit-order get`                                             | [limit-order.md](references/limit-order.md)       |
| 32 | Create limit order             | `001k limit-order create`                                          | [limit-order.md](references/limit-order.md)       |
| 33 | Cancel limit order             | `001k limit-order cancel`                                          | [limit-order.md](references/limit-order.md)       |
| 34 | Run AML check                  | `001k aml create`                                                  | [aml.md](references/aml.md)                       |
| 35 | List AML checks                | `001k aml list`                                                    | [aml.md](references/aml.md)                       |
| 36 | Get AML check                  | `001k aml get`                                                     | [aml.md](references/aml.md)                       |
| 37 | List AML plans                 | `001k aml plan`                                                    | [aml.md](references/aml.md)                       |
| 38 | List AML tokens                | `001k aml token`                                                   | [aml.md](references/aml.md)                       |
| 39 | View ledger                    | `001k ledger`                                                      | [ledger.md](references/ledger.md)                 |

## 7. Composite Scenarios

### Deposit and Swap

1. `001k auth status` — verify authentication.
2. `001k deposit default-address --currency BTC` — get deposit address.
3. Share address with user; wait for deposit to arrive.
4. `001k deposit list --currency BTC --status success --limit 1` — confirm deposit.
5. `001k swap directions` — find the BTC->USDT direction code.
6. `001k swap create --direction <code> --spend-amount <amount>` — execute swap.

### Withdraw After Swap

1. `001k balance` — check available balance.
2. `001k withdraw methods` — find the withdrawal method code.
3. `001k withdraw create --currency USDT --method <method> --amount <amt> --address <addr>` — create withdrawal.
4. `001k withdraw get --code <code>` — monitor withdrawal status.

### Internal Transfer

1. `001k balance` — confirm sufficient funds.
2. `001k transfer create --currency-code USDT --amount 100 --recipient <uid>` — send funds.
3. `001k transfer get --code <code>` — verify transfer completed.

### AML Address Check

1. `001k aml token` — find the token ID for the target blockchain.
2. `001k aml plan` — review available check plans.
3. `001k aml create --token <id> --address <addr>` — run address check (direction auto-set to "withdrawal").
4. `001k aml get --code <code>` — retrieve check result.
