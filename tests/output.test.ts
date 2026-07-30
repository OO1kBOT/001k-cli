import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeSuccess, writeApiError, writeCliError, writeNetworkError } from "../src/output.js";
import { ApiError } from "../src/client.js";
import { captureProcess, expectExit, lastJson, type CapturedProcess } from "./exit-helper.js";

let proc: CapturedProcess;

beforeEach(() => {
  proc = captureProcess();
});

afterEach(() => {
  proc.restore();
});

describe("writeSuccess", () => {
  it("writes JSON to stdout and exits 0", async () => {
    await expectExit(() => writeSuccess({ ok: true }), 0);
    expect(lastJson(proc.out)).toEqual({ ok: true });
    expect(proc.err).toHaveLength(0);
  });
});

describe("writeApiError", () => {
  it("writes the ApiError body to stdout and exits 1", async () => {
    const error = new ApiError(400, { type: "validation_error" });
    await expectExit(() => writeApiError(error), 1);
    expect(lastJson(proc.out)).toEqual({ type: "validation_error" });
  });

  it("writes non-ApiError values as-is", async () => {
    await expectExit(() => writeApiError({ raw: 1 }), 1);
    expect(lastJson(proc.out)).toEqual({ raw: 1 });
  });

  it("falls back to serialization_error on unserializable body", async () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    await expectExit(() => writeApiError(new ApiError(500, circular)), 1);
    expect(lastJson(proc.err)).toMatchObject({ code: "serialization_error" });
    expect(proc.out).toHaveLength(0);
  });
});

describe("writeCliError", () => {
  it("writes cli_error payload to stderr and exits 2", async () => {
    await expectExit(() => writeCliError("bad flag", "invalid_flag"), 2);
    expect(lastJson(proc.err)).toEqual({
      cli_error: true,
      message: "bad flag",
      code: "invalid_flag",
    });
    expect(proc.out).toHaveLength(0);
  });
});

describe("writeNetworkError", () => {
  it("writes network_error payload to stderr and exits 3", async () => {
    await expectExit(() => writeNetworkError("ECONNREFUSED"), 3);
    expect(lastJson(proc.err)).toEqual({
      network_error: true,
      message: "ECONNREFUSED",
    });
  });
});
