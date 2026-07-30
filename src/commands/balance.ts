import { initClient, callApi } from "../command-utils.js";
import type { Flags } from "../flag-utils.js";

export async function balance(flags: Flags): Promise<void> {
  const client = initClient(flags);
  return callApi(() => client.get("/api/v1/balance"));
}
