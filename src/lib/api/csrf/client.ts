import axios, { type AxiosInstance } from 'axios';
import { config } from '$lib/config';
import type { CSRFTokenResponse } from './types';

/**
 * CSRF Token Storage Service
 * Manages CSRF token fetching and storage
 */
class CSRFTokenService {
	private client: AxiosInstance;
	private csrfToken: string | null = null;

	constructor() {
		this.client = axios.create({
			baseURL: `${config.managementApiUrl}`,
			headers: {
				'Content-Type': 'application/json'
			},
			withCredentials: true
		});
	}

	/**
	 * Fetch a fresh CSRF token from the backend
	 * The token is returned in the X-CSRF-Token response header
	 */
	async fetchCSRFToken(): Promise<string> {
		try {
			const response = await this.client.get<CSRFTokenResponse>('/csrf-token');

			// CSRF token is in the X-CSRF-Token response header
			const token = response.headers['x-csrf-token'];

			if (!token) {
				throw new Error('CSRF token not found in response header');
			}

			this.csrfToken = token;
			return token;
		} catch (error) {
			console.error('Failed to fetch CSRF token:', error);
			throw error;
		}
	}

	/**
	 * Get the stored CSRF token
	 * Returns null if no token has been fetched
	 */
	getCSRFToken(): string | null {
		return this.csrfToken;
	}

	/**
	 * Clear the stored CSRF token
	 */
	clearCSRFToken(): void {
		this.csrfToken = null;
	}

	/**
	 * Get the CSRF token, fetching a new one if necessary
	 */
	async ensureCSRFToken(): Promise<string> {
		if (this.csrfToken) {
			return this.csrfToken;
		}
		return this.fetchCSRFToken();
	}
}

// Export singleton instance
export const csrfTokenService = new CSRFTokenService();
