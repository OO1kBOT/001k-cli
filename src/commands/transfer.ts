import { writeCliError } from "../output.js";
import { stringFlag, toParams } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

const TRANSFER_LIST_PARAMS = [
  "code", "currency", "recipient-uid", "sender-uid", "custom-id",
  "role", "status", "start-at", "end-at", "limit", "offset", "ordering",
] as const;

export async function transfer(action: string, flags: Flags): Promise<void> {
  const client = initClient(flags);

  switch (action) {
    case "list": {
      const params = toParams(flags, TRANSFER_LIST_PARAMS);
      return callApi(() => client.get("/api/v1/internal-transfer", params));
    }
    case "get": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/internal-transfer/${code}`));
    }
    case "create": {
      const currencyCode = stringFlag(flags, "currency-code");
      const amount = stringFlag(flags, "amount");
      const recipient = stringFlag(flags, "recipient");
      if (!currencyCode || !amount || !recipient) {
        writeCliError(
          "--currency-code, --amount, and --recipient are required for 'create' action",
          "missing_flag",
        );
      }
      const body: Record<string, unknown> = {
        currency_code: currencyCode,
        amount,
        recipient,
      };
      const customId = stringFlag(flags, "custom-id");
      if (customId) body.custom_id = customId;
      const callbackUrl = stringFlag(flags, "callback-url");
      if (callbackUrl) body.callback_url = callbackUrl;
      return callApi(() => client.post("/api/v1/internal-transfer", body));
    }
    default:
      writeCliError(
        `Unknown transfer action "${action}". Use: list, get, create`,
        "unknown_action",
      );
  }
}
