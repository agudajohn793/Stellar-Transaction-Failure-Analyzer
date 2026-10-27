# Stellar Trace — Drips Wave proposal draft

> **Draft only.** This document is project preparation, not a submitted application, grant award, or claim of acceptance. Confirm an active Stellar Wave, its eligibility rules, deliverable format, timeline, and reward process with Drips before applying.

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

**Known gaps:** no hosted demo, no published SDK packages, limited error-code coverage, no external usage metrics, and no deployment-level rate limiter configured in this repository. Do not present these as completed deliverables.

## Proposed milestones

These are estimates for discussion. Adapt the scope and schedule to the active Wave's terms before submitting.

### 1. Evidence-backed diagnostic coverage

- Expand mappings for frequently encountered payment, trustline, sponsorship, fee, and Soroban failures.
- Add XDR regression fixtures and source links for every mapping.
- Decode Soroban simulation result and diagnostic-event XDR where supported by the SDK.

**Acceptance evidence:** catalog-to-SDK enum validation, fixture-backed tests, and a public list of supported codes with source links.

### 2. Reliable lookup and integration surface

- Improve provider error, timeout, and rate-limit handling.
- Add a versioned API/report contract and independently consumable diagnosis package exports.
- Document archival provider setup and retention limitations.

**Acceptance evidence:** provider matrix tests, package consumer example, and deployment documentation.

### 3. Usable, accessible release

- Add end-to-end browser coverage and accessibility checks.
- Deploy a public demo with edge-level API rate limiting.
- Gather feedback from Stellar developers and publish a summary without overstating sample size.

**Acceptance evidence:** working demo URL, browser/keyboard test results, deployment configuration, and dated feedback summary.

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

1. Confirm the active Drips Stellar Wave is accepting projects and read its current eligibility and submission rules.
2. Deploy and verify the demo; add its URL to the repository homepage.
3. Replace this draft's estimates with the Wave's actual deadline, scope, and required deliverable format.
4. Add genuine user feedback or usage evidence if available; otherwise state that validation is pending.
5. Submit through the Wave's official process. This document alone does not enroll the repository.
