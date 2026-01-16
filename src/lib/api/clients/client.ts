import { BaseApiClient } from '../base-client';
import type { Client } from '../types';

/**
 * Clients API Client
 */
class ClientsApiClient extends BaseApiClient {
	constructor() {
		super('/clients');
	}

	async createClient(data: Partial<Client>): Promise<Client> {
		return this.create<Client>(data);
	}

	async listClients(page = 1, limit = 10) {
		return this.list<Client>(page, limit);
	}

	async getClient(id: string): Promise<Client> {
		return this.getById<Client>(id);
	}

	async updateClient(id: string, data: Partial<Client>): Promise<Client> {
		return this.update<Client>(id, data);
	}

	async deleteClient(id: string): Promise<void> {
		return this.delete(id);
	}
}

export const clientsClient = new ClientsApiClient();
