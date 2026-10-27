import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lookupTransaction: vi.fn() }));

vi.mock("@stellar-failure/stellar-client", () => ({
  lookupTransaction: mocks.lookupTransaction,
  TransactionLookupError: class extends Error {
    constructor(
      message: string,
      readonly status: 404 | 502 | 503,
      readonly retryAfter?: string
    ) {
      super(message);
      this.name = "TransactionLookupError";
    }
  }
}));

import { POST } from "./route";
import { TransactionLookupError } from "@stellar-failure/stellar-client";

afterEach(() => {
  vi.clearAllMocks();
});

function request(body: string, headers: HeadersInit = { "Content-Type": "application/json" }): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers,
    body
  });
}

describe("POST /api/analyze", () => {
  it("rejects non-JSON content types", async () => {
    const response = await POST(request("{}", { "Content-Type": "text/plain" }));
    expect(response.status).toBe(415);
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.any(String) });
  });

  it("rejects oversized declared bodies before reading them", async () => {
    const response = await POST(request("", {
      "Content-Type": "application/json",
      "Content-Length": "250001"
    }));
    expect(response.status).toBe(413);
    expect(await response.json()).toMatchObject({ error: "Request body exceeds the 250 KB limit." });
  });

  it("rejects malformed hashes without making a network request", async () => {
    const response = await POST(request(JSON.stringify({
      type: "hash",
      transactionHash: "invalid",
      network: "testnet"
    })));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "Transaction hash must be 64 hexadecimal characters."
    });
  });

  it("returns a diagnosis for valid transaction-result XDR", async () => {
    const response = await POST(request(JSON.stringify({
      type: "xdr",
      resultXdr: "AAAAAAAAAGT////5AAAAAA=="
    })));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      status: "failed",
      resultCode: "txInsufficientBalance",
      title: "Insufficient account balance"
    });
  });

  it("returns the provider's not-found status for an unavailable transaction", async () => {
    mocks.lookupTransaction.mockRejectedValue(new TransactionLookupError(
      "Transaction was not found on this network.",
      404
    ));
    const response = await POST(request(JSON.stringify({
      type: "hash",
      transactionHash: "a".repeat(64),
      network: "testnet"
    })));

    expect(response.status).toBe(404);
  });

  it("returns a retryable response and retry delay for provider rate limits", async () => {
    mocks.lookupTransaction.mockRejectedValue(new TransactionLookupError(
      "The network provider is rate-limiting lookups. Try again later.",
      503,
      "30"
    ));
    const response = await POST(request(JSON.stringify({
      type: "hash",
      transactionHash: "a".repeat(64),
      network: "testnet"
    })));

    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("30");
  });
});
