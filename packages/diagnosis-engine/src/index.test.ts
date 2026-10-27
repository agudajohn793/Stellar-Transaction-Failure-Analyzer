import { describe, expect, it } from "vitest";
import { diagnoseTransaction } from "./index";
import fixtures from "../../../fixtures/failed-transactions/transaction-results.json";
import feeBumpFixture from "../../../fixtures/failed-transactions/fee-bump-inner-failure.json";

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

  it("explains the inner failure of a fee-bump transaction", () => {
    const report = diagnoseTransaction({
      resultXdr: feeBumpFixture.resultXdr
    });

    expect(report.resultCode).toBe(feeBumpFixture.resultCode);
    expect(report.innerResultCode).toBe(feeBumpFixture.innerResultCode);
    expect(report.title).toBe("Insufficient account balance");
    expect(report.known).toBe(true);
  });

  it("rejects malformed XDR with an actionable message", () => {
    expect(() => diagnoseTransaction({ resultXdr: "not-an-xdr" })).toThrow("Invalid base64 Stellar TransactionResult XDR.");
    expect(() => diagnoseTransaction({ resultXdr: "%%%%" })).toThrow("Invalid base64 Stellar TransactionResult XDR.");
  });
});
