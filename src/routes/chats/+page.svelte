<script lang="ts">
	import { onMount } from 'svelte';
	import { chatsClient } from '$lib/api/chats';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Chat, ChatMessage, PaginatedApiResponse } from '$lib/api/types';
	import { Trash2, Plus, Send } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let chats: Chat[] = [];
	let selectedChat: Chat | null = null;
	let messages: ChatMessage[] = [];
	let newChatTitle = '';
	let messageInput = '';
	let showForm = false;
	let creating = false;
	let sending = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadChats();
	});

	async function loadChats() {
		loading = true;
		error = null;

		try {
			const response: PaginatedApiResponse<Chat> = await chatsClient.listChats();
			chats = response.data;
		} catch (err: any) {
			error = err.message || 'Failed to load chats';
			console.error('Error loading chats:', err);
		} finally {
			loading = false;
		}
	}

	async function selectChat(chat: Chat) {
		selectedChat = chat;
		messages = chat.messages || [];
		try {
			const fullChat = await chatsClient.getChat(chat.id);
			messages = fullChat.messages || [];
		} catch (err: any) {
			console.error('Error loading chat messages:', err);
		}
	}

	async function toggleForm() {
		showForm = !showForm;

		if (showForm) {
			try {
				await csrfTokenService.fetchCSRFToken();
			} catch (err) {
				console.error('Failed to fetch CSRF token:', err);
			}
		}
	}

	async function createChat() {
		if (!newChatTitle) {
			error = 'Please enter a chat title';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await chatsClient.createChat({ title: newChatTitle });
			chats = [created, ...chats];
			newChatTitle = '';
			showForm = false;
			selectChat(created);
		} catch (err: any) {
			error = err.message || 'Failed to create chat';
			console.error('Error creating chat:', err);
		} finally {
			creating = false;
		}
	}

	async function sendMessage() {
		if (!messageInput.trim() || !selectedChat) {
			return;
		}

		sending = true;
		const userMessage: ChatMessage = {
			id: 'temp-' + Date.now(),
			conversationId: selectedChat.id,
			role: 'user',
			content: messageInput,
			timestamp: new Date().toISOString()
		};

		try {
			await csrfTokenService.fetchCSRFToken();
			const response: ChatMessage = await chatsClient.sendMessage(selectedChat.id, messageInput);

			messages = [...messages, userMessage];

			if (response && response.id) {
				messages = [...messages, response];
			}

			messageInput = '';

			// Scroll to bottom
			setTimeout(() => {
				const messagesContainer = document.getElementById('messages-container');
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, 100);
		} catch (err: any) {
			error = err.message || 'Failed to send message';
			console.error('Error sending message:', err);
		} finally {
			sending = false;
		}
	}

	async function deleteChat(id: string) {
		if (!confirm('Are you sure you want to delete this chat?')) {
			return;
		}

		try {
			await chatsClient.deleteChat(id);
			chats = chats.filter((c) => c.id !== id);
			if (selectedChat?.id === id) {
				selectedChat = null;
				messages = [];
			}
		} catch (err: any) {
			error = err.message || 'Failed to delete chat';
			console.error('Error deleting chat:', err);
		}
	}
</script>

<div class="container mx-auto flex h-screen flex-col px-4 py-8">
	<div class="mb-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Chats</h1>
				<p class="mt-2 text-gray-600">AI-assisted conversations and brainstorming</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				<Plus size={20} />
				New Chat
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	<div class="flex min-h-0 flex-1 gap-6">
		<!-- Chats Sidebar -->
		<div class="w-64 overflow-y-auto border-r border-gray-200">
			{#if loading}
				<div class="py-8 text-center">
					<div
						class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
					></div>
				</div>
			{:else if chats.length === 0}
				<div class="p-4 text-center text-sm text-gray-600">No chats yet</div>
			{:else}
				<div class="space-y-2 p-4">
					{#each chats as chat (chat.id)}
						<div
							role="button"
							tabindex="0"
							on:click={() => selectChat(chat)}
							on:keydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') selectChat(chat);
							}}
							class="group cursor-pointer rounded-lg {selectedChat?.id === chat.id
								? 'bg-blue-100'
								: 'hover:bg-gray-100'} p-3 transition-colors"
						>
							<div class="flex items-center justify-between gap-2">
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-gray-900">{chat.title}</p>
									<p class="truncate text-xs text-gray-500">
										{new Date(chat.createdAt).toLocaleDateString()}
									</p>
								</div>
								<button
									on:click={(e) => {
										e.stopPropagation();
										deleteChat(chat.id);
									}}
									class="rounded p-1 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
									title="Delete chat"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if showForm}
				<div class="space-y-2 border-t border-gray-200 p-4">
					<input
						type="text"
						bind:value={newChatTitle}
						placeholder="Chat title..."
						class="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
					<div class="flex gap-2">
						<button
							on:click={createChat}
							disabled={creating}
							class="flex-1 rounded-lg bg-blue-600 px-2 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
						>
							Create
						</button>
						<button
							on:click={toggleForm}
							class="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
						>
							Cancel
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Chat Area -->
		<div class="flex min-w-0 flex-1 flex-col">
			{#if !selectedChat}
				<div class="flex flex-1 flex-col items-center justify-center text-gray-600">
					<p class="mb-2 text-lg">No chat selected</p>
					<p class="text-sm">Create a new chat or select one from the list</p>
				</div>
			{:else}
				<!-- Messages -->
				<div
					id="messages-container"
					class="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4"
				>
					{#if messages.length === 0}
						<div class="flex h-full items-center justify-center text-gray-600">
							<p>Start a conversation...</p>
						</div>
					{:else}
						{#each messages as message (message.id || message.timestamp)}
							<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
								<div
									class="max-w-xs {message.role === 'user'
										? 'bg-blue-600 text-white'
										: 'border border-gray-200 bg-white text-gray-900'} rounded-lg px-3 py-2"
								>
									<p class="text-sm">{message.content}</p>
									<p
										class="text-xs {message.role === 'user'
											? 'text-blue-100'
											: 'text-gray-500'} mt-1"
									>
										{new Date(message.timestamp).toLocaleTimeString()}
									</p>
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Input -->
				<div class="flex gap-2">
					<input
						type="text"
						bind:value={messageInput}
						on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
						placeholder="Type a message..."
						class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
						disabled={sending}
					/>
					<button
						on:click={sendMessage}
						disabled={sending || !messageInput.trim()}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						<Send size={18} />
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}
</style>
