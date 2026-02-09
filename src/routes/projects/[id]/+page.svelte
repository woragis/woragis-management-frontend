<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { projectsClient } from '$lib/api/projects';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import type { Project } from '$lib/api/types';

	let projectId: string;
	let project: Project | null = null;
	let loading = true;
	let error: string | null = null;

	$: if ($page.params.id) {
		projectId = $page.params.id;
		loadProject();
	}

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
		}

		// Fetch CSRF token on mount for any state-changing operations
		try {
			await csrfTokenService.fetchCSRFToken();
		} catch (err) {
			console.error('Failed to fetch CSRF token:', err);
		}
	});

	async function loadProject() {
		loading = true;
		error = null;

		try {
			// For now, use slug method - in production you'd have getById
			const data = await projectsClient.getProjectBySlug(projectId);
			project = data;
		} catch (err: any) {
			error = err.message || 'Failed to load project';
			console.error('Error loading project:', err);
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this project?')) return;

		try {
			await projectsClient.deleteProject(projectId);
			await goto('/projects');
		} catch (err: any) {
			error = err.message || 'Failed to delete project';
			console.error('Error deleting project:', err);
		}
	}

	async function handleStatusChange(newStatus: string) {
		if (!project) return;
		error = null;

		try {
			await projectsClient.updateStatus(projectId, newStatus as any);
			project = { ...project, status: newStatus as any };
		} catch (err: any) {
			error = err.message || 'Failed to update status';
			console.error('Error updating status:', err);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<button
		onclick={() => goto('/projects')}
		class="mb-6 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
	>
		← Back to Projects
	</button>

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
			<p class="mt-4 text-gray-600">Loading project...</p>
		</div>
	{:else if error}
		<div class="rounded-lg bg-red-50 p-4 text-red-800">
			<p>{error}</p>
			<button
				onclick={loadProject}
				class="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm hover:bg-red-100 transition-colors"
			>
				Try Again
			</button>
		</div>
	{:else if project}
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-3xl font-bold text-gray-900">{project.name}</h1>
				<button
					onclick={handleDelete}
					class="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
				>
					Delete
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<p class="text-sm font-medium text-gray-600">Status</p>
					<select
						value={project.status || 'planning'}
						onchange={(e) => handleStatusChange(e.currentTarget.value)}
						class="mt-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					>
						<option value="planning">Planning</option>
						<option value="in_progress">In Progress</option>
						<option value="on_hold">On Hold</option>
						<option value="completed">Completed</option>
						<option value="archived">Archived</option>
					</select>
				</div>
				{#if project.description}
					<div>
						<p class="text-sm font-medium text-gray-600">Description</p>
						<p class="mt-1 whitespace-pre-wrap text-gray-900">{project.description}</p>
					</div>
				{/if}
				{#if project.slug}
					<div>
						<p class="text-sm font-medium text-gray-600">Slug</p>
						<p class="mt-1 text-gray-900">{project.slug}</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
