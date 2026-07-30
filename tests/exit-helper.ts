import { vi, expect, type MockInstance } from "vitest";

/** Thrown by the mocked process.exit so terminal write* calls become testable. */
export class ExitError extends Error {
  constructor(readonly code: number) {
    super(`process.exit(${code})`);
    this.name = "ExitError";
  }
}

export interface CapturedProcess {
  out: string[];
  err: string[];
  restore: () => void;
}

/** Mock process.exit (throws ExitError) and capture stdout/stderr writes. */
export function captureProcess(): CapturedProcess {
  const out: string[] = [];
  const err: string[] = [];

  const spies: MockInstance[] = [
    vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new ExitError(code ?? 0);
    }) as never),
    vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
      out.push(String(chunk));
      return true;
    }),
    vi.spyOn(process.stderr, "write").mockImplementation((chunk: unknown) => {
      err.push(String(chunk));
      return true;
    }),
  ];

  return { out, err, restore: () => spies.forEach((s) => s.mockRestore()) };
}

/** Run fn, expect it to terminate via process.exit(code). */
export async function expectExit(
  fn: () => unknown | Promise<unknown>,
  code: number,
): Promise<void> {
  try {
    await fn();
  } catch (error) {
    if (error instanceof ExitError) {
      expect(error.code).toBe(code);
      return;
    }
    throw error;
  }
  throw new Error(`expected process.exit(${code}), but nothing exited`);
}

export function lastJson(lines: string[]): unknown {
  if (lines.length === 0) throw new Error("no output captured");
  return JSON.parse(lines[lines.length - 1]);
}
