// ---------------------------------------------------------------------------
// Reference-only types — API response contracts documentation.
// Not used at runtime (CLI is an API passthrough). Will be useful if/when
// the CLI starts processing responses (formatting, validation).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Status unions
// ---------------------------------------------------------------------------

export type DepositStatus =
  | "pending"
  | "quarantine"
  | "refunded"
  | "refunding"
  | "rejected"
  | "success"
  | "suspended";

export type WithdrawStatus =
  | "approved"
  | "confirmed"
  | "moderation"
  | "quarantine"
  | "rejected"
  | "sending"
  | "success"
  | "suspended"
  | "verified";

export type SwapStatus = "open" | "success" | "failed";

export type TransferStatus = "pending" | "rejected" | "success";

export type LimitOrderStatus =
  | "queued"
  | "open"
  | "cancelling"
  | "success"
  | "failed";

export type LimitOrderSide = "BUY" | "SELL";

export type AmlCheckStatus = "queued" | "pending" | "success" | "failed";

export type AmlCheckType = "check" | "investigation";

// ---------------------------------------------------------------------------
// Shared / utility types
// ---------------------------------------------------------------------------

export interface Beneficiary {
  readonly first_name?: string | null;
  readonly middle_name?: string | null;
  readonly last_name?: string | null;
  readonly edrpou?: string | null;
  readonly iban?: string | null;
}

export interface PaginatedResponse<T> {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly T[];
}

// ---------------------------------------------------------------------------
// Balance
// ---------------------------------------------------------------------------

