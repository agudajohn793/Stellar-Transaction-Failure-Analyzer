import { describe, expect, it } from "vitest";
import { diagnoseTransaction } from "./index";
import fixtures from "../../../fixtures/failed-transactions/transaction-results.json";
import feeBumpFixture from "../../../fixtures/failed-transactions/fee-bump-inner-failure.json";
import testnetSamples from "../../../fixtures/failed-transactions/testnet-horizon-samples.json";
import operationFailureFixtures from "../../../fixtures/failed-transactions/operation-breakdown.json";
import simulationFixture from "../../../fixtures/simulation-results/xdr-payloads.json";

describe("diagnoseTransaction", () => {
  it("uses documented mappings for known transaction result codes", () => {
    const report = diagnoseTransaction({ resultXdr: fixtures.insufficientBalance.resultXdr });

    expect(report.status).toBe("failed");
    expect(report.resultCode).toBe(fixtures.insufficientBalance.resultCode);
    expect(report.title).toBe("Insufficient account balance");
    expect(report.explanation).toContain("transaction fee");
    expect(report.sourceUrl).toContain("stellar-xdr");
    expect(report.known).toBe(true);
  });

  it("does not infer an explanation for unmapped codes", () => {
    const report = diagnoseTransaction({ resultXdr: fixtures.malformed.resultXdr });

    expect(report.title).toBe("Unmapped transaction result");
    expect(report.explanation).toContain("without inferring a cause");
    expect(report.resultCode).toBe(fixtures.malformed.resultCode);
    expect(report.known).toBe(false);
  });

  it("distinguishes a successful decoded result", () => {
    const report = diagnoseTransaction({ resultXdr: "AAAAAAAAAGQAAAAAAAAAAAAAAAA=" });

    expect(report.status).toBe("success");
    expect(report.title).toBe("Transaction succeeded");
  });

  it("decodes the failing operation and uses its documented mapping", () => {
    const report = diagnoseTransaction({ resultXdr: fixtures.paymentUnderfunded.resultXdr });

    expect(report.resultCode).toBe(fixtures.paymentUnderfunded.resultCode);
    expect(report.title).toBe("Payment source is underfunded");
    expect(report.operations).toEqual([expect.objectContaining({
      index: 1,
      operationType: "payment",
      resultCode: fixtures.paymentUnderfunded.operationResultCode,
      failed: true
    })]);
  });

  it("preserves the original one-based failure index after successful operations", () => {
    const report = diagnoseTransaction({
      resultXdr: operationFailureFixtures.successBeforeFailure
    });

    expect(report.title).toBe("Payment source is underfunded");
    expect(report.primaryFailedOperation).toEqual({
      index: 2,
      operationType: "payment",
      resultCode: "paymentUnderfunded"
    });
    expect(report.operations.map(({ index, failed }) => ({ index, failed }))).toEqual([
      { index: 1, failed: false },
      { index: 2, failed: true }
    ]);
  });

  it("does not promote an unmapped operation result to the transaction diagnosis", () => {
    const report = diagnoseTransaction({
      resultXdr: operationFailureFixtures.unmappedOperationFailure
    });

    expect(report.title).toBe("Unmapped transaction result");
    expect(report.known).toBe(false);
    expect(report.primaryFailedOperation).toBeUndefined();
  });

  it("explains the inner failure of a fee-bump transaction", () => {
    const report = diagnoseTransaction({
      resultXdr: feeBumpFixture.resultXdr
    });

    expect(report.resultCode).toBe(feeBumpFixture.resultCode);
    expect(report.innerResultCode).toBe(feeBumpFixture.innerResultCode);
    expect(report.title).toBe("Insufficient account balance");
    expect(report.known).toBe(true);
  });

  it("diagnoses sourced public Testnet failures with their recorded operation codes", () => {
    for (const fixture of testnetSamples.records) {
      const report = diagnoseTransaction({ resultXdr: fixture.resultXdr });

      expect(report.status).toBe("failed");
      expect(report.resultCode).toBe(fixture.resultCode);
      expect(report.operations.map((operation) => operation.resultCode)).toContain(fixture.operationResultCode);
      expect(report.known).toBe(true);
    }
  });

  it("includes decoded transaction diagnostic events when the provider supplies them", () => {
    const report = diagnoseTransaction({
      resultXdr: fixtures.insufficientBalance.resultXdr,
      source: "rpc",
      diagnosticEventsXdr: [simulationFixture.eventXdr]
    });

    expect(report.diagnosticEvents).toEqual([
      expect.objectContaining({
        rawXdr: simulationFixture.eventXdr,
        type: "diagnostic",
        contractId: undefined,
        inSuccessfulContractCall: false,
        topics: ["log"],
        data: "fixture event data"
      })
    ]);
  });

  it("keeps unavailable and undecodable transaction event data explicit", () => {
    const unavailable = diagnoseTransaction({ resultXdr: fixtures.insufficientBalance.resultXdr });
    const malformed = diagnoseTransaction({
      resultXdr: fixtures.insufficientBalance.resultXdr,
      diagnosticEventsXdr: ["not-xdr"]
    });

    expect(unavailable.diagnosticEvents).toBeUndefined();
    expect(malformed.diagnosticEvents).toEqual([
      expect.objectContaining({
        rawXdr: "not-xdr",
        decodeError: "Unable to decode diagnostic event XDR."
      })
    ]);
  });

  it("rejects malformed XDR with an actionable message", () => {
    expect(() => diagnoseTransaction({ resultXdr: "not-an-xdr" })).toThrow("Invalid base64 Stellar TransactionResult XDR.");
    expect(() => diagnoseTransaction({ resultXdr: "%%%%" })).toThrow("Invalid base64 Stellar TransactionResult XDR.");
  });
});
