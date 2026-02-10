<script lang="ts">
	import { onMount } from 'svelte';
	import { apiKeysClient } from '$lib/api/api-keys';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { ApiKey } from '$lib/api/types';
	import { Trash2, Plus, Copy, Eye, EyeOff } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let apiKeys: ApiKey[] = [];
	let newKeyName = '';
	let showForm = false;
	let creating = false;
	let createdKey: string | null = null;
	let showCreatedKey = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadAPIKeys();
	});

	async function loadAPIKeys() {
		loading = true;
		error = null;

		try {
			apiKeys = (await apiKeysClient.listKeys()).data;
		} catch (err: any) {
			error = err.message || 'Failed to load API keys';
			console.error('Error loading API keys:', err);
		} finally {
			loading = false;
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

	async function createAPIKey() {
		if (!newKeyName) {
			error = 'Please enter a name for the API key';
			return;
		}

		creating = true;
		error = null;

		try {
			const result = await apiKeysClient.createKey({ name: newKeyName });
			createdKey = result.key;
			showCreatedKey = true;
			apiKeys = [result, ...apiKeys];
			newKeyName = '';
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create API key';
			console.error('Error creating API key:', err);
		} finally {
			creating = false;
		}
	}

	async function deleteAPIKey(id: string) {
		if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
			return;
		}

		try {
			await apiKeysClient.revokeKey(id);
			apiKeys = apiKeys.filter((k) => k.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete API key';
			console.error('Error deleting API key:', err);
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<div class="container mx-auto max-w-3xl px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">API Keys</h1>
				<p class="mt-2 text-gray-600">Manage your API keys for development access</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				<Plus size={20} />
				New API Key
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if createdKey}
		<div class="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
			<div class="mb-3">
				<p class="mb-2 text-sm font-medium text-green-800">✓ API Key Created Successfully</p>
				<p class="mb-3 text-xs text-green-700">
					Keep this key safe. You won't be able to see it again.
				</p>
			</div>
			<div class="flex items-center gap-2 rounded-lg border border-green-200 bg-white p-3">
				<input
					type={showCreatedKey ? 'text' : 'password'}
					value={createdKey}
					disabled
					class="flex-1 border-0 bg-white font-mono text-sm text-gray-900 focus:outline-none"
				/>
				<button
					on:click={() => (showCreatedKey = !showCreatedKey)}
					class="text-gray-600 hover:text-gray-900"
					title={showCreatedKey ? 'Hide' : 'Show'}
				>
					{#if showCreatedKey}
						<Eye size={18} />
					{:else}
						<EyeOff size={18} />
					{/if}
				</button>
				<button
					on:click={() => copyToClipboard(createdKey || '')}
					class="text-gray-600 hover:text-gray-900"
					title="Copy to clipboard"
				>
					<Copy size={18} />
				</button>
			</div>
			<button
				on:click={() => (createdKey = null)}
				class="mt-3 w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-green-800 transition-colors hover:bg-green-50"
			>
				Close
			</button>
		</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Create New API Key</h2>
			<form on:submit|preventDefault={createAPIKey} class="grid gap-4">
				<div>
					<label for="keyName" class="mb-1 block text-sm font-medium text-gray-700">
						Key Name
					</label>
					<input
						id="keyName"
						type="text"
						bind:value={newKeyName}
						placeholder="e.g., My Mobile App"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
					<p class="mt-1 text-xs text-gray-600">
						Give this key a meaningful name to identify its use
					</p>
				</div>

				<div class="flex gap-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create API Key'}
					</button>
					<button
						type="button"
						on:click={toggleForm}
						class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="py-12 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-4 text-gray-600">Loading API keys...</p>
		</div>
	{:else if apiKeys.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">
				No API keys created yet. Create your first key to get started with development.
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50">
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Key</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Created</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Last Used</th>
						<th class="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each apiKeys as apiKey (apiKey.id)}
						<tr class="border-b border-gray-200 hover:bg-gray-50">
							<td class="px-6 py-3 text-sm font-medium text-gray-900">{apiKey.name}</td>
							<td class="px-6 py-3 font-mono text-sm text-gray-600">
								{apiKey.key.substring(0, 8)}••••••••
								<button
									on:click={() => copyToClipboard(apiKey.key)}
									class="ml-2 text-blue-600 hover:text-blue-800"
									title="Copy key"
								>
									<Copy size={14} />
								</button>
							</td>
							<td class="px-6 py-3 text-sm text-gray-600">
								{new Date(apiKey.createdAt).toLocaleDateString()}
							</td>
							<td class="px-6 py-3 text-sm text-gray-600">
								{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
							</td>
							<td class="px-6 py-3 text-center">
								<button
									on:click={() => deleteAPIKey(apiKey.id)}
									class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
									title="Delete API key"
								>
									<Trash2 size={16} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
