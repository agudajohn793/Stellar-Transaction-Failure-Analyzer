import { describe, expect, it } from "vitest";
import { diagnoseTransaction } from "./index";
import fixture from "../../../fixtures/failed-transactions/soroban-invocation-results.json";

describe("Soroban invocation result mappings", () => {
  it("diagnoses sourced Soroban host-function failures from exact XDR fixtures", () => {
    const expectedTitles: Record<string, string> = {
      invokeHostFunctionTrapped: "Soroban host function trapped",
      invokeHostFunctionResourceLimitExceeded: "Soroban resource limit exceeded",
      invokeHostFunctionEntryArchived: "Soroban ledger entry needs restoration",
      invokeHostFunctionInsufficientRefundableFee: "Soroban refundable fee is insufficient"
    };

    for (const record of fixture.records) {
      const report = diagnoseTransaction({ resultXdr: record.resultXdr });

      expect(report.status).toBe("failed");
      expect(report.resultCode).toBe("txFailed");
      expect(report.operations).toEqual([
        expect.objectContaining({
          operationType: "invokeHostFunction",
          resultCode: record.code,
          title: expectedTitles[record.code],
          known: true,
          failed: true
        })
      ]);
      expect(report.operations[0].sourceUrl).toMatch(/^https:\/\/developers\.stellar\.org\//);
    }
  });
});
