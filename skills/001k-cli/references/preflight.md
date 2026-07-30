# Preflight Checks

Run these checks at the start of every session before executing any 001k command.

## 1. CLI Availability

```bash
001k cli-check --required-version 1.0.0
```

Pass the `requiredCliVersion` field from SKILL.md frontmatter (kept in sync
with releases automatically, same as the skill's own `version`).

**Success response:**

```json
{
  "currentVersion": "1.0.0",
  "requiredVersion": "1.0.0",
  "needUpdate": false
}
```

If `needUpdate` is `true` or the command is not found, install or update:

```bash
npm install -g 001k-cli@1.0.0
```

## 2. Authentication Check

```bash
001k auth status
```

**Authenticated response:**

```json
{
  "authenticated": true,
  "profile": "default",
  "accessKey": "ak_1****ab9c",
  "baseUrl": "https://api.001k.world"
}
```

**Not authenticated response:**

```json
{
  "authenticated": false,
  "message": "No profile found."
}
```

If not authenticated, show the user the setup instructions from
[authentication.md](authentication.md) and ask them to run `001k auth login`
in their own terminal.

## 3. Skill Version Check

```bash
001k skill-check --required-version 1.0.0
```

Pass this skill's own version (the `version` field from SKILL.md frontmatter).
The CLI compares it against its own version: if the skill is older than the
installed CLI, the skill files are stale.

**Example response:**

```json
{
  "currentVersion": "1.0.0",
  "skillVersion": "1.0.0",
  "needUpdateSkill": false
}
```

If `needUpdateSkill` is `true`, re-install the skill before proceeding:

```bash
npx skills add OO1kBOT/001k-cli
```

## 4. Checklist

- [ ] CLI installed and version satisfies `1.0.0`
- [ ] `001k auth status` returns `authenticated: true`
- [ ] `001k skill-check` reports `needUpdateSkill: false`
- [ ] All checks pass before proceeding to any other command
