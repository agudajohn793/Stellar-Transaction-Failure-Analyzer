import { describe, expect, it } from "vitest";
import { diagnoseTransaction } from "./index";
import fixture from "../../../fixtures/failed-transactions/operation-mapping-results.json";

describe("operation error catalog mappings", () => {
  it("diagnoses trustline, offer, and sponsorship result codes from XDR fixtures", () => {
    for (const record of fixture.records) {
      const report = diagnoseTransaction({ resultXdr: record.resultXdr });
      const operation = report.operations[0];

      expect(report.status).toBe("failed");
      expect(report.known).toBe(true);
      expect(operation).toEqual(expect.objectContaining({
        operationType: record.operationType,
        resultCode: record.code,
        failed: true,
        known: true
      }));
      expect(operation.title).not.toBe(record.code);
      expect(operation.explanation).not.toContain("without inferring a cause");
      expect(operation.sourceUrl).toMatch(/^https:\/\/developers\.stellar\.org\//);
    }
  });
});