export interface Balance {
  readonly currency: string;
  readonly available: string;
  readonly frozen: string;
  readonly updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Deposit
// ---------------------------------------------------------------------------

export interface Deposit {
  readonly code: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly closed_at: string | null;
  readonly method: string;
  readonly bc_code: string | null;
  readonly network: string | null;
  readonly contract: Record<string, unknown> | null;
  readonly status: DepositStatus;
  readonly reason_code: string | null;
  readonly reason_message: string | null;
  readonly coin: string;
  readonly currency: string;
  readonly amount: string;
  readonly fee_amount: string;
  readonly required_confirmations: number | null;
  readonly actual_confirmations: number | null;
  readonly txid: string | null;
  readonly attributes: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Withdraw
// ---------------------------------------------------------------------------

export interface Withdraw {
  readonly code: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly closed_at: string | null;
  readonly coin: string;
  readonly method: string;
  readonly bc_code: string | null;
  readonly network: string | null;
  readonly contract: Record<string, unknown> | null;
  readonly status: WithdrawStatus;
  readonly reason_code: string | null;
  readonly reason_message: string | null;
  readonly currency: string;
  readonly amount: string;
  readonly fee_amount: string;
  readonly paid_amount: string;
  readonly paid_fee_amount: string;
  readonly txid: string | null;
  readonly address: string | null;
  readonly tag: string | null;
  readonly beneficiary: Beneficiary | null;
  readonly custom_id: string | null;
  readonly callback_url: string | null;
  readonly address_book_code: string | null;
  readonly withdraw_list: string;
}

// ---------------------------------------------------------------------------
// Swap
// ---------------------------------------------------------------------------

export interface Swap {
  readonly code: string;
  readonly custom_id: string | null;
  readonly callback_url: string | null;
  readonly direction: string;
  readonly spend_currency: string;
  readonly receive_currency: string;
  readonly spend_rate: string;
  readonly receive_rate: string;
  readonly amount_parameter: string;
  readonly spend_amount: string;
  readonly spend_fee_filled: string;
  readonly spend_filled: string;
  readonly receive_amount: string;
  readonly receive_fee_filled: string;
  readonly receive_filled: string;
  readonly fee_percent: string;
  readonly fee_discount: string;
  readonly fee_amount: string;
  readonly fee_currency: string;
  readonly status: SwapStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly open_at: string | null;
  readonly done_at: string | null;
  readonly cancel_requested_at: string | null;
  readonly valid_till: string | null;
  readonly reason_code: string | null;
  readonly reason_message: string | null;
}

// ---------------------------------------------------------------------------
// Internal transfer
// ---------------------------------------------------------------------------

export interface Transfer {
  readonly code: string;
  readonly sender_uid: string;
  readonly recipient_uid: string;
  readonly status: TransferStatus;
  readonly timestamp: string;
  readonly reason_code: string | null;
  readonly reason_message: string | null;
  readonly currency: string;
  readonly amount: string;
  readonly custom_id: string | null;
  readonly callback_url: string | null;
  readonly address_book_code: string | null;
}

// ---------------------------------------------------------------------------
// Limit order
// ---------------------------------------------------------------------------

export interface LimitOrder {
  readonly code: string;
  readonly status: LimitOrderStatus;
  readonly pair: string;
  readonly side: LimitOrderSide;
  readonly limit_price: string;
  readonly spend_amount: string;
  readonly receive_amount: string;
  readonly base_amount: string;
  readonly quote_amount: string;
  readonly filled_base_amount: string;
  readonly filled_quote_amount: string;
  readonly filled_fee_amount: string;
  readonly fee_currency: string;
  readonly custom_id: string | null;
  readonly callback_url: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly done_at: string | null;
  readonly reason_code: string | null;
  readonly reason_message: string | null;
}

// ---------------------------------------------------------------------------
// AML
// ---------------------------------------------------------------------------

export interface AmlCheck {
  readonly code: string;
  readonly plan: string;
  readonly currency: string;
  readonly price: string;
  readonly direction: Record<string, unknown>;
  readonly token: number;
  readonly transaction: string | null;
  readonly address: string;
  readonly check_type: AmlCheckType;
  readonly status: AmlCheckStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly expires_at: string | null;
  readonly reason_code: string | null;
  readonly reason_message: string | null;
  readonly custom_id: string | null;
  readonly result: Record<string, unknown> | null;
  readonly callback_url: string | null;
}

export interface AmlPlan {
  readonly code: string;
  readonly name: string;
  readonly currency: string;
  readonly price: string;
  readonly check_type: AmlCheckType;
}

export interface AmlToken {
  readonly id: number;
  readonly name: string;
  readonly symbol: string;
  readonly network: string;
  readonly precision: number;
}

// ---------------------------------------------------------------------------
// Ledger
// ---------------------------------------------------------------------------

export interface LedgerEntry {
  readonly code: string;
  readonly created_at: string;
  readonly currency: string;
  readonly balance: string;
  readonly reserve: string;
  readonly available: string;
  readonly txid: string | null;
  readonly operation_name: string | null;
}

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

export interface Currency {
  readonly code: string;
  readonly name: string;
  readonly precision: number;
  readonly is_fiat: boolean;
  readonly is_stable: boolean;
  readonly updated_at: string | null;
  readonly deposit: readonly DepositMethodInfo[];
  readonly withdraw: readonly WithdrawMethodInfo[];
}

export interface DepositMethodInfo {
  readonly code: string;
  readonly name: string;
  readonly is_enabled: boolean;
}

export interface WithdrawMethodInfo {
  readonly code: string;
  readonly name: string;
  readonly is_enabled: boolean;
  readonly is_beneficiary_required: boolean;
}

// ---------------------------------------------------------------------------
// Swap direction
// ---------------------------------------------------------------------------

export interface SwapDirection {
  readonly code: string;
  readonly spend_currency: string;
  readonly receive_currency: string;
  readonly spend_precision: number;
  readonly receive_precision: number;
  readonly min_spend_amount: string | null;
  readonly max_spend_amount: string | null;
  readonly min_receive_amount: string | null;
  readonly max_receive_amount: string | null;
  readonly is_enabled: boolean;
  readonly spend_rate_value: string;
  readonly receive_rate_value: string;
  readonly fee_percent: string | null;
}

// ---------------------------------------------------------------------------
// Deposit / withdraw methods
// ---------------------------------------------------------------------------

export interface DepositMethod {
  readonly code: string;
  readonly bc_code: string | null;
  readonly name: string;
  readonly method_type: string;
  readonly currency: string;
  readonly coin: string;
  readonly network: string;
  readonly contract_address: string | null;
  readonly min_amount: string;
  readonly max_amount: string | null;
  readonly fee_percent: string | null;
  readonly fee_percent_min: string | null;
  readonly fee_percent_max: string | null;
  readonly fee_absolute: string;
  readonly required_confirmations: number;
  readonly is_enabled: boolean;
  readonly spend_precision: number;
  readonly receive_precision: number;
}

export interface WithdrawMethod {
  readonly code: string;
  readonly bc_code: string | null;
  readonly name: string;
  readonly method_type: string;
  readonly currency: string;
  readonly coin: string;
  readonly network: string;
  readonly min_amount: string;
  readonly max_amount: string | null;
  readonly fee_percent: string | null;
  readonly fee_percent_min: string | null;
  readonly fee_percent_max: string | null;
  readonly fee_absolute: string;
  readonly attributes_config: Record<string, unknown>;
  readonly is_enabled: boolean;
  readonly spend_precision: number;
  readonly receive_precision: number;
}

// ---------------------------------------------------------------------------
// Limit order pair
// ---------------------------------------------------------------------------

export interface LimitOrderPair {
  readonly code: string;
  readonly symbol: string;
  readonly base_currency: string;
  readonly quote_currency: string;
  readonly amount_precision: number;
  readonly price_precision: number;
  readonly total_precision: number;
  readonly min_base_amount: string | null;
  readonly max_base_amount: string | null;
  readonly min_quote_amount: string | null;
  readonly max_quote_amount: string | null;
  readonly is_enabled: boolean;
  readonly fee_percent: string | null;
  readonly latest_price: string | null;
}

// ---------------------------------------------------------------------------
// CLI error
// ---------------------------------------------------------------------------

export interface CliError {
  readonly cli_error: true;
  readonly message: string;
  readonly code: string;
}

