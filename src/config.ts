import { resolveProfile } from "./resolve-profile.js";
import { DEFAULT_BASE_URL } from "./constants.js";

export interface Config {
  accessKey: string;
  secretKey: string;
  baseUrl: string;
}

export function loadConfig(flags: Record<string, string | boolean>): Config {
  const resolved = resolveProfile(flags);

  // Profile takes precedence; env vars are fallback for CI/CD (no profile configured)
  const accessKey = resolved?.data.accessKey ?? process.env.OO1K_ACCESS_KEY;
  const secretKey = resolved?.data.secretKey ?? process.env.OO1K_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new Error(
      "No credentials found. Use --profile <name>, set OO1K_ACCESS_KEY/OO1K_SECRET_KEY env vars, " +
        "or run `001k auth login` to create a profile.",
    );
  }

  const baseUrl =
    resolved?.data.baseUrl || process.env.OO1K_BASE_URL || DEFAULT_BASE_URL;

  return { accessKey, secretKey, baseUrl };
}
