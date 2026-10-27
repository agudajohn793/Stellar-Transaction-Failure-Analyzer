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
    code: "pathPaymentStrictReceiveUnderfunded",
    title: "Path payment source is underfunded",
    explanation: "The path payment source cannot provide enough of the asset being sold to deliver the requested destination amount.",
    checks: ["Check the source balance and selling liabilities in the source asset.", "Review the payment path and maximum send amount."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendUnderfunded",
    title: "Path payment source is underfunded",
    explanation: "The path payment source cannot provide the requested amount of the asset being sent.",
    checks: ["Check the source balance and selling liabilities in the send asset.", "Review the payment path and requested send amount."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveNoDestination",
    title: "Path payment destination does not exist",
    explanation: "The destination account for the path payment does not exist.",
    checks: ["Verify the destination account ID.", "Create and fund the destination account before sending the path payment."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendNoDestination",
    title: "Path payment destination does not exist",
    explanation: "The destination account for the path payment does not exist.",
    checks: ["Verify the destination account ID.", "Create and fund the destination account before sending the path payment."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveTooFewOffers",
    title: "No viable path payment route",
    explanation: "The order book did not provide enough offers to complete the path payment.",
    checks: ["Check whether the path assets have active offers and liquidity.", "Review the path and adjust the destination amount or send maximum."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendTooFewOffers",
    title: "No viable path payment route",
    explanation: "The order book did not provide enough offers to complete the path payment.",
    checks: ["Check whether the path assets have active offers and liquidity.", "Review the path and adjust the amount being sent."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveNoTrust",
    title: "Path payment account has no trustline",
    explanation: "An account involved in the path payment lacks a trustline for an asset required by the path.",
    checks: ["Inspect trustlines for the source, destination, and intermediate path assets.", "Confirm each asset issuer and code."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendNoTrust",
    title: "Path payment account has no trustline",
    explanation: "An account involved in the path payment lacks a trustline for an asset required by the path.",
    checks: ["Inspect trustlines for the source, destination, and intermediate path assets.", "Confirm each asset issuer and code."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveSrcNoTrust",
    title: "Path payment source has no trustline",
    explanation: "The path payment source lacks a trustline for the asset it must sell.",
    checks: ["Confirm the source has a trustline for the send asset.", "Verify the asset code and issuer."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendSrcNoTrust",
    title: "Path payment source has no trustline",
    explanation: "The path payment source lacks a trustline for the asset it must sell.",
    checks: ["Confirm the source has a trustline for the send asset.", "Verify the asset code and issuer."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveSrcNotAuthorized",
    title: "Path payment source is not authorized",
    explanation: "The source trustline is not authorized to send the asset required by the path payment.",
    checks: ["Check the source trustline's authorization state.", "Ask the issuer to authorize the trustline if required."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendSrcNotAuthorized",
    title: "Path payment source is not authorized",
    explanation: "The source trustline is not authorized to send the asset required by the path payment.",
    checks: ["Check the source trustline's authorization state.", "Ask the issuer to authorize the trustline if required."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveNotAuthorized",
    title: "Path payment trustline is not authorized",
    explanation: "A trustline required by the path payment is not authorized to hold the asset.",
    checks: ["Inspect the destination and intermediate trustlines for authorization state.", "Ask the relevant issuer to authorize the trustline if required."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendNotAuthorized",
    title: "Path payment trustline is not authorized",
    explanation: "A trustline required by the path payment is not authorized to hold the asset.",
    checks: ["Inspect the destination and intermediate trustlines for authorization state.", "Ask the relevant issuer to authorize the trustline if required."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveLineFull",
    title: "Path payment trustline is full",
    explanation: "A destination or intermediate trustline cannot receive the amount required by the path.",
    checks: ["Check the affected trustline's balance and limit.", "Review the path and reduce the amount if appropriate."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendLineFull",
    title: "Path payment trustline is full",
    explanation: "A destination or intermediate trustline cannot receive the amount required by the path.",
    checks: ["Check the affected trustline's balance and limit.", "Review the path and reduce the amount if appropriate."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveNoIssuer",
    title: "Path payment asset issuer does not exist",
    explanation: "An issuer for an asset in the path does not exist on the selected network.",
    checks: ["Verify the issuer IDs for every asset in the path.", "Confirm the selected network and asset definitions."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendNoIssuer",
    title: "Path payment asset issuer does not exist",
    explanation: "An issuer for an asset in the path does not exist on the selected network.",
    checks: ["Verify the issuer IDs for every asset in the path.", "Confirm the selected network and asset definitions."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveOfferCrossSelf",
    title: "Path payment would cross the source's offer",
    explanation: "The path payment would cross an offer owned by its source account, which the protocol does not allow.",
    checks: ["Review open offers owned by the source account.", "Adjust the path or cancel the conflicting offer before retrying."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendOfferCrossSelf",
    title: "Path payment would cross the source's offer",
    explanation: "The path payment would cross an offer owned by its source account, which the protocol does not allow.",
    checks: ["Review open offers owned by the source account.", "Adjust the path or cancel the conflicting offer before retrying."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictReceiveOverSendmax",
    title: "Path payment exceeds send maximum",
    explanation: "The path would require sending more than the maximum amount allowed by the operation.",
    checks: ["Review the path's available exchange rates and liquidity.", "Increase the send maximum or choose a different path."],
    sourceUrl: operationDocs
  },
  {
    code: "pathPaymentStrictSendUnderDestmin",
    title: "Path payment is below destination minimum",
    explanation: "The destination would receive less than the minimum amount specified by the operation.",
    checks: ["Review current exchange rates and path liquidity.", "Adjust the destination minimum or use a different path."],
    sourceUrl: operationDocs
  },
  {
    code: "changeTrustNoIssuer",
    title: "Trustline asset issuer does not exist",
    explanation: "The issuer account for the asset in the change-trust operation does not exist.",
    checks: ["Verify the asset issuer account ID.", "Confirm the selected network and asset definition."],
    sourceUrl: operationDocs
  },
  {
    code: "changeTrustInvalidLimit",
    title: "Invalid trustline limit",
    explanation: "The requested trustline limit is invalid for the asset or existing balance.",
    checks: ["Check that the limit is non-negative and not below the current balance.", "Review the asset and trustline being changed."],
    sourceUrl: operationDocs
  },
  {
    code: "changeTrustLowReserve",
    title: "Insufficient reserve for trustline",
    explanation: "The account cannot meet the minimum XLM reserve required to create or modify this trustline.",
    checks: ["Check the account's available XLM and current minimum balance.", "Review subentries and sponsorship relationships."],
    sourceUrl: operationDocs
  },
  {
    code: "manageSellOfferUnderfunded",
    title: "Sell offer is underfunded",
    explanation: "The selling account cannot cover the amount of the asset offered for sale.",
    checks: ["Check the selling asset balance.", "Account for selling liabilities from other open offers."],
    sourceUrl: operationDocs
  },
  {
    code: "manageBuyOfferUnderfunded",
    title: "Buy offer is underfunded",
    explanation: "The buying account cannot cover the buying liabilities required by the offer.",
    checks: ["Check the buying asset balance.", "Account for buying liabilities from other open offers."],
    sourceUrl: operationDocs
  },
  {
    code: "manageSellOfferSellNoTrust",
    title: "Sell offer has no selling-asset trustline",
    explanation: "The account has no trustline for the asset it is offering to sell.",
    checks: ["Add a trustline for the selling asset.", "Verify its asset code and issuer."],
    sourceUrl: operationDocs
  },
  {
    code: "manageBuyOfferSellNoTrust",
    title: "Buy offer has no selling-asset trustline",
    explanation: "The account has no trustline for the asset it is offering to sell.",
    checks: ["Add a trustline for the selling asset.", "Verify its asset code and issuer."],
    sourceUrl: operationDocs
  },
  {
    code: "manageSellOfferBuyNoTrust",
    title: "Sell offer has no buying-asset trustline",
    explanation: "The account has no trustline for the asset it expects to receive.",
    checks: ["Add a trustline for the buying asset if it is not native XLM.", "Verify its asset code and issuer."],
    sourceUrl: operationDocs
  },
  {
    code: "manageBuyOfferBuyNoTrust",
    title: "Buy offer has no buying-asset trustline",
    explanation: "The account has no trustline for the asset it expects to receive.",
    checks: ["Add a trustline for the buying asset if it is not native XLM.", "Verify its asset code and issuer."],
    sourceUrl: operationDocs
  },
  {
    code: "manageSellOfferLowReserve",
    title: "Insufficient reserve for sell offer",
    explanation: "The account cannot meet the minimum XLM reserve required for the offer's ledger entry.",
    checks: ["Check the account's available XLM and minimum balance.", "Review existing offers, subentries, and sponsorship."],
    sourceUrl: operationDocs
  },
  {
    code: "manageBuyOfferLowReserve",
    title: "Insufficient reserve for buy offer",
    explanation: "The account cannot meet the minimum XLM reserve required for the offer's ledger entry.",
    checks: ["Check the account's available XLM and minimum balance.", "Review existing offers, subentries, and sponsorship."],
    sourceUrl: operationDocs
  },
  {
    code: "invokeHostFunctionTrapped",
    title: "Soroban host function trapped",
    explanation: "The Soroban host function failed during execution. This result code alone does not identify the contract-level cause.",
    checks: ["Inspect the transaction's Soroban diagnostic events, if available.", "Reproduce the invocation with simulation using the same inputs and ledger state.", "Review contract logs and the exact invocation arguments."],
    sourceUrl: "https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging"
  },
  {
    code: "invokeHostFunctionResourceLimitExceeded",
    title: "Soroban resource limit exceeded",
    explanation: "The Soroban invocation exceeded a protocol resource limit during execution.",
    checks: ["Simulate the exact transaction and inspect CPU, memory, read/write, and event resource usage.", "Review the contract path and input size; do not assume a higher fee alone resolves the limit."],
    sourceUrl: "https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging"
  },
  {
    code: "invokeHostFunctionEntryArchived",
    title: "Soroban ledger entry needs restoration",
    explanation: "The invocation accessed an archived ledger entry that must be restored before it can be used.",
    checks: ["Inspect the transaction's simulation restore preamble.", "Restore the required footprint entries and then simulate the invocation again."],
    sourceUrl: "https://developers.stellar.org/docs/learn/fundamentals/contract-development/state-archival"
  },
  {
    code: "invokeHostFunctionInsufficientRefundableFee",
    title: "Soroban refundable fee is insufficient",
    explanation: "The Soroban transaction did not provide enough refundable fee for the resources required by the invocation.",
    checks: ["Simulate the exact transaction and inspect its resource fee estimate.", "Rebuild and re-sign using the current simulation results and ledger state."],
    sourceUrl: "https://developers.stellar.org/docs/learn/fundamentals/contract-development/errors-and-debugging"
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
