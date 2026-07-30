import { createRequire } from "node:module";

export const DEFAULT_BASE_URL = "https://api.001k.world";

export function getVersion(): string {
  const require = createRequire(import.meta.url);
  const pkg = require("../package.json") as { version: string };
  return pkg.version;
}
