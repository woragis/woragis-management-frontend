// Finances API client stub
import type { Transaction, PaginatedApiResponse } from './types';

export class FinancesApiClient {
	async listTransactions(page = 1, limit = 100): Promise<PaginatedApiResponse<Transaction>> {
		// TODO: Replace with real API call
		return {
			data: [],
			meta: { total: 0, page, limit, totalPages: 1 }
		};
	}

	async createTransaction(transaction: Transaction): Promise<Transaction> {
		// TODO: Replace with real API call
		return {
			...transaction,
			id: 'mock',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	async deleteTransaction(id: string): Promise<void> {
		// TODO: Replace with real API call
		return;
	}
}

export const financesClient = new FinancesApiClient();
