import readline from "node:readline/promises";
import { saveProfile, deleteProfile, listProfiles } from "../credentials.js";
import { resolveProfile } from "../resolve-profile.js";
import { ApiClient, ApiError } from "../client.js";
import { writeSuccess, writeCliError } from "../output.js";
import { DEFAULT_BASE_URL } from "../constants.js";
import type { Flags } from "../flag-utils.js";

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

async function prompt(message: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  try {
    const answer = await rl.question(message);
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function promptChoice(message: string, options: string[], defaultIndex: number): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  try {
    for (let i = 0; i < options.length; i++) {
      const marker = i === defaultIndex ? " (default)" : "";
      process.stderr.write(`  ${i + 1}) ${options[i]}${marker}\n`);
    }
    const answer = await rl.question(message);
    const num = parseInt(answer.trim(), 10);
    if (num >= 1 && num <= options.length) return options[num - 1];
    return options[defaultIndex];
  } finally {
    rl.close();
  }
}

export async function login(flags: Flags): Promise<void> {
  // CLI flags override stdin prompts
  const flagProfile = typeof flags["profile"] === "string" ? flags["profile"] : undefined;
  const flagScope = typeof flags["scope"] === "string" ? flags["scope"] : undefined;

  // || (not ??): --profile= / --profile "$EMPTY_VAR" must fall through to the
  // prompt instead of proceeding with "" and failing late in saveProfile.
  const profile = flagProfile || (await prompt(`Profile name (default): `) || "default");
  const accessKey = await prompt("Access Key: ");
  const secretKey = await prompt("Secret Key: ");

  if (!accessKey || !secretKey) {
    writeCliError("Both access key and secret key are required.", "missing_credentials");
  }

  const baseUrl = await prompt(`API URL (${DEFAULT_BASE_URL}): `) || DEFAULT_BASE_URL;

  let scope: "global" | "project";
  if (flagScope) {
    scope = flagScope === "project" ? "project" : "global";
  } else {
    process.stderr.write("\nSave to:\n");
    const choice = await promptChoice("Choose: ", ["Global (all projects)", "This project only"], 0);
    scope = choice.includes("project") ? "project" : "global";
  }

  const client = new ApiClient({ accessKey, secretKey, baseUrl });

  try {
    await client.get("/api/v1/balance");

    saveProfile(profile, { accessKey, secretKey, baseUrl }, scope);

    writeSuccess({ message: "Login successful.", profile, scope });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      writeCliError(
        `Login verification failed: API returned ${error.status}`,
        "login_verification_failed",
      );
    }
    throw error; // NetworkError etc. — classified by the cli.ts boundary
  }
}

export async function logout(flags: Flags): Promise<void> {
  const resolved = resolveProfile(flags);
  const name = resolved?.name ?? "default";
  const deleted = deleteProfile(name);

  writeSuccess({
    message: deleted
      ? `Profile "${name}" removed.`
      : `Profile "${name}" not found.`,
    deleted,
  });
}

export async function authStatus(flags: Flags): Promise<void> {
  const resolved = resolveProfile(flags);

  if (!resolved) {
    writeSuccess({ authenticated: false, message: "No profile found." });
  }

  const { name, data } = resolved;
  const baseUrl = data.baseUrl ?? DEFAULT_BASE_URL;
  const client = new ApiClient({
    accessKey: data.accessKey,
    secretKey: data.secretKey,
    baseUrl,
  });

  try {
    await client.get("/api/v1/balance");

    writeSuccess({
      authenticated: true,
      profile: name,
      accessKey: maskKey(data.accessKey),
      baseUrl,
    });
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      writeSuccess({
        authenticated: false,
        profile: name,
        accessKey: maskKey(data.accessKey),
        baseUrl,
        error: `API returned ${error.status}`,
      });
    }
    throw error; // NetworkError etc. — classified by the cli.ts boundary
  }
}

export async function authListProfiles(): Promise<void> {
  writeSuccess(listProfiles());
}
