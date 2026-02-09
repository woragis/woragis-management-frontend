<script lang="ts">
	import { onMount } from 'svelte';
	import { schedulerClient } from '$lib/api/scheduler';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { ScheduledTask } from '$lib/api/types';
	import { Trash2, Plus, Check } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let tasks: ScheduledTask[] = [];
	let newTask = {
		title: '',
		description: '',
		scheduledDate: '',
		priority: 'medium' as const,
		completed: false
	};
	let showForm = false;
	let creating = false;

	const priorityLevels = [
		{ value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
		{ value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
		{ value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
		{ value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
	];

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadTasks();
	});

	async function loadTasks() {
		loading = true;
		error = null;

		try {
			tasks = await schedulerClient.listScheduledTasks();
		} catch (err: any) {
			error = err.message || 'Failed to load tasks';
			console.error('Error loading tasks:', err);
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

	async function createTask() {
		if (!newTask.title || !newTask.scheduledDate) {
			error = 'Please fill in title and scheduled date';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await schedulerClient.createScheduledTask(newTask);
			tasks = [created, ...tasks];
			newTask = {
				title: '',
				description: '',
				scheduledDate: '',
				priority: 'medium',
				completed: false
			};
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create task';
			console.error('Error creating task:', err);
		} finally {
			creating = false;
		}
	}

	async function toggleTaskCompletion(task: ScheduledTask) {
		try {
			const updated = await schedulerClient.updateScheduledTask(task.id, {
				completed: !task.completed
			});
			tasks = tasks.map((t) => (t.id === task.id ? updated : t));
		} catch (err: any) {
			error = err.message || 'Failed to update task';
			console.error('Error updating task:', err);
		}
	}

	async function deleteTask(id: string) {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}

		try {
			await schedulerClient.deleteScheduledTask(id);
			tasks = tasks.filter((t) => t.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete task';
			console.error('Error deleting task:', err);
		}
	}

	function getPriorityColor(priority: string) {
		return priorityLevels.find((p) => p.value === priority)?.color || priorityLevels[1].color;
	}

	function upcomingTasks() {
		const now = new Date();
		return tasks.filter((t) => new Date(t.scheduledDate) >= now).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
	}

	function pastTasks() {
		const now = new Date();
		return tasks.filter((t) => new Date(t.scheduledDate) < now);
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Scheduler</h1>
				<p class="mt-2 text-gray-600">Plan and track your tasks</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
			>
				<Plus size={20} />
				New Task
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">New Task</h2>
			<form
				on:submit|preventDefault={createTask}
				class="grid gap-4 grid-cols-1 md:grid-cols-2"
			>
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
						Task Title *
					</label>
					<input
						id="title"
						type="text"
						bind:value={newTask.title}
						placeholder="e.g., Review project proposal"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
						Priority
					</label>
					<select
						id="priority"
						bind:value={newTask.priority}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					>
						{#each priorityLevels as level}
							<option value={level.value}>{level.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="scheduledDate" class="block text-sm font-medium text-gray-700 mb-1">
						Scheduled Date *
					</label>
					<input
						id="scheduledDate"
						type="datetime-local"
						bind:value={newTask.scheduledDate}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div class="md:col-span-2">
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						id="description"
						bind:value={newTask.description}
						placeholder="Add details about this task"
						rows="3"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					></textarea>
				</div>

				<div class="md:col-span-2 flex gap-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create Task'}
					</button>
					<button
						type="button"
						on:click={toggleForm}
						class="flex-1 rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 font-medium hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
			<p class="mt-4 text-gray-600">Loading tasks...</p>
		</div>
	{:else if tasks.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">No tasks scheduled. Create your first task to get started.</p>
		</div>
	{:else}
		<div class="space-y-8">
			{#if upcomingTasks().length > 0}
				<div>
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
					<div class="space-y-3">
						{#each upcomingTasks() as task (task.id)}
							<div
								class="rounded-lg border {task.completed ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'} p-4 hover:shadow-md transition-shadow"
							>
								<div class="flex items-start justify-between gap-3">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<button
												on:click={() => toggleTaskCompletion(task)}
												class={`flex-shrink-0 w-5 h-5 rounded border transition-colors ${
													task.completed
														? 'bg-green-600 border-green-600'
														: 'border-gray-300 hover:border-green-600'
												}`}
											>
												{#if task.completed}
													<Check size={16} class="text-white m-auto" />
												{/if}
											</button>
											<h3 class={`text-base font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
												{task.title}
											</h3>
											<span class={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
												{priorityLevels.find((p) => p.value === task.priority)?.label}
											</span>
										</div>

										{#if task.description}
											<p class="text-sm text-gray-600 ml-7">{task.description}</p>
										{/if}

										<p class="text-xs text-gray-500 ml-7 mt-2">
											{new Date(task.scheduledDate).toLocaleString()}
										</p>
									</div>

									<button
										on:click={() => deleteTask(task.id)}
										class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
										title="Delete task"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if pastTasks().length > 0}
				<div>
					<h2 class="text-lg font-semibold text-gray-900 mb-4">Past Tasks</h2>
					<div class="space-y-3 opacity-60">
						{#each pastTasks() as task (task.id)}
							<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
								<div class="flex items-start justify-between gap-3">
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-base font-semibold line-through text-gray-500">{task.title}</h3>
											<span class={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
												{priorityLevels.find((p) => p.value === task.priority)?.label}
											</span>
										</div>
										<p class="text-xs text-gray-500 ml-7 mt-2">
											{new Date(task.scheduledDate).toLocaleString()}
										</p>
									</div>

									<button
										on:click={() => deleteTask(task.id)}
										class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
										title="Delete task"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
