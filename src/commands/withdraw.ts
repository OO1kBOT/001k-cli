import { writeCliError } from "../output.js";
import { stringFlag, toParams, kebabToSnake } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

const BENEFICIARY_KEYS = [
  "first-name", "middle-name", "last-name", "edrpou", "iban",
] as const;

function buildBeneficiary(flags: Flags): Record<string, string> | undefined {
  const obj: Record<string, string> = {};
  let found = false;
  for (const key of BENEFICIARY_KEYS) {
    const v = stringFlag(flags, `beneficiary-${key}`);
    if (v !== undefined) {
      obj[kebabToSnake(key)] = v;
      found = true;
    }
  }
  return found ? obj : undefined;
}

export async function withdraw(action: string, flags: Flags): Promise<void> {
  const client = initClient(flags);

  switch (action) {
    case "methods": {
      const params = toParams(flags, ["code", "ordering"]);
      return callApi(() => client.get("/api/v1/withdrawal-methods", params));
    }

    case "list": {
      const params = toParams(flags, [
        "status", "currency", "method", "custom-id", "code", "address",
        "card-number", "txid", "start-at", "end-at", "limit", "offset", "ordering",
      ]);
      return callApi(() => client.get("/api/v1/withdraw", params));
    }

    case "get": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/withdraw/${code}`));
    }

    case "create": {
      const currency = stringFlag(flags, "currency");
      const method = stringFlag(flags, "method");
      const amount = stringFlag(flags, "amount");
      const address = stringFlag(flags, "address");

      if (!currency || !method || !amount || !address) {
        writeCliError(
          "--currency, --method, --amount, and --address are required for 'create' action",
          "missing_flag",
        );
      }

      const body: Record<string, unknown> = { currency, method, amount, address };
      if (flags["receive-mode"] === true) body.receive_mode = true;

      const optional = ["tag", "custom-id", "callback-url", "address-book-code"];
      for (const key of optional) {
        const value = stringFlag(flags, key);
        if (value !== undefined) {
          body[kebabToSnake(key)] = value;
        }
      }

      const beneficiary = buildBeneficiary(flags);
      if (beneficiary) body.beneficiary = beneficiary;

      return callApi(() => client.post("/api/v1/withdraw", body));
    }

    default:
      writeCliError(
        `Unknown action "${action}". Use: methods, list, get, create`,
        "unknown_action",
      );
  }
}
