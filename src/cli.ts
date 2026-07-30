#!/usr/bin/env node

import { ApiError, NetworkError } from "./client.js";
import { getVersion } from "./constants.js";
import { writeCliError, writeApiError, writeNetworkError } from "./output.js";
import { login, logout, authStatus, authListProfiles } from "./commands/auth.js";
import { status } from "./commands/status.js";
import { currency } from "./commands/currency.js";
import { balance } from "./commands/balance.js";
import { cliCheck, skillCheck } from "./preflight.js";
import { deposit } from "./commands/deposit.js";
import { withdraw } from "./commands/withdraw.js";
import { swap } from "./commands/swap.js";
import { transfer } from "./commands/transfer.js";
import { limitOrder } from "./commands/limit-order.js";
import { aml } from "./commands/aml.js";
import { ledger } from "./commands/ledger.js";
import { parseArgs } from "./parse-args.js";

// ---------------------------------------------------------------------------
// Arg parsing — see ./parse-args.ts (exported for direct unit testing)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

function printUsage(): void {
  const text = `
001k — CLI for the 001k.bot API

Usage:
  001k <entity> <action> [--param value] [--flag]

Entities & actions:
  auth login          Save API credentials and verify
  auth logout         Remove saved credentials
  auth status         Show current auth status
  auth list           List saved credential profiles

  status              Check API availability

  currency            List supported currencies

  balance             Show account balances (auth required)

  deposit methods|list|get|create-address|default-address|disposable-address
  withdraw methods|list|get|create
  swap directions|list|get|get-by-code|get-by-custom-id|create|cancel|cancel-by-code|cancel-by-custom-id
  transfer list|get|create
  limit-order pairs|list|get|create|cancel
  aml list|get|plan|token|create
  ledger              Show ledger entries

  cli-check --required-version <ver>    Compare CLI version against a required version
  skill-check --required-version <ver>  Check whether a skill update is needed (pass the skill's own version)

Global flags:
  --profile <name>    Use a named credential profile
  --profile-path <path> Load credentials from a specific file
  --help              Show this help text
  --version           Show CLI version
`.trim();

  process.stdout.write(text + "\n");
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

async function run(): Promise<void> {
  const { entity, action, flags } = parseArgs(process.argv.slice(2));

  if (flags["help"] === true) {
    printUsage();
    return;
  }

  if (flags["version"] === true) {
    process.stdout.write(getVersion() + "\n");
    return;
  }

  if (!entity) {
    printUsage();
    return;
  }

  switch (entity) {
    case "auth": {
      if (action === "login") return login(flags);
      if (action === "logout") return logout(flags);
      if (action === "status") return authStatus(flags);
      if (action === "list") return authListProfiles();
      writeCliError(`Unknown auth action: ${action}`, "unknown_action");
      return;
    }

    case "status":
      return status();

    case "currency":
      return currency();

    case "balance":
      return balance(flags);

    case "deposit":
      return deposit(action, flags);

    case "withdraw":
      return withdraw(action, flags);

    case "swap":
      return swap(action, flags);

    case "transfer":
      return transfer(action, flags);

    case "limit-order":
      return limitOrder(action, flags);

    case "aml":
      return aml(action, flags);

    case "ledger":
      return ledger(flags);

    case "cli-check":
      return cliCheck(flags);

    case "skill-check":
      return skillCheck(flags);

    default:
      writeCliError(`Unknown entity: ${entity}`, "unknown_entity");
  }
}

// ---------------------------------------------------------------------------
// Top-level error boundary
// ---------------------------------------------------------------------------

run().catch((error: unknown) => {
  if (error instanceof ApiError) {
    writeApiError(error);
    return;
  }

  if (error instanceof NetworkError) {
    writeNetworkError(error.message);
    return;
  }

  if (error instanceof Error) {
    writeCliError(error.message, "cli_error");
    return;
  }

  writeCliError("An unexpected error occurred", "unknown_error");
});
