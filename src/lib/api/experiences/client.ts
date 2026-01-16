import { BaseApiClient } from '../base-client';
import type { Experience } from '../types';

/**
 * Experiences API Client
 */
class ExperiencesApiClient extends BaseApiClient {
	constructor() {
		super('/experiences');
	}

	async createExperience(data: Partial<Experience>): Promise<Experience> {
		return this.create<Experience>(data);
	}

	async listExperiences(page = 1, limit = 10) {
		return this.list<Experience>(page, limit);
	}

	async getExperience(id: string): Promise<Experience> {
		return this.getById<Experience>(id);
	}

	async updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
		return this.update<Experience>(id, data);
	}

	async deleteExperience(id: string): Promise<void> {
		return this.delete(id);
	}
}

export const experiencesClient = new ExperiencesApiClient();
