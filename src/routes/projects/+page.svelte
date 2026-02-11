<script lang="ts">
	import { onMount } from 'svelte';
	import { projectsClient } from '$lib/api/projects';
	import { csrfTokenService } from '$lib/api/csrf';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Project } from '$lib/api/types';

	let loading = true;
	let error: string | null = null;
	let projects: Project[] = [];
	let newProject = {
		name: '',
		description: '',
		status: 'planning' as const,
		healthScore: 0,
		mrr: 0,
		cac: 0,
		ltv: 0,
		churnRate: 0
	};
	let showForm = false;
	let creating = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadProjects();
	});

	async function loadProjects() {
		loading = true;
		error = null;

		try {
			const response = await projectsClient.listProjects();
			projects = response.data || [];
		} catch (err: any) {
			error = err.message || 'Failed to load projects';
			console.error('Error loading projects:', err);
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

	async function handleCreateProject(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		creating = true;

		try {
			// Map frontend fields to backend expected fields
			const payload = {
				name: newProject.name,
				description: newProject.description,
				status: newProject.status,
				healthScore: Number(newProject.healthScore),
				mrr: Number(newProject.mrr),
				cac: Number(newProject.cac),
				ltv: Number(newProject.ltv),
				churnRate: Number(newProject.churnRate)
			};
			await projectsClient.createProject(payload);
			newProject = { name: '', description: '', status: 'planning' as const, healthScore: 0, mrr: 0, cac: 0, ltv: 0, churnRate: 0 };
			showForm = false;
			await loadProjects();
		} catch (err: any) {
			error = err.message || 'Failed to create project';
			console.error('Error creating project:', err);
		} finally {
			creating = false;
		}
	}

	async function handleDeleteProject(id: string) {
		if (!confirm('Are you sure you want to delete this project?')) return;

		error = null;
		try {
			await projectsClient.deleteProject(id);
			await loadProjects();
		} catch (err: any) {
			error = err.message || 'Failed to delete project';
			console.error('Error deleting project:', err);
		}
	}

	function navigateToDetail(projectId: string) {
		goto(`/projects/${projectId}`);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">Projects</h1>
		<button
			onclick={toggleForm}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
		>
			{showForm ? 'Cancel' : '+ New Project'}
		</button>
	</div>

	{#if error}
		<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Create New Project</h2>
			<form class="space-y-4" on:submit|preventDefault={handleCreateProject}>
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
						Project Name
					</label>
					<input
						id="name"
						type="text"
						placeholder="Enter project name"
						bind:value={newProject.name}
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
						placeholder="Project description"
						bind:value={newProject.description}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					></textarea>
				</div>

				<div>
					<label for="status" class="mb-1 block text-sm font-medium text-gray-700"> Status </label>
					<select
						id="status"
						bind:value={newProject.status}
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					>
						<option value="planning">Planning</option>
						<option value="idea">Idea</option>
						<option value="executing">Executing</option>
						<option value="monitoring">Monitoring</option>
						<option value="completed">Completed</option>
					</select>
				</div>

				<div>
					<label for="healthScore" class="mb-1 block text-sm font-medium text-gray-700">Health Score</label>
					<input
						id="healthScore"
						type="number"
						bind:value={newProject.healthScore}
						min="0"
						max="100"
						required
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="mrr" class="mb-1 block text-sm font-medium text-gray-700">MRR</label>
					<input
						id="mrr"
						type="number"
						bind:value={newProject.mrr}
						min="0"
						step="0.01"
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="cac" class="mb-1 block text-sm font-medium text-gray-700">CAC</label>
					<input
						id="cac"
						type="number"
						bind:value={newProject.cac}
						min="0"
						step="0.01"
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="ltv" class="mb-1 block text-sm font-medium text-gray-700">LTV</label>
					<input
						id="ltv"
						type="number"
						bind:value={newProject.ltv}
						min="0"
						step="0.01"
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label for="churnRate" class="mb-1 block text-sm font-medium text-gray-700">Churn Rate</label>
					<input
						id="churnRate"
						type="number"
						bind:value={newProject.churnRate}
						min="0"
						step="0.01"
						disabled={creating}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					disabled={creating}
					class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if creating}
						Creating...
					{:else}
						Create Project
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
			<p class="mt-4 text-gray-600">Loading projects...</p>
		</div>
	{:else if projects.length === 0}
		<div class="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
			<p class="text-gray-600">No projects yet. Create your first project to get started!</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each projects as project (project.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="mb-3 flex items-start justify-between">
						<h3 class="text-lg font-semibold text-gray-900">{project.name}</h3>
						<span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
							{project.status || 'PLANNING'}
						</span>
					</div>
					{#if project.description}
						<p class="mb-4 line-clamp-2 text-sm text-gray-600">{project.description}</p>
					{/if}
					<div class="flex gap-2">
						<button
							onclick={() => navigateToDetail(project.id)}
							class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
						>
							View
						</button>
						<button
							onclick={() => handleDeleteProject(project.id)}
							class="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
