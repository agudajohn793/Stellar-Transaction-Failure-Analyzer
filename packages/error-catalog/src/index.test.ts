import { describe, expect, it } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { errorCatalog } from "./index";

describe("error catalog", () => {
  it("uses result-code names defined by the Stellar SDK and unique mappings", () => {
    const knownCodes = new Set(
      Object.entries(xdr)
        .filter(([name]) => name.endsWith("ResultCode"))
        .flatMap(([, table]) => Object.keys(table).filter((code) => code !== "schema"))
    );
    const codes = errorCatalog.map((mapping) => mapping.code);

    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.filter((code) => !knownCodes.has(code))).toEqual([]);
  });

  it("includes a source and actionable checks for each mapping", () => {
    for (const mapping of errorCatalog) {
      expect(mapping.sourceUrl).toMatch(/^https:\/\//);
      expect(mapping.explanation.length).toBeGreaterThan(20);
      expect(mapping.checks.length).toBeGreaterThan(0);
    }
  });
});
