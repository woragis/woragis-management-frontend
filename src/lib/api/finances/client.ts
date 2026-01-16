import { BaseApiClient } from '../base-client';
import type { FinanceEntry, FinanceReport, ApiResponse } from '../types';

/**
 * Finances API Client
 */
class FinancesApiClient extends BaseApiClient {
	constructor() {
		super('/finance');
	}

	async createEntry(data: Partial<FinanceEntry>): Promise<FinanceEntry> {
		return this.create<FinanceEntry>(data);
	}

	async listEntries(page = 1, limit = 10) {
		return this.list<FinanceEntry>(page, limit);
	}

	async getEntry(id: string): Promise<FinanceEntry> {
		return this.getById<FinanceEntry>(id);
	}

	async updateEntry(id: string, data: Partial<FinanceEntry>): Promise<FinanceEntry> {
		return this.update<FinanceEntry>(id, data);
	}

	async deleteEntry(id: string): Promise<void> {
		return this.delete(id);
	}

	async getReport(period: string): Promise<FinanceReport> {
		const response = await this.client.get<ApiResponse<FinanceReport>>('/report', {
			params: { period }
		});
		return response.data.data!;
	}

	async getByCategory(category: string, page = 1, limit = 10) {
		return this.client.get(`/category/${category}`, {
			params: { page, limit }
		});
	}
}

export const financesClient = new FinancesApiClient();
