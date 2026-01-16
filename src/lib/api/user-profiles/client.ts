import { BaseApiClient } from '../base-client';
import type { UserProfile } from '../types';

/**
 * User Profiles API Client
 */
class UserProfilesApiClient extends BaseApiClient {
	constructor() {
		super('/user-profiles');
	}

	async getProfile(): Promise<UserProfile> {
		const response = await this.client.get<any>('/');
		return response.data.data || response.data;
	}

	async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
		const response = await this.client.patch<any>('/', data);
		return response.data.data || response.data;
	}

	async getPublicProfile(userId: string): Promise<UserProfile> {
		const response = await this.client.get<any>(`/public/${userId}`);
		return response.data.data || response.data;
	}
}

export const userProfilesClient = new UserProfilesApiClient();
