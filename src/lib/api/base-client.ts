import axios, { type AxiosInstance } from 'axios';
import { config } from '$lib/config';
import { tokenCookies } from '$lib/api/auth/cookies';
import { csrfTokenService } from '$lib/api/csrf';
import type { ApiResponse, PaginatedApiResponse } from '$lib/api/types';

/**
 * Base API Client for common CRUD operations
 */
export class BaseApiClient {
	protected client: AxiosInstance;
	protected baseEndpoint: string;

	constructor(endpoint: string) {
		this.baseEndpoint = endpoint;
		this.client = axios.create({
			baseURL: `${config.managementApiUrl}${endpoint}`,
			headers: {
				'Content-Type': 'application/json'
			},
			withCredentials: true
		});

		// Add request interceptor to include token and CSRF token
		this.client.interceptors.request.use(async (config) => {
			// Add Authorization token
			const token = tokenCookies.getAccessToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}

			// Add CSRF token for state-changing requests
			const isStateChangingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
				config.method?.toUpperCase() || ''
			);

			if (isStateChangingRequest) {
				const csrfToken = await csrfTokenService.ensureCSRFToken();
				config.headers['X-CSRF-Token'] = csrfToken;
			}

			return config;
		});
	}

	async create<T>(data: Partial<T>): Promise<T> {
		const response = await this.client.post<ApiResponse<T>>('/', data);
		return response.data.data!;
	}

	async list<T>(page = 1, limit = 10): Promise<PaginatedApiResponse<T>> {
		const response = await this.client.get<PaginatedApiResponse<T>>('/', {
			params: { page, limit }
		});
		return response.data;
	}

	async getById<T>(id: string): Promise<T> {
		const response = await this.client.get<ApiResponse<T>>(`/${id}`);
		return response.data.data!;
	}

	async update<T>(id: string, data: Partial<T>): Promise<T> {
		const response = await this.client.patch<ApiResponse<T>>(`/${id}`, data);
		return response.data.data!;
	}

	async delete(id: string): Promise<void> {
		await this.client.delete(`/${id}`);
	}
}
