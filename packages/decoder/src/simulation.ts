import { humanizeEvents, scValToNative, xdr } from "@stellar/stellar-sdk";

export interface DecodedSimulationResult {
  rawXdr: string;
  value?: unknown;
  decodeError?: string;
}

export interface DecodedDiagnosticEvent {
  rawXdr: string;
  type?: "contract" | "diagnostic" | "system";
  contractId?: string;
  inSuccessfulContractCall?: boolean;
  topics?: unknown[];
  data?: unknown;
  decodeError?: string;
}

export interface SimulationSummary {
  latestLedger?: number;
  error?: string;
  minimumResourceFee?: string;
  resultCount: number;
  authorizationCount: number;
  diagnosticEventCount: number;
  eventsProvided: boolean;
  restorePreambleFee?: string;
  results: DecodedSimulationResult[];
  events: DecodedDiagnosticEvent[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeSimulationResult(rawXdr: string): DecodedSimulationResult {
  try {
    const value = xdr.ScVal.fromXdr(rawXdr, "base64");
    return { rawXdr, value: scValToNative(value) };
  } catch {
    return { rawXdr, decodeError: "Unable to decode simulation result XDR." };
  }
}

export function decodeDiagnosticEvents(events: string[]): DecodedDiagnosticEvent[] {
  return events.map((rawXdr) => {
    try {
      const event = xdr.DiagnosticEvent.fromXdr(rawXdr, "base64");
      const [humanized] = humanizeEvents([event]);
      if (!humanized) {
        return { rawXdr, decodeError: "Unable to decode diagnostic event XDR." };
      }

      return {
        rawXdr,
        type: humanized.type,
        contractId: humanized.contractId,
        inSuccessfulContractCall: event.inSuccessfulContractCall,
        topics: humanized.topics,
        data: humanized.data
      };
    } catch {
      return { rawXdr, decodeError: "Unable to decode diagnostic event XDR." };
    }
  });
}

export function inspectSimulationResponse(value: unknown): SimulationSummary {
  if (!isRecord(value)) {
    throw new Error("Simulation response must be a JSON object.");
  }

  const latestLedger = value.latestLedger;
  if (latestLedger !== undefined && (
    typeof latestLedger !== "number" ||
    !Number.isSafeInteger(latestLedger) ||
    latestLedger < 0
  )) {
    throw new Error("Simulation latestLedger must be a non-negative integer.");
  }

  const error = value.error;
  if (error !== undefined && typeof error !== "string") {
    throw new Error("Simulation error must be a string.");
  }
  const minimumResourceFee = value.minResourceFee;
  if (minimumResourceFee !== undefined && typeof minimumResourceFee !== "string") {
    throw new Error("Simulation minResourceFee must be a string.");
  }
  const events = value.events === undefined ? [] : value.events;
  if (!Array.isArray(events) || events.some((event) => typeof event !== "string")) {
    throw new Error("Simulation events must be an array of base64 XDR strings.");
  }
  const results = value.results === undefined ? [] : value.results;
  if (!Array.isArray(results)) {
    throw new Error("Simulation results must be an array.");
  }

  let authorizationCount = 0;
  const decodedResults: DecodedSimulationResult[] = [];
  for (const result of results) {
    if (!isRecord(result) || typeof result.xdr !== "string") {
      throw new Error("Each simulation result must contain an XDR string.");
    }
    decodedResults.push(decodeSimulationResult(result.xdr));
    if (result.auth !== undefined) {
      if (!Array.isArray(result.auth) || result.auth.some((entry) => typeof entry !== "string")) {
        throw new Error("Simulation result auth must be an array of base64 XDR strings.");
      }
      authorizationCount += result.auth.length;
    }
  }

  let restorePreambleFee: string | undefined;
  if (value.restorePreamble !== undefined) {
    if (
      !isRecord(value.restorePreamble) ||
      typeof value.restorePreamble.minResourceFee !== "string" ||
      typeof value.restorePreamble.transactionData !== "string"
    ) {
      throw new Error("Simulation restorePreamble must contain minResourceFee and transactionData strings.");
    }
    restorePreambleFee = value.restorePreamble.minResourceFee;
  }

  return {
    latestLedger,
    error,
    minimumResourceFee,
    resultCount: results.length,
    authorizationCount,
    diagnosticEventCount: events.length,
    eventsProvided: value.events !== undefined,
    restorePreambleFee,
    results: decodedResults,
    events: decodeDiagnosticEvents(events)
  };
}
