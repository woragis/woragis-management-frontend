import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { config } from '$lib/config';
import { tokenCookies } from './cookies';
import type {
	User,
	Profile,
	RegisterRequest,
	LoginRequest,
	AuthResponse,
	RefreshTokenRequest,
	LogoutRequest,
	ProfileUpdateRequest,
	ChangePasswordRequest,
	ApiResponse
} from './types';

/**
 * Auth API Client
 * Handles all API calls to the auth domain endpoints
 * Manages token storage in cookies and automatic token refresh
 */
class AuthApiClient {
	private client: AxiosInstance;
	private isRefreshing = false;
	private refreshSubscribers: Array<(token: string) => void> = [];

	constructor() {
		this.client = axios.create({
			baseURL: `${config.authApiUrl}/auth`,
			headers: {
				'Content-Type': 'application/json'
			},
			withCredentials: true // Required for CORS with credentials
		});

		// Add request interceptor to include access token in headers
		this.client.interceptors.request.use(
			(requestConfig) => {
				const token = tokenCookies.getAccessToken();
				if (token) {
					requestConfig.headers.Authorization = `Bearer ${token}`;
				}
				return requestConfig;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Add response interceptor to handle token refresh on 401
		this.client.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as any;

				// Only retry once
				if (error.response?.status === 401 && !originalRequest._retry) {
					if (!this.isRefreshing) {
						this.isRefreshing = true;
						originalRequest._retry = true;

						try {
							const refreshToken = tokenCookies.getRefreshToken();
							if (!refreshToken) {
								throw new Error('No refresh token available');
							}

							const response = await this.refreshAccessToken(refreshToken);
							this.isRefreshing = false;

							// Notify subscribers about the new token
							this.refreshSubscribers.forEach((callback) => callback(response.accessToken));
							this.refreshSubscribers = [];

							// Update the token and retry original request
							tokenCookies.setAccessToken(response.accessToken);
							originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

							return this.client(originalRequest);
						} catch (refreshError) {
							this.isRefreshing = false;
							this.refreshSubscribers = [];

							// Clear tokens and redirect to login
							tokenCookies.clearTokens();

							return Promise.reject(refreshError);
						}
					} else {
						// If already refreshing, wait for the new token
						return new Promise((resolve) => {
							this.refreshSubscribers.push((token: string) => {
								originalRequest.headers.Authorization = `Bearer ${token}`;
								resolve(this.client(originalRequest));
							});
						});
					}
				}

				return Promise.reject(error);
			}
		);
	}

	/**
	 * Subscribe to token refresh
	 */
	onTokenRefresh(callback: (token: string) => void): void {
		this.refreshSubscribers.push(callback);
	}

	/**
	 * Login with email and password
	 */
	async login(credentials: LoginRequest): Promise<AuthResponse> {
		try {
			const response = await this.client.post<ApiResponse<AuthResponse>>('/login', credentials);

			if (response.data.data) {
				const authData = response.data.data;
				// Store tokens
				tokenCookies.setAccessToken(
					authData.accessToken,
					authData.expiresIn ? authData.expiresIn / 3600 : 24
				);
				if (authData.refreshToken) {
					tokenCookies.setRefreshToken(authData.refreshToken);
				}

				return authData;
			}

			throw new Error('Invalid response format');
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Register a new user
	 */
	async register(data: RegisterRequest): Promise<AuthResponse> {
		try {
			const response = await this.client.post<ApiResponse<AuthResponse>>('/register', data);

			if (response.data.data) {
				const authData = response.data.data;
				// Store tokens
				tokenCookies.setAccessToken(
					authData.accessToken,
					authData.expiresIn ? authData.expiresIn / 3600 : 24
				);
				if (authData.refreshToken) {
					tokenCookies.setRefreshToken(authData.refreshToken);
				}

				return authData;
			}

			throw new Error('Invalid response format');
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Refresh access token using refresh token
	 */
	async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
		try {
			const response = await this.client.post<ApiResponse<AuthResponse>>('/refresh', {
				refreshToken
			});

			if (response.data.data) {
				return response.data.data;
			}

			throw new Error('Invalid response format');
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Logout (clear tokens)
	 */
	async logout(): Promise<void> {
		try {
			const refreshToken = tokenCookies.getRefreshToken();

			if (refreshToken) {
				await this.client.post<ApiResponse>('/logout', {
					refreshToken
				});
			}

			tokenCookies.clearTokens();
		} catch (error) {
			// Even if logout fails on server, clear local tokens
			tokenCookies.clearTokens();
			throw error;
		}
	}

	/**
	 * Get current user
	 */
	async getCurrentUser(): Promise<User> {
		try {
			const response = await this.client.get<ApiResponse<User>>('/me');

			if (response.data.data) {
				return response.data.data;
			}

			throw new Error('Invalid response format');
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get user profile
	 */
	async getProfile(): Promise<Profile> {
		try {
			const response = await this.client.get<ApiResponse<Profile>>('/profile');

			if (response.data.data) {
				return response.data.data;
			}

			throw new Error('Invalid response format');
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Update user profile
	 */
	async updateProfile(data: ProfileUpdateRequest): Promise<Profile> {
		try {
			const response = await this.client.patch<ApiResponse<Profile>>('/profile', data);

			if (response.data.data) {
				return response.data.data;
			}

			throw new Error('Invalid response format');
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Change password
	 */
	async changePassword(data: ChangePasswordRequest): Promise<void> {
		try {
			await this.client.post<ApiResponse>('/change-password', data);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return !!tokenCookies.getAccessToken();
	}
}

// Export singleton instance
export const authClient = new AuthApiClient();
