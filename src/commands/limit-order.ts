import { writeCliError } from "../output.js";
import { stringFlag, toParams } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

export async function limitOrder(action: string, flags: Flags): Promise<void> {
  const client = initClient(flags);

  switch (action) {
    case "pairs": {
      const params = toParams(flags, ["symbol", "ordering"]);
      return callApi(() => client.get("/api/v1/limit-pairs", params));
    }

    case "list": {
      const params = toParams(flags, [
        "code", "pair", "custom-id", "status", "side",
        "start-at", "end-at", "limit", "offset", "ordering",
      ]);
      return callApi(() => client.get("/api/v1/limit-order", params));
    }

    case "get": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/limit-order/${code}`));
    }

    case "create": {
      const pair = stringFlag(flags, "pair");
      const side = stringFlag(flags, "side");
      if (!pair || !side) {
        writeCliError("--pair and --side are required for 'create' action", "missing_flag");
      }

      const body: Record<string, unknown> = { pair, side };
      const optional = ["limit-price", "spend-amount", "receive-amount", "custom-id", "callback-url"];
      for (const key of optional) {
        const value = stringFlag(flags, key);
        if (value !== undefined) {
          body[key.replace(/-/g, "_")] = value;
        }
      }
      return callApi(() => client.post("/api/v1/limit-order", body));
    }

    case "cancel": {
      const code = stringFlag(flags, "code");
      const customId = stringFlag(flags, "custom-id");
      if (!code && !customId) {
        writeCliError("--code or --custom-id is required for 'cancel' action", "missing_flag");
      }

      const body: Record<string, unknown> = {};
      if (code) body.code = code;
      if (customId) body.custom_id = customId;
      return callApi(() => client.post("/api/v1/limit-order/cancel", body));
    }

    default:
      writeCliError(
        `Unknown action "${action}". Use: pairs, list, get, create, cancel`,
        "unknown_action",
      );
  }
}
