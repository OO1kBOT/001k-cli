import { initPublicClient, callApi } from "../command-utils.js";

export async function currency(): Promise<void> {
  const client = initPublicClient();
  return callApi(() => client.getPublic("/api/v1/currency"));
}
