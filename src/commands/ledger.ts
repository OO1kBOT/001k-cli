import { toParams } from "../flag-utils.js";
import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

export async function ledger(flags: Flags): Promise<void> {
  const client = initClient(flags);
  const params = toParams(flags, [
    "code", "currency", "start-at", "end-at", "ordering", "limit", "offset",
  ]);

  return callApi(() => client.get("/api/v1/ledger", params));
}
