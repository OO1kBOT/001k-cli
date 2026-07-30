import { describe, it, expect } from "vitest";
import { parseArgs } from "../src/parse-args.js";

describe("parseArgs", () => {
  it("parses entity and action from positional args", () => {
    const result = parseArgs(["wallet", "deposit"]);
    expect(result.entity).toBe("wallet");
    expect(result.action).toBe("deposit");
    expect(result.flags).toEqual({});
  });

  it("parses --flag value pairs", () => {
    const result = parseArgs(["--amount", "100", "--token", "USDT"]);
    expect(result.flags).toEqual({ amount: "100", token: "USDT" });
  });

  it("treats flags followed by another flag or end-of-args as boolean", () => {
    const result = parseArgs(["--verbose", "--dry-run"]);
    expect(result.flags).toEqual({ verbose: true, "dry-run": true });
  });

  it("handles mixed positional and flags", () => {
    const result = parseArgs(["wallet", "deposit", "--amount", "50", "--verbose"]);
    expect(result.entity).toBe("wallet");
    expect(result.action).toBe("deposit");
    expect(result.flags).toEqual({ amount: "50", verbose: true });
  });

  it("returns empty entity and action for empty argv", () => {
    const result = parseArgs([]);
    expect(result.entity).toBe("");
    expect(result.action).toBe("");
    expect(result.flags).toEqual({});
  });

  it("preserves kebab-case flag names", () => {
    const result = parseArgs(["--api-key", "abc123", "--no-cache"]);
    expect(result.flags).toEqual({ "api-key": "abc123", "no-cache": true });
  });

  it("parses --flag=value form", () => {
    const result = parseArgs(["deposit", "list", "--limit=10", "--status=success"]);
    expect(result.entity).toBe("deposit");
    expect(result.action).toBe("list");
    expect(result.flags).toEqual({ limit: "10", status: "success" });
  });

  it("splits --flag=value on the first = only", () => {
    const result = parseArgs(["--url=https://x?a=b&c=d"]);
    expect(result.flags).toEqual({ url: "https://x?a=b&c=d" });
  });

  it("treats an empty --flag= as an empty string value", () => {
    const result = parseArgs(["--note="]);
    expect(result.flags).toEqual({ note: "" });
  });
});
