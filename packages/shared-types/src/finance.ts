import { TransactionType } from './enums';

export interface CashTransaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
}

export interface CreateCashTransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  notes?: string;
  transactionDate: Date;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
