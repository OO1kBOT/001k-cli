import { describe, it, expect } from "vitest";
import { stringFlag, kebabToSnake, toParams } from "../src/flag-utils.js";

describe("stringFlag", () => {
  it("returns string value", () => {
    expect(stringFlag({ name: "alice" }, "name")).toBe("alice");
  });

  it("returns undefined for boolean", () => {
    expect(stringFlag({ verbose: true }, "verbose")).toBeUndefined();
  });

  it("returns undefined for missing key", () => {
    expect(stringFlag({}, "missing")).toBeUndefined();
  });
});

describe("kebabToSnake", () => {
  it("converts hyphens to underscores", () => {
    expect(kebabToSnake("my-flag-name")).toBe("my_flag_name");
  });

  it("no-op for strings without hyphens", () => {
    expect(kebabToSnake("already_snake")).toBe("already_snake");
  });
});

describe("toParams", () => {
  it("picks only string flags and converts keys to snake_case", () => {
    const flags = { "page-size": "10", "sort-by": "date" };
    const result = toParams(flags, ["page-size", "sort-by"]);
    expect(result).toEqual({ page_size: "10", sort_by: "date" });
  });

  it("ignores boolean flags", () => {
    const flags = { verbose: true, name: "test" };
    const result = toParams(flags, ["verbose", "name"]);
    expect(result).toEqual({ name: "test" });
  });

  it("ignores missing keys", () => {
    const result = toParams({ a: "1" }, ["a", "b"]);
    expect(result).toEqual({ a: "1" });
  });

  it("returns empty for empty keys array", () => {
    expect(toParams({ a: "1" }, [])).toEqual({});
  });
});
