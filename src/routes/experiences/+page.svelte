<script lang="ts">
	import { onMount } from 'svelte';
	import { experiencesClient } from '$lib/api/experiences';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Experience } from '$lib/api/types';
	import { Trash2, Plus } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let experiences: Experience[] = [];
	let newExperience = {
		title: '',
		company: '',
		description: '',
		startDate: '',
		endDate: '',
		skills: [] as string[]
	};
	let showForm = false;
	let creating = false;
	let skillInput = '';

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadExperiences();
	});

	async function loadExperiences() {
		loading = true;
		error = null;

		try {
			experiences = await experiencesClient.listExperiences();
		} catch (err: any) {
			error = err.message || 'Failed to load experiences';
			console.error('Error loading experiences:', err);
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

	function addSkill() {
		if (skillInput.trim()) {
			newExperience.skills = [...newExperience.skills, skillInput.trim()];
			skillInput = '';
		}
	}

	function removeSkill(skill: string) {
		newExperience.skills = newExperience.skills.filter((s) => s !== skill);
	}

	async function createExperience() {
		if (!newExperience.title || !newExperience.company || !newExperience.startDate) {
			error = 'Please fill in all required fields';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await experiencesClient.createExperience(newExperience);
			experiences = [created, ...experiences];
			newExperience = {
				title: '',
				company: '',
				description: '',
				startDate: '',
				endDate: '',
				skills: []
			};
			skillInput = '';
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create experience';
			console.error('Error creating experience:', err);
		} finally {
			creating = false;
		}
	}

	async function deleteExperience(id: string) {
		if (!confirm('Are you sure you want to delete this experience?')) {
			return;
		}

		try {
			await experiencesClient.deleteExperience(id);
			experiences = experiences.filter((e) => e.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete experience';
			console.error('Error deleting experience:', err);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Experiences</h1>
				<p class="mt-2 text-gray-600">Showcase your career journey</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
			>
				<Plus size={20} />
				New Experience
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">New Experience</h2>
			<form
				on:submit|preventDefault={createExperience}
				class="grid gap-4 grid-cols-1 md:grid-cols-2"
			>
				<div>
					<label for="title" class="block text-sm font-medium text-gray-700 mb-1">
						Job Title *
					</label>
					<input
						id="title"
						type="text"
						bind:value={newExperience.title}
						placeholder="e.g., Senior Developer"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="company" class="block text-sm font-medium text-gray-700 mb-1">
						Company *
					</label>
					<input
						id="company"
						type="text"
						bind:value={newExperience.company}
						placeholder="e.g., Tech Corp"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
						Start Date *
					</label>
					<input
						id="startDate"
						type="date"
						bind:value={newExperience.startDate}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
						End Date
					</label>
					<input
						id="endDate"
						type="date"
						bind:value={newExperience.endDate}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div class="md:col-span-2">
					<label for="description" class="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						id="description"
						bind:value={newExperience.description}
						placeholder="Describe your responsibilities and achievements"
						rows="3"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					></textarea>
				</div>

				<div class="md:col-span-2">
					<label class="block text-sm font-medium text-gray-700 mb-2">Skills</label>
					<div class="flex gap-2 mb-2">
						<input
							type="text"
							bind:value={skillInput}
							placeholder="Add a skill"
							on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
							class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
						/>
						<button
							type="button"
							on:click={addSkill}
							class="rounded-lg bg-gray-200 text-gray-900 px-3 py-2 font-medium hover:bg-gray-300 transition-colors"
						>
							Add
						</button>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each newExperience.skills as skill (skill)}
							<div class="flex items-center gap-2 rounded-full bg-blue-100 text-blue-800 px-3 py-1">
								<span class="text-sm">{skill}</span>
								<button
									type="button"
									on:click={() => removeSkill(skill)}
									class="text-blue-600 hover:text-blue-800"
								>
									×
								</button>
							</div>
						{/each}
					</div>
				</div>

				<div class="md:col-span-2 flex gap-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create Experience'}
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
			<p class="mt-4 text-gray-600">Loading experiences...</p>
		</div>
	{:else if experiences.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">No experiences yet. Add your first work experience to get started.</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each experiences as experience (experience.id)}
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
					<div class="flex items-start justify-between mb-2">
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-gray-900">{experience.title}</h3>
							<p class="text-gray-600">{experience.company}</p>
						</div>
						<button
							on:click={() => deleteExperience(experience.id)}
							class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 hover:bg-red-50 transition-colors"
							title="Delete experience"
						>
							<Trash2 size={16} />
						</button>
					</div>

					{#if experience.description}
						<p class="mb-3 text-gray-700">{experience.description}</p>
					{/if}

					<div class="flex items-center gap-4 mb-3 text-sm text-gray-600">
						<span>
							{new Date(experience.startDate).toLocaleDateString()} -
							{experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'}
						</span>
					</div>

					{#if experience.skills && experience.skills.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each experience.skills as skill}
								<span class="inline-block rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium">
									{skill}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
