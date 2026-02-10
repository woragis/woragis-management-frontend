<script lang="ts">
	import { onMount } from 'svelte';
	import { ideasClient } from '$lib/api/ideas';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Idea } from '$lib/api/types';

	let loading = true;
	let error: string | null = null;
	let ideas: Idea[] = [];
	let newIdea = {
		title: '',
		description: '',
		category: 'GENERAL'
	};
	let showForm = false;
	let creating = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadIdeas();
	});

	async function loadIdeas() {
		loading = true;
		error = null;

		try {
			const response = await ideasClient.list();
			ideas = (response.data as Idea[]) || [];
		} catch (err: any) {
			error = err.message || 'Failed to load ideas';
			console.error('Error loading ideas:', err);
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

	async function handleCreateIdea(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		creating = true;

		try {
			await ideasClient.create(newIdea);
			newIdea = { title: '', description: '', category: 'GENERAL' };
			showForm = false;
			await loadIdeas();
		} catch (err: any) {
			error = err.message || 'Failed to create idea';
			console.error('Error creating idea:', err);
		} finally {
			creating = false;
		}
	}

	async function handleDeleteIdea(id: string) {
		if (!confirm('Are you sure you want to delete this idea?')) return;

		error = null;
		try {
			await ideasClient.delete(id);
			await loadIdeas();
		} catch (err: any) {
			error = err.message || 'Failed to delete idea';
			console.error('Error deleting idea:', err);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">Ideas</h1>
		<button
			onclick={toggleForm}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			{showForm ? 'Cancel' : '+ New Idea'}
		</button>
	</div>

	{#if error}
		<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Create New Idea</h2>
			<form class="space-y-4" onsubmit={handleCreateIdea}>
				<div>
					<label for="title" class="mb-1 block text-sm font-medium text-gray-700">
						Idea Title
					</label>
					<input
						id="title"
						type="text"
						placeholder="Enter idea title"
						bind:value={newIdea.title}
						required
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="description" class="mb-1 block text-sm font-medium text-gray-700">
						Description
					</label>
					<textarea
						id="description"
						placeholder="Idea description"
						bind:value={newIdea.description}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					></textarea>
				</div>

				<div>
					<label for="category" class="mb-1 block text-sm font-medium text-gray-700">
						Category
					</label>
					<select
						id="category"
						bind:value={newIdea.category}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					>
						<option value="GENERAL">General</option>
						<option value="PRODUCT">Product</option>
						<option value="FEATURE">Feature</option>
						<option value="CONTENT">Content</option>
						<option value="OTHER">Other</option>
					</select>
				</div>

				<button
					type="submit"
					disabled={creating}
					class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if creating}
						Creating...
					{:else}
						Create Idea
					{/if}
				</button>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="py-12 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-4 text-gray-600">Loading ideas...</p>
		</div>
	{:else if ideas.length === 0}
		<div class="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
			<p class="text-gray-600">No ideas yet. Create your first idea to get started!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each ideas as idea (idea.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="mb-3">
						<h3 class="text-lg font-semibold text-gray-900">{idea.title}</h3>
						<span
							class="mt-1 inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
						>
							{idea.category || 'GENERAL'}
						</span>
					</div>
					{#if idea.description}
						<p class="mb-4 line-clamp-2 text-sm text-gray-600">{idea.description}</p>
					{/if}
					<button
						onclick={() => handleDeleteIdea(idea.id)}
						class="w-full rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
					>
						Delete
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
