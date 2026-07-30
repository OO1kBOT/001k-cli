import { writeCliError } from "../output.js";
import { stringFlag, toParams, kebabToSnake } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

export async function deposit(action: string, flags: Flags): Promise<void> {
  const client = initClient(flags);

  switch (action) {
    case "methods": {
      const params = toParams(flags, ["code", "ordering"]);
      return callApi(() => client.get("/api/v1/deposit-methods", params));
    }

    case "list": {
      const params = toParams(flags, [
        "status", "currency", "method", "custom-id", "code", "txid",
        "start-at", "end-at", "limit", "offset", "ordering",
      ]);
      return callApi(() => client.get("/api/v1/deposit", params));
    }

    case "get": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/deposit/${code}`));
    }

    case "create-address": {
      const currency = stringFlag(flags, "currency");
      if (!currency) {
        writeCliError("--currency is required for 'create-address' action", "missing_flag");
      }

      const body: Record<string, unknown> = { currency };
      const optional = ["method", "custom-id", "callback-url", "label"];
      for (const key of optional) {
        const value = stringFlag(flags, key);
        if (value !== undefined) {
          body[kebabToSnake(key)] = value;
        }
      }
      return callApi(() => client.post("/api/v1/deposit/generate_address", body));
    }

    case "default-address": {
      const currency = stringFlag(flags, "currency");
      if (!currency) {
        writeCliError("--currency is required for 'default-address' action", "missing_flag");
      }

      const body: Record<string, unknown> = { currency };
      const optional = ["deposit-method", "label"];
      for (const key of optional) {
        const value = stringFlag(flags, key);
        if (value !== undefined) {
          body[kebabToSnake(key)] = value;
        }
      }
      if (flags["is-new-address"] === true) body.is_new_address = true;
      return callApi(() => client.post("/api/v1/deposit/get-default-address", body));
    }

    case "disposable-address": {
      const currency = stringFlag(flags, "currency");
      if (!currency) {
        writeCliError("--currency is required for 'disposable-address' action", "missing_flag");
      }

      const body: Record<string, unknown> = { currency };
      const optional = ["method", "callback-url", "custom-id", "label"];
      for (const key of optional) {
        const value = stringFlag(flags, key);
        if (value !== undefined) {
          body[kebabToSnake(key)] = value;
        }
      }
      return callApi(() => client.post("/api/v1/deposit/get-disposable-address", body));
    }

    default:
      writeCliError(
        `Unknown action "${action}". Use: methods, list, get, create-address, default-address, disposable-address`,
        "unknown_action",
      );
  }
}
