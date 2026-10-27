# Contributing

## Development

Use Node.js 22.12 or newer and npm:

```sh
npm install
npm run dev
```

Before opening a pull request, run:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

## Error mappings

Add entries only when the code semantics are defined by Stellar's XDR specification or official documentation. Include the exact result code, a concise explanation, actionable checks, and a source URL in `packages/error-catalog/src/index.ts`. Do not infer a cause from unrelated transaction data. Unknown codes must remain unknown.

Add regression data under `fixtures/failed-transactions/` and focused tests covering both the decoded code and diagnosis behavior. Keep XDR inputs as base64 `TransactionResult` values.

## Network lookups

Network URLs are deliberately fixed in `packages/stellar-client`; do not accept user-provided RPC or Horizon URLs. The Next.js route accepts only bounded JSON input and allows only the supported testnet/mainnet values. Do not log or persist submitted transaction data.

Public deployments should configure rate limiting at the edge for `/api/analyze`; process-local counters do not protect multi-instance deployments.

## Pull requests

Keep changes focused, include tests for changed behavior, and document provider-retention or protocol-version limitations when relevant.
