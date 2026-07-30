import { loadConfig } from "./config.js";
import { resolveProfile } from "./resolve-profile.js";
import { DEFAULT_BASE_URL } from "./constants.js";
import { ApiClient } from "./client.js";
import { writeSuccess } from "./output.js";
import type { Flags } from "./flag-utils.js";

export function initClient(flags: Flags): ApiClient {
  const config = loadConfig(flags);
  return new ApiClient(config);
}

export function initPublicClient(flags: Flags = {}): ApiClient {
  const resolved = resolveProfile(flags);
  const baseUrl =
    resolved?.data.baseUrl || process.env.OO1K_BASE_URL || DEFAULT_BASE_URL;
  return new ApiClient({ accessKey: "", secretKey: "", baseUrl });
}

// Error classification (ApiError/NetworkError/Error -> exit 1/3/2) lives in
// the top-level boundary in cli.ts — commands just throw.
export async function callApi(fn: () => Promise<unknown>): Promise<void> {
  writeSuccess(await fn());
}
