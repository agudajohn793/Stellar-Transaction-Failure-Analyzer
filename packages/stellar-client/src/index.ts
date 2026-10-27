import { rpc } from "@stellar/stellar-sdk";

export type StellarNetwork = "testnet" | "mainnet";

const endpoints: Record<StellarNetwork, { rpc: string; horizon: string }> = {
  testnet: {
    rpc: "https://soroban-testnet.stellar.org",
    horizon: "https://horizon-testnet.stellar.org"
  },
  mainnet: {
    rpc: "https://soroban.stellar.org",
    horizon: "https://horizon.stellar.org"
  }
};

export interface TransactionLookup {
  resultXdr: string;
  transactionHash: string;
  ledger?: number;
  network: StellarNetwork;
  source: "rpc" | "horizon";
}

interface HorizonTransaction {
  hash: string;
  ledger: number;
  result_xdr: string;
}

export async function lookupTransaction(
  transactionHash: string,
  network: StellarNetwork
): Promise<TransactionLookup> {
  if (!/^[a-fA-F0-9]{64}$/.test(transactionHash)) {
    throw new Error("Transaction hash must be 64 hexadecimal characters.");
  }
  if (network !== "testnet" && network !== "mainnet") {
    throw new Error("Network must be testnet or mainnet.");
  }

  const { rpc: rpcUrl, horizon } = endpoints[network];
  let rpcUnavailable = false;

  try {
    const response = await new rpc.Server(rpcUrl, { timeout: 10_000 }).getTransaction(transactionHash);
    if (response.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      if (response.txHash.toLowerCase() !== transactionHash.toLowerCase()) {
        throw new Error("RPC returned a different transaction hash.");
      }
      return {
        resultXdr: response.resultXdr.toXdr("base64"),
        transactionHash,
        ledger: response.ledger,
        network,
        source: "rpc"
      };
    }
  } catch {
    rpcUnavailable = true;
  }

  let response: Response;
  try {
    response = await fetch(`${horizon}/transactions/${encodeURIComponent(transactionHash)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json" }
    });
  } catch {
    throw new Error("Transaction lookup is unavailable from the selected network providers. Try again later.");
  }

  if (response.status === 404) {
    if (rpcUnavailable) {
      throw new Error("Transaction lookup failed: the RPC node was unavailable and Horizon has no matching transaction.");
    }
    throw new Error("Transaction was not found on this network. The selected providers may not retain its ledger.");
  }
  if (!response.ok) {
    throw new Error("Transaction lookup is unavailable from the selected network providers. Try again later.");
  }

  let transaction: HorizonTransaction;
  try {
    transaction = await response.json() as HorizonTransaction;
  } catch {
    throw new Error("Horizon returned an invalid transaction response.");
  }

  if (
    typeof transaction.hash !== "string" ||
    transaction.hash.toLowerCase() !== transactionHash.toLowerCase() ||
    !Number.isSafeInteger(transaction.ledger) ||
    typeof transaction.result_xdr !== "string" ||
    !transaction.result_xdr
  ) {
    throw new Error("Transaction lookup is unavailable from the selected network providers. Try again later.");
  }

  return {
    resultXdr: transaction.result_xdr,
    transactionHash,
    ledger: transaction.ledger,
    network,
    source: "horizon"
  };
}

export function getNetworkEndpoints(network: StellarNetwork): Readonly<{ rpc: string; horizon: string }> {
  return endpoints[network];
}
