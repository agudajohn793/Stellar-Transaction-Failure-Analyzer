# Stellar Trace — Drips Wave proposal draft

> **Draft only.** This document is project preparation, not a submitted application, grant award, or claim of acceptance. Confirm an active Stellar Wave, its eligibility rules, deliverable format, timeline, and reward process with Drips before applying.

> **Eligibility status (checked 2026-10-27):** Drips' [public homepage](https://www.drips.network/) describes recurring Waves as rewarding merged pull requests. It does not provide an active Stellar Wave's eligibility rules or a submission link. This proposal therefore cannot establish that a standalone project application is currently eligible; confirm the exact Wave and whether it accepts this model before submitting.

## Project

**Name:** Stellar Trace — Stellar Transaction Failure Analyzer

**Repository:** <https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer>

**License:** MIT
**Category:** Open-source Stellar developer tooling

## Summary

Stellar Trace is a developer-facing tool for understanding why a Stellar transaction failed. Given a transaction hash or a base64 `TransactionResult` XDR, it decodes the protocol result, identifies available operation-level or fee-bump failure codes, and presents documented explanations and next checks. Its TypeScript diagnosis engine is reusable independently of the dashboard.

The tool deliberately distinguishes protocol evidence from interpretation: it links explanations to Stellar's XDR specification or official operation documentation, and reports unknown codes as unmapped instead of guessing.

## Problem and intended users

Developers integrating Stellar payments, assets, and Soroban applications encounter protocol result codes that can be difficult to interpret from raw XDR alone. They need a quick path from an exact decoded result to relevant protocol context and practical debugging checks.

The intended users are application developers, integrators, and maintainers of Stellar tooling. This is a hypothesis about the audience, not a claim that external users have already validated the product.

## Current state

- Working Next.js application and API route.
- Reusable TypeScript packages for TransactionResult decoding, catalog lookup, diagnosis, and public-network lookup.
- Testnet/Mainnet lookup using RPC with a Horizon fallback.
- Documented result mappings, including operation-level and fee-bump reporting.
- Sourced public Testnet failed-result samples with transaction links, ledger numbers, captured XDR, and offline regression tests.
- Simulation response schema inspection; embedded simulation XDR is not yet decoded.
- Automated regression, route, client, catalog, lint, type-check, production-build, and dependency-audit checks.
- Public backlog and contribution guidance.

**Known gaps:** no hosted demo, no published SDK packages, limited error-code coverage, no external user feedback yet, no external usage metrics, and no deployment-level rate limiter configured in this repository. A public [feedback request](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/issues/38) is open; it is not evidence that validation has occurred. Do not present these as completed deliverables.

## Proposed milestones

These are deliverable-based work packages, not commitments to an unverified Wave. Map them to the active Wave's issue, PR, schedule, and reward rules before submitting; omit any item the Wave does not accept.

### 1. Decode and explain Soroban failures

- Decode simulation result and diagnostic-event XDR with explicit handling for missing or unknown fields.
- Add exact Soroban failure fixtures and source links for every new interpretation.
- Keep unsupported or ambiguous results explicitly unmapped rather than inferring a contract cause.

**Acceptance evidence:** a reviewable PR, fixture-backed decoder tests, and a generated supported-code reference whose entries link to protocol or official documentation.

### 2. Harden lookup and package integration

- Test RPC and Horizon not-found, timeout, rate-limit, malformed-response, and fallback behavior.
- Publish a versioned report/API contract and prove the diagnosis package works from a clean consumer project.
- Document archival coverage, provider retention, and safe deployment rate limiting.

**Acceptance evidence:** provider matrix tests, a clean-install consumer example, and deployment instructions that identify the rate-limiting boundary.

### 3. Validate the user workflow

- Cover XDR paste, known failure diagnosis, unmapped result, JSON export, and network lookup in browser tests.
- Check keyboard and screen-reader status announcements on those workflows.
- Deploy a public demo only after edge-level API rate limiting is configured; collect and summarize genuine developer feedback with sample size and limitations.

**Acceptance evidence:** browser/accessibility results, a verified demo URL and rate-limit configuration, plus a dated feedback summary that distinguishes responses received from outreach still pending. If deployment or external feedback is outside Wave scope, leave it clearly marked incomplete.

## Success measures

Measure only after the work is live; do not treat these targets as achieved results.

- Number of exact transaction and operation result codes with reviewed official sources.
- Test coverage for decoding and result-to-diagnosis behavior.
- Successful completion of documented example workflows on Testnet and Mainnet.
- Issues or feedback from developers, with response and resolution status.
- Public demo availability and observed provider error rates, if privacy-preserving metrics are explicitly configured.

No analytics or persisted transaction submissions are currently implemented. Any future telemetry should be opt-in or aggregated, documented, and must not collect transaction hashes or XDR by default.

## Why a Stellar-focused Wave

This project is specifically built around Stellar transaction-result XDR, Stellar RPC/Horizon lookup, Stellar's protocol result codes, and Soroban simulation responses. Funding would support maintained public-good developer tooling in the Stellar ecosystem rather than a chain-agnostic explorer.

## Maintainer commitments

- Keep result explanations traceable to exact decoded result codes and published protocol sources.
- Keep unknown results explicitly unmapped.
- Publish implementation progress and tests through reviewable pull requests.
- Maintain clear issue, security-reporting, and contribution guidance.
- Disclose provider limitations, scope changes, and incomplete milestones.

## Before submitting

1. Obtain the exact active Stellar Wave URL and confirm that it accepts this type of project and these deliverables; the Drips homepage alone does not establish eligibility.
2. Deploy and verify the demo; add its URL to the repository homepage.
3. Replace this draft's estimates with the Wave's actual deadline, scope, and required deliverable format.
4. Add genuine user feedback or usage evidence if available; otherwise state that validation is pending.
5. Submit through the Wave's official process. This document alone does not enroll the repository.
