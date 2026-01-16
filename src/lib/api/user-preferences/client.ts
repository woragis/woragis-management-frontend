import { BaseApiClient } from '../base-client';
import type { UserPreferences } from '../types';

/**
 * User Preferences API Client
 */
class UserPreferencesApiClient extends BaseApiClient {
	constructor() {
		super('/user-preferences');
	}

	async getPreferences(): Promise<UserPreferences> {
		const response = await this.client.get<any>('/');
		return response.data.data || response.data;
	}

	async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
		const response = await this.client.patch<any>('/', data);
		return response.data.data || response.data;
	}
}

export const userPreferencesClient = new UserPreferencesApiClient();
