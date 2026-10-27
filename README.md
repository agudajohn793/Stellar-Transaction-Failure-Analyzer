# Stellar Transaction Failure Analyzer

[![CI](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Stellar Trace** is an open-source developer tool and TypeScript toolkit for turning low-level Stellar transaction result codes into actionable, source-backed diagnostics.

Stellar developers often receive a failed transaction code without a clear explanation of what to inspect next. Stellar Trace decodes the transaction's actual result XDR, identifies operation- and fee-bump-level failures where available, and links known codes to protocol documentation. Unknown codes stay unknown: the tool does not guess causes from unrelated transaction data.

[Live demo](https://stellar-transaction-failure-analyze-ten.vercel.app/) · [Run locally](#run-locally) · [Contribute](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Give feedback](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/issues/38) · [Proposed Drips Wave roadmap](docs/drips-wave-proposal.md) · [Open issues](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/issues)

## Features

- Look up a transaction hash on Stellar Testnet or Mainnet using RPC, with a Horizon fallback for transactions not available from the RPC node.
- Decode a base64 XDR `TransactionResult` directly.
- Inspect transaction and available operation result codes, with explanations linked to Stellar documentation.
- Copy or download a JSON report; browse the known-error library and integration notes.
- Reusable TypeScript packages for decoding, error mappings, diagnosis, and network lookup.
- A regression corpus of synthetic cases and sourced public Testnet failures, with transaction hashes and ledgers recorded for traceability.

The app does not persist submitted hashes or results. Hash lookups are sent by the web server to the selected public Stellar RPC and Horizon providers; review those providers' policies before submitting sensitive transaction identifiers.

## Project status

This is an early, independently maintained MVP. It has a tested diagnosis engine, a working web interface, and a [live demo](https://stellar-transaction-failure-analyze-ten.vercel.app/). It does not yet have published npm packages or reported external user-validation results. The planned work is tracked in [GitHub issues](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/issues); contributions and real-world feedback are welcome.

Stellar developers are invited to [try the offline Testnet examples and share feedback](https://github.com/agudajohn793/Stellar-Transaction-Failure-Analyzer/issues/38). No external user validation is claimed until feedback is received and summarized.

## Try it

Try the [live demo](https://stellar-transaction-failure-analyze-ten.vercel.app/), or run it locally:

1. Install Node.js 22.12 or newer and npm.
2. Clone this repository and run `npm ci`.
3. Run `npm run dev`, then open http://localhost:3000.
4. Choose **Paste XDR** and paste a base64 Stellar `TransactionResult`, or look up a 64-character transaction hash on Testnet or Mainnet.

For a quick, synthetic XDR test, paste:

```text
AAAAAAAAAGT////5AAAAAA==
```

This decodes to `txInsufficientBalance`. The repository also includes reproducible public Testnet failure samples in [`fixtures/failed-transactions/testnet-horizon-samples.json`](fixtures/failed-transactions/testnet-horizon-samples.json); provider history can change or be pruned, so the captured XDR is kept as an offline regression fixture.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No API credentials or database are required.

## Checks

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## Architecture

- `apps/web`: Next.js dashboard, API route, and documentation pages.
- `packages/decoder`: Stellar TransactionResult XDR decoding.
- `packages/error-catalog`: documented, traceable mappings.
- `packages/diagnosis-engine`: reusable `diagnoseTransaction()` function and report types.
- `packages/stellar-client`: fixed-network RPC lookup and Horizon fallback.
- `fixtures`: regression inputs.

## Scope and limitations

Only documented result codes in the catalog receive a diagnosis. Other codes remain visible with an “unmapped” explanation. Operation-level results are shown only when present in the decoded XDR. Fee-bump failures retain both the outer and inner result codes. A standard RPC node may not retain older transactions; Horizon is attempted as a fallback, but archival coverage depends on the selected network's provider. This MVP accepts a base64-encoded XDR `TransactionResult`, not arbitrary transaction envelopes. The simulation inspector validates and summarizes raw RPC response fields but does not decode their embedded XDR payloads.

For a public deployment, configure edge-level rate limiting for `/api/analyze` to protect upstream public-node quotas. The application intentionally has no process-local limiter because it would not be reliable across serverless instances.

## Deployment

The [live Vercel deployment](https://stellar-transaction-failure-analyze-ten.vercel.app/) is configured from this repository. Its homepage and XDR diagnosis API were smoke-tested on 2026-10-27. The deployment has not yet been verified under rate limiting; configure edge-level rate limiting for `/api/analyze` before broad public promotion. The GitHub repository homepage field may also be set to the demo URL.

To reproduce the deployment, use the [Vercel GitHub import](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fagudajohn793%2FStellar-Transaction-Failure-Analyzer). Select `apps/web` as the project root, keep the detected Next.js framework and install settings, and use `npm run build` as the build command. The web workspace declares its own Tailwind/PostCSS and TypeScript build dependencies; the root lockfile still includes the local workspace packages. Ensure Vercel includes files outside the project root so those packages are available during build.

## Drips Wave proposal

The project has a draft, evidence-based proposal and milestone plan in [`docs/drips-wave-proposal.md`](docs/drips-wave-proposal.md). It is not an application and does not imply acceptance into an active Wave; confirm the relevant Wave is open and follow its submission rules before applying.
