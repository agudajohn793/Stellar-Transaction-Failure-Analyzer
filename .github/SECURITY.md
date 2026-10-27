# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately using [GitHub Security Advisories](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/security/advisories/new). Do not publish exploitable details in a public issue.

Include affected versions, impact, and concise reproduction steps. Do not include private keys, seed phrases, access tokens, or other credentials.

## Scope notes

The web API accepts bounded input and contacts fixed public Stellar network endpoints. It does not intentionally persist or log submitted transaction data. Public deployments should configure edge-level rate limits to protect upstream providers.

Security reports are reviewed on a best-effort basis; no response-time SLA is promised.
