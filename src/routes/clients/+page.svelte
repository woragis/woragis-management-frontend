<script lang="ts">
	import { onMount } from 'svelte';
	import { clientsClient } from '$lib/api/clients';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Client } from '$lib/api/types';

	let loading = true;
	let error: string | null = null;
	let clients: Client[] = [];
	let newClient = {
		name: '',
		email: '',
		phone: '',
		company: ''
	};
	let showForm = false;
	let creating = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadClients();
	});

	async function loadClients() {
		loading = true;
		error = null;

		try {
			const response = await clientsClient.list();
			clients = (response.data as Client[]) || [];
		} catch (err: any) {
			error = err.message || 'Failed to load clients';
			console.error('Error loading clients:', err);
		} finally {
			loading = false;
		}
	}

	async function toggleForm() {
		showForm = !showForm;

		// Fetch CSRF token when showing the form
		if (showForm) {
			try {
				await csrfTokenService.fetchCSRFToken();
			} catch (err) {
				console.error('Failed to fetch CSRF token:', err);
				error = 'Failed to prepare form. Please try again.';
				showForm = false;
			}
		}
	}

	async function handleCreateClient(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		creating = true;

		try {
			await clientsClient.create(newClient);
			newClient = { name: '', email: '', phone: '', company: '' };
			showForm = false;
			await loadClients();
		} catch (err: any) {
			error = err.message || 'Failed to create client';
			console.error('Error creating client:', err);
		} finally {
			creating = false;
		}
	}

	async function handleDeleteClient(id: string) {
		if (!confirm('Are you sure you want to delete this client?')) return;

		error = null;
		try {
			await clientsClient.delete(id);
			await loadClients();
		} catch (err: any) {
			error = err.message || 'Failed to delete client';
			console.error('Error deleting client:', err);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">Clients</h1>
		<button
			onclick={toggleForm}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
		>
			{showForm ? 'Cancel' : '+ New Client'}
		</button>
	</div>

	{#if error}
		<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Add New Client</h2>
			<form class="space-y-4" onsubmit={handleCreateClient}>
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
						Client Name
					</label>
					<input
						id="name"
						type="text"
						placeholder="Enter client name"
						bind:value={newClient.name}
						required
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						id="email"
						type="email"
						placeholder="client@example.com"
						bind:value={newClient.email}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
						Phone
					</label>
					<input
						id="phone"
						type="tel"
						placeholder="+1 (555) 000-0000"
						bind:value={newClient.phone}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="company" class="block text-sm font-medium text-gray-700 mb-1">
						Company
					</label>
					<input
						id="company"
						type="text"
						placeholder="Company name"
						bind:value={newClient.company}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<button
					type="submit"
					disabled={creating}
					class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if creating}
						Adding...
					{:else}
						Add Client
					{/if}
				</button>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
			<p class="mt-4 text-gray-600">Loading clients...</p>
		</div>
	{:else if clients.length === 0}
		<div class="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
			<p class="text-gray-600">No clients yet. Add your first client to get started!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each clients as client (client.id)}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
					<h3 class="text-lg font-semibold text-gray-900">{client.name}</h3>
					<div class="mt-2 space-y-1 text-sm text-gray-600">
						{#if client.email}
							<p>📧 {client.email}</p>
						{/if}
						{#if client.phone}
							<p>📞 {client.phone}</p>
						{/if}
						{#if client.company}
							<p>🏢 {client.company}</p>
						{/if}
					</div>
					<button
						onclick={() => handleDeleteClient(client.id)}
						class="mt-4 w-full rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
					>
						Delete
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
