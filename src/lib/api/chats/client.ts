import { BaseApiClient } from '../base-client';
import type { Chat, ChatMessage, ApiResponse } from '../types';

/**
 * Chats API Client
 */
class ChatsApiClient extends BaseApiClient {
	constructor() {
		super('/chats');
	}

	async createChat(data: Partial<Chat>): Promise<Chat> {
		return this.create<Chat>(data);
	}

	async listChats(page = 1, limit = 10) {
		return this.list<Chat>(page, limit);
	}

	async getChat(id: string): Promise<Chat> {
		return this.getById<Chat>(id);
	}

	async updateChat(id: string, data: Partial<Chat>): Promise<Chat> {
		return this.update<Chat>(id, data);
	}

	async deleteChat(id: string): Promise<void> {
		return this.delete(id);
	}

	async sendMessage(chatId: string, message: string): Promise<ChatMessage> {
		const response = await this.client.post<ApiResponse<ChatMessage>>(`/${chatId}/messages`, {
			content: message
		});
		return response.data.data!;
	}

	async getMessages(chatId: string, limit = 50): Promise<ChatMessage[]> {
		const response = await this.client.get<ApiResponse<ChatMessage[]>>(`/${chatId}/messages`, {
			params: { limit }
		});
		return response.data.data!;
	}
}

export const chatsClient = new ChatsApiClient();
