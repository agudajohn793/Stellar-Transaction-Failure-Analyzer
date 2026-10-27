import { describe, expect, it } from "vitest";
import { decodeDiagnosticEvents, inspectSimulationResponse } from "./simulation";
import fixture from "../../../fixtures/simulation-results/xdr-payloads.json";

describe("inspectSimulationResponse", () => {
  it("decodes simulation return values and diagnostic events while preserving raw XDR", () => {
    expect(inspectSimulationResponse({
      latestLedger: 123,
      minResourceFee: "100",
      results: [{ xdr: fixture.resultXdr, auth: ["auth-xdr"] }],
      events: [fixture.eventXdr],
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
      restorePreambleFee: "200",
      results: [{
        rawXdr: fixture.resultXdr,
        value: "contract return value"
      }],
      events: [{
        rawXdr: fixture.eventXdr,
        type: "diagnostic",
        contractId: undefined,
        inSuccessfulContractCall: false,
        topics: ["log"],
        data: "fixture event data"
      }]
    });
  });

  it("retains malformed XDR and exposes decode errors without rejecting the response", () => {
    const summary = inspectSimulationResponse({
      results: [{ xdr: fixture.malformedXdr }],
      events: [fixture.malformedXdr]
    });

    expect(summary.results[0]).toEqual({
      rawXdr: fixture.malformedXdr,
      decodeError: "Unable to decode simulation result XDR."
    });
    expect(summary.events[0]).toEqual({
      rawXdr: fixture.malformedXdr,
      decodeError: "Unable to decode diagnostic event XDR."
    });
  });

  it("decodes event lists independently so one invalid event does not hide valid events", () => {
    const decoded = decodeDiagnosticEvents([fixture.eventXdr, fixture.malformedXdr]);

    expect(decoded[0].topics).toEqual(["log"]);
    expect(decoded[1]).toEqual({
      rawXdr: fixture.malformedXdr,
      decodeError: "Unable to decode diagnostic event XDR."
    });
  });

  it("preserves RPC error text and rejects invalid response shapes", () => {
    expect(inspectSimulationResponse({ error: "Host function failed" }).error).toBe("Host function failed");
    expect(() => inspectSimulationResponse([])).toThrow("must be a JSON object");
    expect(() => inspectSimulationResponse({ results: [{ xdr: 1 }] })).toThrow("XDR string");
    expect(() => inspectSimulationResponse({ latestLedger: -1 })).toThrow("non-negative integer");
  });
});
