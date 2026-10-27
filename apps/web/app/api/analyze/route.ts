import { diagnoseTransaction } from "@stellar-failure/diagnosis-engine";
import { lookupTransaction, type StellarNetwork } from "@stellar-failure/stellar-client";

export const runtime = "nodejs";
export const maxDuration = 25;

const maxBodyBytes = 250_000;

class RequestBodyError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function readLimitedBody(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
    throw new RequestBodyError("Request body exceeds the 250 KB limit.", 413);
  }
  if (!request.body) {
    throw new RequestBodyError("Request body is required.", 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytesRead = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > maxBodyBytes) {
      await reader.cancel();
      throw new RequestBodyError("Request body exceeds the 250 KB limit.", 413);
    }
    chunks.push(value);
  }

  const body = new Uint8Array(bytesRead);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return jsonResponse({ error: "Content-Type must be application/json." }, 415);
  }

  let input: unknown;
  try {
    input = JSON.parse(await readLimitedBody(request));
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : "Invalid JSON request body."
    }, error instanceof RequestBodyError ? error.status : 400);
  }

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return jsonResponse({ error: "Request body must be a JSON object." }, 400);
  }

  const body = input as Record<string, unknown>;
  if (body.type === "xdr") {
    if (typeof body.resultXdr !== "string") {
      return jsonResponse({ error: "Provide a base64 TransactionResult XDR string." }, 400);
    }
    try {
      return jsonResponse(diagnoseTransaction({ resultXdr: body.resultXdr, source: "xdr" }));
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : "Unable to decode TransactionResult XDR." }, 400);
    }
  }

  if (body.type !== "hash" || typeof body.transactionHash !== "string") {
    return jsonResponse({ error: "Provide a transaction hash or TransactionResult XDR." }, 400);
  }
  if (body.network !== "testnet" && body.network !== "mainnet") {
    return jsonResponse({ error: "Network must be testnet or mainnet." }, 400);
  }
  const transactionHash = body.transactionHash.trim();
  if (!/^[a-fA-F0-9]{64}$/.test(transactionHash)) {
    return jsonResponse({ error: "Transaction hash must be 64 hexadecimal characters." }, 400);
  }

  try {
    const transaction = await lookupTransaction(transactionHash, body.network as StellarNetwork);
    return jsonResponse(diagnoseTransaction(transaction));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to look up this transaction.";
    const status = message.startsWith("Transaction was not found") ? 404 : 502;
    return jsonResponse({ error: message }, status);
  }
}
