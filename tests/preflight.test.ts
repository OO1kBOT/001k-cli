import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { compareVersions, cliCheck, skillCheck } from "../src/preflight.js";
import { getVersion } from "../src/constants.js";
import { captureProcess, expectExit, lastJson, type CapturedProcess } from "./exit-helper.js";

describe("compareVersions", () => {
  it.each([
    ["1.0.0", "1.0.0", false],
    ["1.0.0", "1.0.1", true],
    ["1.0.1", "1.0.0", false],
    ["1.0.0", "2.0.0", true],
    ["2.0.0", "1.9.9", false],
    ["1.0.0", "1.0.0.1", true],
    ["1.0", "1.0.0", false],
    ["1.0.10", "1.0.9", false],
    ["abc", "1.0.0", true],
    ["1.0.0", "abc", false],
  ])("compareVersions(%s, %s) -> %s", (current, required, older) => {
    expect(compareVersions(current, required)).toBe(older);
  });
});

describe("preflight commands", () => {
  let proc: CapturedProcess;

  beforeEach(() => {
    proc = captureProcess();
  });

  afterEach(() => {
    proc.restore();
  });

  describe("cliCheck", () => {
    it("exits 2 with missing_required_version when flag absent", async () => {
      await expectExit(() => cliCheck({}), 2);
      expect(lastJson(proc.err)).toMatchObject({ code: "missing_required_version" });
    });

    it("reports needUpdate: false when current version satisfies", async () => {
      await expectExit(() => cliCheck({ "required-version": "0.0.1" }), 0);
      expect(lastJson(proc.out)).toEqual({
        currentVersion: getVersion(),
        requiredVersion: "0.0.1",
        needUpdate: false,
      });
    });

    it("reports needUpdate: true when current version is older", async () => {
      await expectExit(() => cliCheck({ "required-version": "999.0.0" }), 0);
      expect(lastJson(proc.out)).toMatchObject({ needUpdate: true });
    });
  });

  describe("skillCheck", () => {
    it("exits 2 with missing_required_version when flag absent", async () => {
      await expectExit(() => skillCheck({}), 2);
      expect(lastJson(proc.err)).toMatchObject({ code: "missing_required_version" });
    });

    it("reports needUpdateSkill: true when skill is older than the CLI", async () => {
      await expectExit(() => skillCheck({ "required-version": "0.0.1" }), 0);
      expect(lastJson(proc.out)).toEqual({
        currentVersion: getVersion(),
        skillVersion: "0.0.1",
        needUpdateSkill: true,
      });
    });

    it("reports needUpdateSkill: false when skill matches the CLI version", async () => {
      await expectExit(() => skillCheck({ "required-version": getVersion() }), 0);
      expect(lastJson(proc.out)).toMatchObject({ needUpdateSkill: false });
    });
  });
});
