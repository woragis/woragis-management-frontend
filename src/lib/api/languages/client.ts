import { BaseApiClient } from '../base-client';
import type { Language } from '../types';

/**
 * Languages API Client
 */
class LanguagesApiClient extends BaseApiClient {
	constructor() {
		super('/languages');
	}

	async createLanguage(data: Partial<Language>): Promise<Language> {
		return this.create<Language>(data);
	}

	async listLanguages(page = 1, limit = 10) {
		return this.list<Language>(page, limit);
	}

	async getLanguage(id: string): Promise<Language> {
		return this.getById<Language>(id);
	}

	async updateLanguage(id: string, data: Partial<Language>): Promise<Language> {
		return this.update<Language>(id, data);
	}

	async deleteLanguage(id: string): Promise<void> {
		return this.delete(id);
	}
}

export const languagesClient = new LanguagesApiClient();
