import axios, { type AxiosInstance } from 'axios';
import { config } from '$lib/config';
import { tokenCookies } from '../auth/cookies';
import type { ApiResponse } from '../types';

export interface DashboardStats {
	totalProjects: number;
	activeProjects: number;
	completedProjects: number;
	totalIdeas: number;
	totalClients: number;
	recentTransactions: any[];
	upcomingTasks: any[];
}

/**
 * Dashboard API Client
 * Aggregates data from multiple domains for the dashboard view
 */
class DashboardApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: `${config.managementApiUrl}`,
			headers: {
				'Content-Type': 'application/json'
			},
			withCredentials: true
		});

		// Add request interceptor to include token
		this.client.interceptors.request.use((config) => {
			const token = tokenCookies.getAccessToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});
	}

	/**
	 * Get dashboard statistics
	 * This endpoint should aggregate data from multiple domains
	 */
	async getDashboardStats(): Promise<DashboardStats> {
		try {
			const response = await this.client.get<ApiResponse<DashboardStats>>('/dashboard');
			return response.data.data || {
				totalProjects: 0,
				activeProjects: 0,
				completedProjects: 0,
				totalIdeas: 0,
				totalClients: 0,
				recentTransactions: [],
				upcomingTasks: []
			};
		} catch (error) {
			console.error('Failed to fetch dashboard stats:', error);
			throw error;
		}
	}

	/**
	 * Get quick stats (lightweight version)
	 */
	async getQuickStats() {
		try {
			const response = await this.client.get<ApiResponse<any>>('/dashboard/quick-stats');
			return response.data.data;
		} catch (error) {
			console.error('Failed to fetch quick stats:', error);
			throw error;
		}
	}
}

export const dashboardClient = new DashboardApiClient();
