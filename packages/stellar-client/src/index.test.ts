import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getTransaction: vi.fn() }));

vi.mock("@stellar/stellar-sdk", () => ({
  rpc: {
    Api: { GetTransactionStatus: { NOT_FOUND: "NOT_FOUND" } },
    Server: class {
      getTransaction(hash: string) {
        return mocks.getTransaction(hash);
      }
    }
  }
}));

import { lookupTransaction } from "./index";
import eventFixture from "../../../fixtures/simulation-results/xdr-payloads.json";

const hash = "a".repeat(64);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("lookupTransaction", () => {
  it("uses a matching RPC result without contacting Horizon", async () => {
    mocks.getTransaction.mockResolvedValue({
      status: "FAILED",
      txHash: hash.toUpperCase(),
      ledger: 42,
      resultXdr: { toXdr: () => "rpc-result-xdr" },
      diagnosticEventsXdr: [{ toXdr: () => eventFixture.eventXdr }]
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(lookupTransaction(hash, "testnet")).resolves.toEqual({
      resultXdr: "rpc-result-xdr",
      diagnosticEventsXdr: [eventFixture.eventXdr],
      transactionHash: hash,
      ledger: 42,
      network: "testnet",
      source: "rpc"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to a validated Horizon transaction when RPC has pruned it", async () => {
    mocks.getTransaction.mockResolvedValue({ status: "NOT_FOUND" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      hash: hash.toUpperCase(),
      ledger: 81,
      result_xdr: "horizon-result-xdr"
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(lookupTransaction(hash, "mainnet")).resolves.toEqual({
      resultXdr: "horizon-result-xdr",
      transactionHash: hash,
      ledger: 81,
      network: "mainnet",
      source: "horizon"
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://horizon.stellar.org/transactions/${hash}`,
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("refuses a Horizon response for a different transaction", async () => {
    mocks.getTransaction.mockResolvedValue({ status: "NOT_FOUND" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      hash: "b".repeat(64),
      ledger: 81,
      result_xdr: "horizon-result-xdr"
    }), { status: 200 })));

    await expect(lookupTransaction(hash, "testnet")).rejects.toThrow(
      "Transaction lookup is unavailable from the selected network providers."
    );
  });

  it("preserves Horizon rate limits as a retryable provider error", async () => {
    mocks.getTransaction.mockResolvedValue({ status: "NOT_FOUND" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, {
      status: 429,
      headers: { "Retry-After": "30" }
    })));

    await expect(lookupTransaction(hash, "testnet")).rejects.toMatchObject({
      name: "TransactionLookupError",
      status: 503,
      retryAfter: "30"
    });
  });

  it("classifies Horizon server failures as temporarily unavailable", async () => {
    mocks.getTransaction.mockResolvedValue({ status: "NOT_FOUND" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(lookupTransaction(hash, "testnet")).rejects.toMatchObject({
      name: "TransactionLookupError",
      status: 503
    });
  });

  it("validates the hash before contacting a provider", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(lookupTransaction("bad", "testnet")).rejects.toThrow(
      "Transaction hash must be 64 hexadecimal characters."
    );
    expect(mocks.getTransaction).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
