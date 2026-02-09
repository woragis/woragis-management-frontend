export interface Transaction {
	id: string;
	description: string;
	amount: number;
	type: 'income' | 'expense';
	category: string;
	date: string;
	paymentMethod?: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

export interface FinanceStats {
	totalIncome: number;
	totalExpense: number;
	netIncome: number;
	monthlyIncome: number;
	monthlyExpense: number;
	expenseBreakdown: Record<string, number>;
}

export interface CreateTransactionPayload {
	description: string;
	amount: number;
	type: 'income' | 'expense';
	category: string;
	date: string;
	paymentMethod?: string;
	notes?: string;
}

export interface UpdateTransactionPayload extends Partial<CreateTransactionPayload> {}
