# Security Policy

`001k-cli` signs authenticated requests to the 001k.bot API and can move real
funds (deposits, withdrawals, swaps, transfers). Please treat security reports
with care.

## Reporting a Vulnerability

**Do not open public GitHub issues for security problems.**

- Preferred: use GitHub's **private vulnerability reporting** (Security -> Report a vulnerability).
- Or email **security@001k.bot**.

Please include reproduction steps and affected versions. We aim to acknowledge
within **48 hours**. Issues in credential handling, request signing, or
transport are treated as **critical**.

You can use this contact to report a vulnerability in **any 001k.bot resource** — this CLI, the bundled skill, or the wider 001k.bot platform.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | Yes       |

## How Credentials Are Handled

- Your **secret key is used only locally** to compute an HMAC-SHA256 signature.
  It is never sent to the API or logged.
- Access keys are **masked** in `auth status` output.
- Profiles are stored as JSON at `~/.001k/profiles/<name>.json` (global) or
  `./.001k/profiles/<name>.json` (project), with owner-only permissions
  (`0600`, in a `0700` directory).
- **Keys are stored unencrypted at rest.** Do not sync `~/.001k/` to cloud
  backups, and prefer least-privilege API keys.
- Never commit `.env` or `.001k/` (both are covered by `.gitignore`).
- If you suspect a key is exposed, **rotate it immediately** at https://001k.bot.

## Encrypted Reports (PGP)

You may encrypt sensitive reports to **security@001k.bot** with our PGP key
([`security-pubkey.asc`](./security-pubkey.asc)):

- **Fingerprint:** `FA18 D018 8275 CD97 BC0F 114A B868 16AE 1024 772F`
- **User ID:** `Security 001k.bot <security@001k.bot>`
- **Type:** RSA 4096 (expires 2037-07-17)

```bash
gpg --import security-pubkey.asc
gpg --fingerprint security@001k.bot   # verify it matches the fingerprint above
```
