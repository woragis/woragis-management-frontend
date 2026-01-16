import { BaseApiClient } from '../base-client';
import type { Idea } from '../types';

/**
 * Ideas API Client
 */
class IdeasApiClient extends BaseApiClient {
	constructor() {
		super('/ideas');
	}

	async createIdea(data: Partial<Idea>): Promise<Idea> {
		return this.create<Idea>(data);
	}

	async listIdeas(page = 1, limit = 10) {
		return this.list<Idea>(page, limit);
	}

	async getIdea(id: string): Promise<Idea> {
		return this.getById<Idea>(id);
	}

	async updateIdea(id: string, data: Partial<Idea>): Promise<Idea> {
		return this.update<Idea>(id, data);
	}

	async deleteIdea(id: string): Promise<void> {
		return this.delete(id);
	}
}

export const ideasClient = new IdeasApiClient();
