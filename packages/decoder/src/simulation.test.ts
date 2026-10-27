import { describe, expect, it } from "vitest";
import { inspectSimulationResponse } from "./simulation";

describe("inspectSimulationResponse", () => {
  it("extracts documented simulation fields without interpreting XDR payloads", () => {
    expect(inspectSimulationResponse({
      latestLedger: 123,
      minResourceFee: "100",
      results: [{ xdr: "base64-value", auth: ["auth-xdr"] }],
      events: ["diagnostic-event-xdr"],
      restorePreamble: {
        minResourceFee: "200",
        transactionData: "transaction-data-xdr"
      }
    })).toEqual({
      latestLedger: 123,
      error: undefined,
      minimumResourceFee: "100",
      resultCount: 1,
      authorizationCount: 1,
      diagnosticEventCount: 1,
      restorePreambleFee: "200"
    });
  });

  it("preserves RPC error text and rejects invalid response shapes", () => {
    expect(inspectSimulationResponse({ error: "Host function failed" }).error).toBe("Host function failed");
    expect(() => inspectSimulationResponse([])).toThrow("must be a JSON object");
    expect(() => inspectSimulationResponse({ results: [{ xdr: 1 }] })).toThrow("XDR string");
    expect(() => inspectSimulationResponse({ latestLedger: -1 })).toThrow("non-negative integer");
  });
});
