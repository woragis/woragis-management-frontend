import { BaseApiClient } from '../base-client';
import type { ScheduledTask } from '../types';

/**
 * Scheduler API Client
 */
class SchedulerApiClient extends BaseApiClient {
	constructor() {
		super('/scheduler');
	}

	async createTask(data: Partial<ScheduledTask>): Promise<ScheduledTask> {
		return this.create<ScheduledTask>(data);
	}

	async listTasks(page = 1, limit = 10) {
		return this.list<ScheduledTask>(page, limit);
	}

	async getTask(id: string): Promise<ScheduledTask> {
		return this.getById<ScheduledTask>(id);
	}

	async updateTask(id: string, data: Partial<ScheduledTask>): Promise<ScheduledTask> {
		return this.update<ScheduledTask>(id, data);
	}

	async deleteTask(id: string): Promise<void> {
		return this.delete(id);
	}

	async completeTask(id: string): Promise<ScheduledTask> {
		return this.update<ScheduledTask>(id, { status: 'completed' });
	}
}

export const schedulerClient = new SchedulerApiClient();
