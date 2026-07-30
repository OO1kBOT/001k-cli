export type Flags = Record<string, string | boolean>;

export function stringFlag(flags: Flags, key: string): string | undefined {
  const value = flags[key];
  return typeof value === "string" ? value : undefined;
}

export function kebabToSnake(str: string): string {
  return str.replace(/-/g, "_");
}

export function toParams(
  flags: Flags,
  keys: readonly string[],
): Record<string, string> {
  const params: Record<string, string> = {};
  for (const key of keys) {
    const value = stringFlag(flags, key);
    if (value !== undefined) {
      params[kebabToSnake(key)] = value;
    }
  }
  return params;
}
