import {
  decodeDiagnosticEvents,
  decodeTransactionResult,
  type DecodedDiagnosticEvent,
  type DecodedOperationResult
} from "@stellar-failure/decoder";
import { getErrorMapping } from "@stellar-failure/error-catalog";

export interface TransactionInput {
  resultXdr: string;
  transactionHash?: string;
  network?: "testnet" | "mainnet";
  ledger?: number;
  source?: "rpc" | "horizon" | "xdr";
  diagnosticEventsXdr?: string[];
}

export interface OperationDiagnosis extends DecodedOperationResult {
  title: string;
  explanation: string;
  checks: string[];
  sourceUrl?: string;
  known: boolean;
}

export interface TransactionDiagnosis {
  status: "success" | "failed";
  resultCode: string;
  innerResultCode?: string;
  title: string;
  explanation: string;
  checks: string[];
  sourceUrl?: string;
  known: boolean;
  transactionHash?: string;
  network?: "testnet" | "mainnet";
  ledger?: number;
  source?: "rpc" | "horizon" | "xdr";
  feeCharged: string;
  operations: OperationDiagnosis[];
  primaryFailedOperation?: Pick<OperationDiagnosis, "index" | "operationType" | "resultCode">;
  diagnosticEvents?: DecodedDiagnosticEvent[];
}

const unknownMessage = "No documented explanation is available in this catalog for this result code. The decoded code is shown without inferring a cause.";

function diagnoseOperation(operation: DecodedOperationResult): OperationDiagnosis {
  const mapping = getErrorMapping(operation.resultCode);
  return {
    ...operation,
    title: mapping?.title ?? operation.resultCode,
    explanation: mapping?.explanation ?? unknownMessage,
    checks: mapping?.checks ?? [],
    sourceUrl: mapping?.sourceUrl,
    known: Boolean(mapping)
  };
}

export function diagnoseTransaction(input: TransactionInput): TransactionDiagnosis {
  const decoded = decodeTransactionResult(input.resultXdr);
  const mapping = getErrorMapping(decoded.innerResultCode ?? decoded.resultCode);
  const failed = decoded.resultCode !== "txSuccess" && decoded.resultCode !== "txFeeBumpInnerSuccess";
  const operations = decoded.operations.map(diagnoseOperation);
  const failedOperation = operations.find((operation) => operation.failed);
  const mappedFailedOperation = failedOperation?.known ? failedOperation : undefined;
  const hasFailedTransactionResult = decoded.resultCode === "txFailed" || decoded.innerResultCode === "txFailed";
  const topMapping = mapping ?? (
    hasFailedTransactionResult
      ? mappedFailedOperation
      : undefined
  );

  return {
    status: failed ? "failed" : "success",
    resultCode: decoded.resultCode,
    innerResultCode: decoded.innerResultCode,
    title: topMapping?.title ?? (failed ? "Unmapped transaction result" : "Transaction succeeded"),
    explanation: topMapping?.explanation ?? (failed ? unknownMessage : "The decoded transaction result indicates success."),
    checks: topMapping?.checks ?? [],
    sourceUrl: topMapping?.sourceUrl,
    known: Boolean(topMapping),
    transactionHash: input.transactionHash,
    network: input.network,
    ledger: input.ledger,
    source: input.source ?? "xdr",
    feeCharged: decoded.feeCharged,
    operations,
    primaryFailedOperation: hasFailedTransactionResult && mappedFailedOperation
      ? {
          index: mappedFailedOperation.index,
          operationType: mappedFailedOperation.operationType,
          resultCode: mappedFailedOperation.resultCode
        }
      : undefined,
    diagnosticEvents: input.diagnosticEventsXdr === undefined
      ? undefined
      : decodeDiagnosticEvents(input.diagnosticEventsXdr)
  };
}
