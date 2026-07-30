import { writeCliError } from "../output.js";
import { stringFlag, toParams, kebabToSnake } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

export async function aml(action: string, flags: Flags): Promise<void> {
  const client = initClient(flags);

  switch (action) {
    case "list": {
      const params = toParams(flags, [
        "code", "custom-id", "plan", "transaction", "address",
        "token", "status", "start-at", "end-at",
        "limit", "offset", "ordering",
      ]);
      return callApi(() => client.get("/api/v1/aml/check", params));
    }

    case "get": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/aml/check/${code}`));
    }

    case "plan": {
      const params = toParams(flags, [
        "code", "check-type", "ordering", "limit", "offset",
      ]);
      return callApi(() => client.get("/api/v1/aml/plan", params));
    }

    case "token": {
      const params = toParams(flags, [
        "id", "symbol", "ordering", "limit", "offset",
      ]);
      return callApi(() => client.get("/api/v1/aml/token", params));
    }

    case "create": {
      const token = stringFlag(flags, "token");
      const address = stringFlag(flags, "address");

      if (!token || !address) {
        writeCliError(
          "--token and --address are required for 'create' action",
          "missing_flag",
        );
      }

      const tokenNum = Number(token);
      if (!Number.isInteger(tokenNum)) {
        writeCliError("--token must be an integer", "invalid_flag");
      }

      const transaction = stringFlag(flags, "transaction");
      const directionFlag = stringFlag(flags, "direction");

      let direction: string;
      if (transaction) {
        if (!directionFlag || (directionFlag !== "deposit" && directionFlag !== "withdrawal")) {
          writeCliError(
            "Transaction check requires --direction (deposit or withdrawal)",
            "missing_flag",
          );
        }
        direction = directionFlag;
      } else {
        direction = "withdrawal";
      }

      const body: Record<string, unknown> = {
        direction,
        token: tokenNum,
        address,
      };
      if (transaction) body.transaction = transaction;
      const optional = ["custom-id", "callback-url"];
      for (const key of optional) {
        const value = stringFlag(flags, key);
        if (value !== undefined) {
          body[kebabToSnake(key)] = value;
        }
      }
      return callApi(() => client.post("/api/v1/aml/check", body));
    }

    default:
      writeCliError(
        `Unknown aml action: ${action}. Valid: list, get, plan, token, create`,
        "unknown_action",
      );
  }
}
