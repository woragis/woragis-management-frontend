<script lang="ts">
	import { projectsClient, type Project } from '$lib';
	import { onMount } from 'svelte';

	let projects: Project[] = [];
	let loading = false;
	let error = '';
	let currentPage = 1;
	const itemsPerPage = 10;

	let newProject = {
		name: '',
		description: '',
		status: 'planning' as const,
	};

	onMount(async () => {
		await loadProjects();
	});

	async function loadProjects() {
		try {
			loading = true;
			error = '';
			const response = await projectsClient.listProjects(currentPage, itemsPerPage);
			projects = response.data;
		} catch (err: any) {
			error = err.response?.data?.message || 'Failed to load projects';
		} finally {
			loading = false;
		}
	}

	async function createProject() {
		if (!newProject.name.trim()) {
			error = 'Project name is required';
			return;
		}

		try {
			loading = true;
			error = '';
			await projectsClient.createProject(newProject);
			newProject = { name: '', description: '', status: 'planning' };
			await loadProjects();
		} catch (err: any) {
			error = err.response?.data?.message || 'Failed to create project';
		} finally {
			loading = false;
		}
	}

	async function deleteProject(id: string) {
		if (!confirm('Are you sure you want to delete this project?')) return;

		try {
			loading = true;
			error = '';
			await projectsClient.deleteProject(id);
			await loadProjects();
		} catch (err: any) {
			error = err.response?.data?.message || 'Failed to delete project';
		} finally {
			loading = false;
		}
	}

	async function updateStatus(id: string, status: Project['status']) {
		try {
			error = '';
			await projectsClient.updateStatus(id, status);
			await loadProjects();
		} catch (err: any) {
			error = err.response?.data?.message || 'Failed to update project';
		}
	}
</script>

<div class="projects-container">
	<h1>Projects Management</h1>

	{#if error}
		<div class="alert alert-error">
			{error}
		</div>
	{/if}

	<div class="create-form">
		<h2>Create New Project</h2>
		<input
			bind:value={newProject.name}
			type="text"
			placeholder="Project name"
			disabled={loading}
		/>
		<textarea
			bind:value={newProject.description}
			placeholder="Project description"
			disabled={loading}
		></textarea>
		<select bind:value={newProject.status} disabled={loading}>
			<option value="planning">Planning</option>
			<option value="in_progress">In Progress</option>
			<option value="on_hold">On Hold</option>
			<option value="completed">Completed</option>
			<option value="archived">Archived</option>
		</select>
		<button on:click={createProject} disabled={loading}>
			{loading ? 'Creating...' : 'Create Project'}
		</button>
	</div>

	<div class="projects-list">
		<h2>Projects</h2>
		{#if loading && projects.length === 0}
			<p>Loading projects...</p>
		{:else if projects.length === 0}
			<p>No projects yet. Create one to get started!</p>
		{:else}
			<div class="projects-grid">
				{#each projects as project (project.id)}
					<div class="project-card">
						<h3>{project.name}</h3>
						{#if project.description}
							<p>{project.description}</p>
						{/if}
						<div class="project-meta">
							<span class="status" data-status={project.status}>
								{project.status.replace('_', ' ')}
							</span>
							{#if project.createdAt}
								<span class="date">
									{new Date(project.createdAt).toLocaleDateString()}
								</span>
							{/if}
						</div>
						<div class="project-actions">
							<select
								value={project.status}
								on:change={(e) => updateStatus(project.id, e.currentTarget.value as any)}
								disabled={loading}
							>
								<option value="planning">Planning</option>
								<option value="in_progress">In Progress</option>
								<option value="on_hold">On Hold</option>
								<option value="completed">Completed</option>
								<option value="archived">Archived</option>
							</select>
							<button
								on:click={() => deleteProject(project.id)}
								disabled={loading}
								class="delete-btn"
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.projects-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		color: #333;
		margin-bottom: 20px;
	}

	.alert {
		padding: 15px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: #fee;
		color: #c33;
		border: 1px solid #fcc;
	}

	.create-form {
		background: #f9f9f9;
		padding: 20px;
		border-radius: 8px;
		margin-bottom: 30px;
	}

	.create-form h2 {
		margin-top: 0;
		color: #333;
	}

	input,
	textarea,
	select {
		width: 100%;
		padding: 10px;
		margin-bottom: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-family: inherit;
		font-size: 14px;
	}

	textarea {
		resize: vertical;
		min-height: 80px;
	}

	button {
		background: #0066cc;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
	}

	button:hover:not(:disabled) {
		background: #0052a3;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
	}

	.project-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.project-card h3 {
		margin: 0 0 10px 0;
		color: #333;
	}

	.project-card p {
		margin: 0 0 15px 0;
		color: #666;
		font-size: 14px;
	}

	.project-meta {
		display: flex;
		gap: 10px;
		margin-bottom: 15px;
		flex-wrap: wrap;
	}

	.status {
		display: inline-block;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		text-transform: capitalize;
	}

	.status[data-status='planning'] {
		background: #e3f2fd;
		color: #1976d2;
	}

	.status[data-status='in_progress'] {
		background: #fff3e0;
		color: #f57c00;
	}

	.status[data-status='completed'] {
		background: #e8f5e9;
		color: #388e3c;
	}

	.status[data-status='archived'] {
		background: #f5f5f5;
		color: #757575;
	}

	.status[data-status='on_hold'] {
		background: #fce4ec;
		color: #c2185b;
	}

	.date {
		font-size: 12px;
		color: #999;
	}

	.project-actions {
		display: flex;
		gap: 10px;
	}

	.project-actions select {
		flex: 1;
		margin: 0;
	}

	.delete-btn {
		background: #dc3545;
		padding: 10px 15px;
		white-space: nowrap;
	}

	.delete-btn:hover:not(:disabled) {
		background: #c82333;
	}

	p {
		text-align: center;
		color: #999;
	}
</style>
