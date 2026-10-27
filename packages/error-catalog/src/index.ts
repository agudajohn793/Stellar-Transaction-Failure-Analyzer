export interface ErrorMapping {
  code: string;
  title: string;
  explanation: string;
  checks: string[];
  sourceUrl: string;
}

const transactionSpec = "https://github.com/stellar/stellar-xdr/blob/master/Stellar-transaction.x";
const operationDocs = "https://developers.stellar.org/docs/learn/fundamentals/transactions/operations-and-transactions";

export const errorCatalog: ErrorMapping[] = [
  {
    code: "txInsufficientBalance",
    title: "Insufficient account balance",
    explanation: "The source account cannot pay the transaction fee while preserving its required minimum XLM reserve.",
    checks: ["Check the source account's available XLM.", "Review the minimum-balance reserve for its subentries and sponsoring relationships.", "Confirm the transaction fee."],
    sourceUrl: transactionSpec
  },
  {
    code: "txInsufficientFee",
    title: "Insufficient transaction fee",
    explanation: "The fee offered for the transaction does not meet the network's required fee.",
    checks: ["Compare the offered fee with the network's current minimum inclusion fee.", "For a fee-bump transaction, verify the outer fee covers the inner transaction's required fee."],
    sourceUrl: transactionSpec
  },
  {
    code: "txBadSeq",
    title: "Invalid sequence number",
    explanation: "The transaction sequence number does not match the sequence expected for its source account.",
    checks: ["Reload the source account sequence number.", "Check whether another transaction from the account was submitted first.", "Rebuild and re-sign transactions that were prepared using stale account state."],
    sourceUrl: transactionSpec
  },
  {
    code: "txBadAuth",
    title: "Transaction authorization failed",
    explanation: "The transaction did not satisfy the source account's signer and threshold requirements.",
    checks: ["Confirm every required signer signed the exact transaction envelope.", "Review the account's signer weights and operation thresholds.", "Ensure signatures were added after the final transaction contents were set."],
    sourceUrl: transactionSpec
  },
  {
    code: "txBadAuthExtra",
    title: "Unexpected extra signature",
    explanation: "The transaction includes a signature that was not accepted as a required signer for this transaction.",
    checks: ["Verify the signatures against the transaction source account's configured signers.", "Remove stale or unrelated signatures and sign the final transaction envelope."],
    sourceUrl: transactionSpec
  },
  {
    code: "txNoAccount",
    title: "Source account not found",
    explanation: "The source account required to process the transaction does not exist on the selected network.",
    checks: ["Check the source account ID.", "Confirm the transaction was sent to the intended Stellar network.", "Verify the account has been created and funded on that network."],
    sourceUrl: transactionSpec
  },
  {
    code: "txTooEarly",
    title: "Transaction is not yet valid",
    explanation: "The transaction's time bounds prevent it from being applied at the current ledger time.",
    checks: ["Check the transaction's minimum time bound.", "Wait until the lower bound is reached, or rebuild the transaction with suitable bounds."],
    sourceUrl: transactionSpec
  },
  {
    code: "txTooLate",
    title: "Transaction time bound expired",
    explanation: "The transaction's maximum time bound has passed.",
    checks: ["Rebuild and re-sign the transaction with a current maximum time bound.", "Check client clock and time-bound units."],
    sourceUrl: transactionSpec
  },
  {
    code: "txMissingOperation",
    title: "Transaction has no operations",
    explanation: "A transaction must contain at least one operation.",
    checks: ["Add the intended operation before signing and submitting the transaction."],
    sourceUrl: transactionSpec
  },
  {
    code: "txBadSponsorship",
    title: "Invalid reserve sponsorship",
    explanation: "The transaction's reserve-sponsorship sequence is invalid for the ledger state or sponsorship relationships.",
    checks: ["Review begin/end sponsorship operation ordering.", "Confirm the sponsoring account has sufficient reserve capacity.", "Check that the sponsored ledger entries and account relationships are valid."],
    sourceUrl: operationDocs
  },
  {
    code: "txBadMinSeqAgeOrGap",
    title: "Transaction sequence precondition failed",
    explanation: "The transaction did not satisfy a minimum sequence age or sequence-number gap precondition.",
    checks: ["Reload the account sequence and ledger state.", "Review the configured minSeqAge and minSeqLedgerGap preconditions before resubmitting."],
    sourceUrl: transactionSpec
  },
  {
    code: "opBadAuth",
    title: "Operation authorization failed",
    explanation: "An operation did not satisfy the required account signer or threshold authorization.",
    checks: ["Identify the operation's source account.", "Review that account's signer weights and the operation threshold.", "Confirm all signatures cover the submitted transaction envelope."],
    sourceUrl: operationDocs
  },
  {
    code: "opNoAccount",
    title: "Operation account not found",
    explanation: "An account required by this operation does not exist on the selected network.",
    checks: ["Check the operation's source and destination account IDs.", "Confirm the account exists on the selected network."],
    sourceUrl: operationDocs
  },
  {
    code: "opNotSupported",
    title: "Operation is not supported",
    explanation: "The requested operation is not supported by the Stellar network protocol.",
    checks: ["Check the operation type and the current network protocol support."],
    sourceUrl: operationDocs
  },
  {
    code: "opTooManySubentries",
    title: "Account entry limit reached",
    explanation: "An account would exceed the protocol limit for ledger entries associated with that account.",
    checks: ["Review the account's existing trustlines, offers, and other subentries.", "Remove eligible unused entries before retrying."],
    sourceUrl: operationDocs
  },
  {
    code: "opTooManySponsoring",
    title: "Sponsorship relationship limit reached",
    explanation: "The operation would exceed the protocol limit for sponsorship relationships associated with an account.",
    checks: ["Review the account's existing sponsored and sponsoring entries.", "Remove eligible sponsorship relationships before retrying."],
    sourceUrl: operationDocs
  },
  {
    code: "opExceededWorkLimit",
    title: "Operation exceeded the work limit",
    explanation: "The operation exceeded the network's allowed work limit.",
    checks: ["Review the operation inputs and complexity.", "For Soroban operations, inspect simulation diagnostics and resource limits."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentUnderfunded",
    title: "Payment source is underfunded",
    explanation: "The payment source does not have enough of the specified asset to send the requested amount.",
    checks: ["Check the source account's balance and trustline balance for this asset.", "Account for selling liabilities from open offers."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentNoDestination",
    title: "Payment destination does not exist",
    explanation: "The destination account for this payment does not exist.",
    checks: ["Verify the destination account ID.", "Create and fund the destination account before sending a payment."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentNoTrust",
    title: "Destination has no trustline",
    explanation: "The payment destination has no trustline for the asset being sent.",
    checks: ["Confirm the destination has established a trustline for this asset.", "Verify the asset code and issuer match the intended asset."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentSrcNoTrust",
    title: "Payment source has no trustline",
    explanation: "The payment source has no trustline for the asset being sent.",
    checks: ["Confirm the source has established a trustline for this asset.", "Verify the asset code and issuer match the intended asset."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentNotAuthorized",
    title: "Destination trustline is not authorized",
    explanation: "The destination is not authorized to hold the asset being sent.",
    checks: ["Check the destination trustline's authorization state.", "Ask the asset issuer to authorize the trustline if required."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentSrcNotAuthorized",
    title: "Payment source is not authorized for the asset",
    explanation: "The source trustline is not authorized to send this asset.",
    checks: ["Check the source trustline's authorization state.", "Ask the asset issuer to authorize the trustline if required."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentLineFull",
    title: "Destination trustline is full",
    explanation: "The destination trustline cannot receive the requested amount without exceeding its limit.",
    checks: ["Check the destination trustline limit and current balance.", "Reduce the amount or ask the account holder to adjust the trustline limit."],
    sourceUrl: operationDocs
  },
  {
    code: "paymentNoIssuer",
    title: "Asset issuer does not exist",
    explanation: "The issuer account for the asset does not exist on the selected network.",
    checks: ["Verify the asset issuer account ID.", "Confirm the asset and network are correct."],
    sourceUrl: operationDocs
  },
  {
    code: "createAccountUnderfunded",
    title: "Insufficient balance to create account",
    explanation: "The account-creation operation's source does not have enough XLM for the starting balance and resulting reserve requirements.",
    checks: ["Check the source account's available XLM.", "Verify the requested starting balance covers the destination's minimum reserve."],
    sourceUrl: operationDocs
  },
  {
    code: "createAccountAlreadyExist",
    title: "Account already exists",
    explanation: "The destination account ID is already present on the network.",
    checks: ["Confirm that account creation is still needed.", "Use a payment or another intended operation for an existing account."],
    sourceUrl: operationDocs
  },
  {
    code: "createAccountLowReserve",
    title: "Insufficient reserve to create account",
    explanation: "The source account cannot satisfy its minimum balance reserve after creating the destination account.",
    checks: ["Check the source account's available XLM and current reserve requirements.", "Review its subentries and sponsorship relationships."],
    sourceUrl: operationDocs
  }
];

export function getErrorMapping(code: string): ErrorMapping | undefined {
  return errorCatalog.find((mapping) => mapping.code === code);
}
