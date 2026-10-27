# Stellar Transaction Failure Analyzer

A developer tool for diagnosing Stellar transaction failures from decoded transaction results and a small, sourced error catalog. Unknown results are reported as unknown; the analyzer does not infer a cause from transaction context.

## Features

- Look up a transaction hash on Stellar Testnet or Mainnet using RPC, with a Horizon fallback for transactions not available from the RPC node.
- Decode a base64 XDR `TransactionResult` directly.
- Inspect transaction and available operation result codes, with explanations linked to Stellar documentation.
- Copy or download a JSON report; browse the known-error library and integration notes.
- Reusable TypeScript packages for decoding, error mappings, diagnosis, and network lookup.

The app does not persist submitted hashes or results. Hash lookups are sent by the web server to the selected public Stellar RPC and Horizon providers; review those providers' policies before submitting sensitive transaction identifiers.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer

## Run locally

```sh
npm install
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
