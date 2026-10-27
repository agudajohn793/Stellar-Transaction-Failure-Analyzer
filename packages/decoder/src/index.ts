import { xdr } from "@stellar/stellar-sdk";
export { decodeDiagnosticEvents, inspectSimulationResponse } from "./simulation";
export type { DecodedDiagnosticEvent, DecodedSimulationResult, SimulationSummary } from "./simulation";

export interface DecodedOperationResult {
  index: number;
  operationType: string | null;
  resultCode: string;
  failed: boolean;
}

export interface DecodedTransactionResult {
  resultCode: string;
  innerResultCode?: string;
  feeCharged: string;
  operations: DecodedOperationResult[];
}

function operationResultCode(result: xdr.OperationResult, index: number): DecodedOperationResult {
  if (result.type !== "opInner") {
    return {
      index,
      operationType: null,
      resultCode: result.type,
      failed: true
    };
  }

  const operationResult = result.tr;
  const code = operationResult.value.type;
  return {
    index,
    operationType: operationResult.type,
    resultCode: code,
    failed: !code.toLowerCase().endsWith("success")
  };
}

function operationResults(result: xdr.TransactionResult["result"]): xdr.OperationResult[] {
  if (result.type === "txFailed") {
    return result.results;
  }

  if (result.type === "txFeeBumpInnerFailed") {
    const innerResult = result.innerResultPair.result.result;
    return innerResult.type === "txFailed" ? innerResult.results : [];
  }

  return [];
}

export function decodeTransactionResult(resultXdr: string): DecodedTransactionResult {
  const trimmed = resultXdr.trim();
  if (!trimmed || trimmed.length > 200_000) {
    throw new Error("Provide a non-empty TransactionResult XDR under 200 KB.");
  }
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(trimmed)) {
    throw new Error("Invalid base64 Stellar TransactionResult XDR.");
  }

  let decoded: xdr.TransactionResult;
  try {
    decoded = xdr.TransactionResult.fromXdr(trimmed, "base64");
  } catch {
    throw new Error("Invalid base64 Stellar TransactionResult XDR.");
  }

  return {
    resultCode: decoded.result.type,
    innerResultCode: decoded.result.type === "txFeeBumpInnerFailed"
      ? decoded.result.innerResultPair.result.result.type
      : undefined,
    feeCharged: decoded.feeCharged.toString(),
    operations: operationResults(decoded.result).map((operationResult, index) =>
      operationResultCode(operationResult, index + 1)
    )
  };
}
