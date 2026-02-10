// Scheduler API client stub
import type { ScheduledTask, PaginatedApiResponse } from './types';

export class SchedulerApiClient {
	async listScheduledTasks(): Promise<PaginatedApiResponse<ScheduledTask>> {
		// TODO: Replace with real API call
		return {
			data: [],
			meta: { total: 0, page: 1, limit: 100, totalPages: 1 }
		};
	}

	async createScheduledTask(task: ScheduledTask): Promise<ScheduledTask> {
		// TODO: Replace with real API call
		return {
			...task,
			id: 'mock',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	async updateScheduledTask(id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> {
		// TODO: Replace with real API call
		return {
			id,
			...updates,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		} as ScheduledTask;
	}

	async deleteScheduledTask(id: string): Promise<void> {
		// TODO: Replace with real API call
		return;
	}
}

export const schedulerClient = new SchedulerApiClient();
