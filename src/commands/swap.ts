import { writeCliError } from "../output.js";
import { stringFlag, toParams } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

const SWAP_LIST_PARAMS = [
  "direction", "status", "code", "custom-id", "spend-currency",
  "receive-currency", "start-at", "end-at", "limit", "offset", "ordering",
] as const;

export async function swap(action: string, flags: Flags): Promise<void> {
  const client = initClient(flags);

  switch (action) {
    case "directions": {
      const params = toParams(flags, ["ordering"]);
      return callApi(() => client.get("/api/v1/swap-directions", params));
    }
    case "list": {
      const params = toParams(flags, SWAP_LIST_PARAMS);
      return callApi(() => client.get("/api/v1/swap", params));
    }
    case "get": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/swap/${code}`));
    }
    case "get-by-code": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'get-by-code' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/swap/${code}/details-with-code`));
    }
    case "get-by-custom-id": {
      const customId = stringFlag(flags, "custom-id");
      if (!customId) {
        writeCliError("--custom-id is required for 'get-by-custom-id' action", "missing_flag");
      }
      return callApi(() => client.get(`/api/v1/swap/${customId}/details-with-custom-id`));
    }
    case "create": {
      const direction = stringFlag(flags, "direction");
      if (!direction) {
        writeCliError("--direction is required for 'create' action", "missing_flag");
      }
      const spendAmount = stringFlag(flags, "spend-amount");
      const receiveAmount = stringFlag(flags, "receive-amount");
      if (!spendAmount && !receiveAmount) {
        writeCliError(
          "Provide --spend-amount or --receive-amount",
          "missing_flag",
        );
      }
      const body: Record<string, unknown> = { direction };
      if (spendAmount) body.spend_amount = spendAmount;
      if (receiveAmount) body.receive_amount = receiveAmount;
      const customId = stringFlag(flags, "custom-id");
      if (customId) body.custom_id = customId;
      const callbackUrl = stringFlag(flags, "callback-url");
      if (callbackUrl) body.callback_url = callbackUrl;
      const ttl = stringFlag(flags, "time-to-live");
      if (ttl) {
        const ttlNum = Number(ttl);
        if (!Number.isInteger(ttlNum)) {
          writeCliError("--time-to-live must be an integer", "invalid_flag");
        }
        body.time_to_live = ttlNum;
      }
      return callApi(() => client.post("/api/v1/swap/open", body));
    }
    case "cancel": {
      const code = stringFlag(flags, "code");
      const customId = stringFlag(flags, "custom-id");
      if (!code && !customId) {
        writeCliError("Provide --code or --custom-id", "missing_flag");
      }
      const body: Record<string, unknown> = {};
      if (code) body.code = code;
      if (customId) body.custom_id = customId;
      return callApi(() => client.post("/api/v1/swap/cancel", body));
    }
    case "cancel-by-code": {
      const code = stringFlag(flags, "code");
      if (!code) {
        writeCliError("--code is required for 'cancel-by-code' action", "missing_flag");
      }
      return callApi(() => client.post(`/api/v1/swap/${code}/cancel-with-code`));
    }
    case "cancel-by-custom-id": {
      const customId = stringFlag(flags, "custom-id");
      if (!customId) {
        writeCliError("--custom-id is required for 'cancel-by-custom-id' action", "missing_flag");
      }
      return callApi(() => client.post(`/api/v1/swap/${customId}/cancel-with-custom-id`));
    }
    default:
      writeCliError(
        `Unknown swap action "${action}". Use: directions, list, get, get-by-code, get-by-custom-id, create, cancel, cancel-by-code, cancel-by-custom-id`,
        "unknown_action",
      );
  }
}
