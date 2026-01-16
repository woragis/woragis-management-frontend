import { BaseApiClient } from '../base-client';
import type { ApiKey } from '../types';

/**
 * API Keys API Client
 */
class ApiKeysApiClient extends BaseApiClient {
	constructor() {
		super('/api-keys');
	}

	async createKey(data: Partial<ApiKey>): Promise<ApiKey> {
		return this.create<ApiKey>(data);
	}

	async listKeys(page = 1, limit = 10) {
		return this.list<ApiKey>(page, limit);
	}

	async revokeKey(id: string): Promise<void> {
		await this.client.delete(`/${id}`);
	}
}

export const apiKeysClient = new ApiKeysApiClient();
