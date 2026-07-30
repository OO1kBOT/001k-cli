export type Args = Record<string, string | boolean>;

export interface ParsedArgs {
  entity: string;
  action: string;
  flags: Args;
}

/**
 * Parse `argv` into an entity, an action, and a map of flags.
 * Supports `--flag value`, `--flag=value`, and boolean `--flag` (when the token
 * is followed by another flag or the end of args). Exported so it can be
 * unit-tested directly rather than through a duplicated copy.
 */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Args = {};

  let i = 0;
  while (i < argv.length) {
    const token = argv[i];

    if (token === undefined) {
      i++;
      continue;
    }

    if (token.startsWith("--")) {
      const body = token.slice(2);
      const eq = body.indexOf("=");

      if (eq !== -1) {
        // --key=value ; only the first "=" splits, so values may contain "="
        flags[body.slice(0, eq)] = body.slice(eq + 1);
        i++;
        continue;
      }

      const key = body;
      const next = argv[i + 1];

      if (next === undefined || next.startsWith("--")) {
        flags[key] = true;
        i++;
      } else {
        flags[key] = next;
        i += 2;
      }
    } else {
      positional.push(token);
      i++;
    }
  }

  return {
    entity: positional[0] ?? "",
    action: positional[1] ?? "",
    flags,
  };
}
