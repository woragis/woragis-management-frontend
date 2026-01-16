import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * Common API response type for all endpoints
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * Error response type
 */
export interface ApiErrorResponse {
	error?: string;
	message?: string;
	details?: unknown;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

/**
 * Creates an axios instance with common configuration
 */
export const createApiClient = (baseURL: string, getToken?: () => string | null): AxiosInstance => {
	const client = axios.create({
		baseURL,
		headers: {
			'Content-Type': 'application/json'
		},
		withCredentials: true // Required for CORS with credentials
	});

	// Add request interceptor to include access token in headers
	client.interceptors.request.use(
		(requestConfig) => {
			const token = getToken?.();
			if (token) {
				requestConfig.headers.Authorization = `Bearer ${token}`;
			}
			return requestConfig;
		},
		(error) => {
			return Promise.reject(error);
		}
	);

	// Add response interceptor for error handling
	client.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			// Handle common error cases
			if (error.response?.status === 401) {
				// Unauthorized - token might be expired
				// This can be handled by stores or components
				console.warn('[API] Unauthorized (401)');
			}

			if (error.response?.status === 403) {
				// Forbidden - user doesn't have permission
				console.warn('[API] Forbidden (403)');
			}

			if (error.response?.status === 404) {
				// Not found
				console.warn('[API] Resource not found (404)');
			}

			if (error.response?.status === 500) {
				// Server error
				console.error('[API] Server error (500)');
			}

			return Promise.reject(error);
		}
	);

	return client;
};

/**
 * Helper function to extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError(error)) {
		// Try to extract message from response data
		const data = error.response?.data as ApiErrorResponse | undefined;
		return data?.message || data?.error || error.message || 'An error occurred';
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'An unknown error occurred';
};
