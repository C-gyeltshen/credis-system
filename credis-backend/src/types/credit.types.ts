export type TransactionType = "credit_given" | "payment_received";

export interface CreateCreditInput {
  customer_id: string;
  store_id: string;
  amount: number;
  transaction_type: TransactionType;
  items_description?: string;
  journal_number?: string;
  created_by_owner_id?: string;
}

export interface UpdateCreditInput {
  amount?: number;
  transaction_type?: TransactionType;
  transaction_date?: Date;
  items_description?: string;
  journal_number?: string;
}

export interface Credit {
  id: string;
  customer_id: string;
  store_id: string;
  amount: number;
  transaction_type: TransactionType;
  transaction_date: Date;
  items_description?: string | null;
  journal_number?: string | null;
  created_by_owner_id?: string | null;
  created_at: Date;
  modified_at: Date;
}

export interface CreditWithCustomer extends Credit {
  customer: {
    id: string;
    name: string;
    phone_number: string;
    email?: string | null;
  };
}

export interface CreditTransactionFilters {
  customer_id?: string;
  store_id?: string;
  transaction_type?: TransactionType;
  start_date?: Date;
  end_date?: Date;
  min_amount?: number;
  max_amount?: number;
}

export interface CreditSummary {
  total_credit_given: number;
  total_payments_received: number;
  outstanding_balance: number;
  transaction_count: number;
  last_transaction_date?: Date | null;
}
