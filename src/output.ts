import { ApiError } from "./client.js";

export function writeSuccess(data: unknown): never {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  process.exit(0);
}

export function writeApiError(error: unknown): never {
  const payload = error instanceof ApiError ? error.body : error;
  try {
    process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
  } catch {
    process.stderr.write('{"cli_error":true,"message":"Failed to serialize API error","code":"serialization_error"}\n');
  }
  process.exit(1);
}

export function writeCliError(message: string, code: string): never {
  const payload = { cli_error: true, message, code };
  process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
  process.exit(2);
}

export function writeNetworkError(message: string): never {
  const payload = { network_error: true, message };
  process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
  process.exit(3);
}
