<script lang="ts">
	import { onMount } from 'svelte';
	import { languagesClient } from '$lib/api/languages';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Language } from '$lib/api/types';
	import { Trash2, Plus } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let languages: Language[] = [];
	let newLanguage = {
		name: '',
		proficiency: 'intermediate' as const
	};
	let showForm = false;
	let creating = false;

	const proficiencyLevels = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' },
		{ value: 'fluent', label: 'Fluent' },
		{ value: 'native', label: 'Native Speaker' }
	];

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadLanguages();
	});

	async function loadLanguages() {
		loading = true;
		error = null;

		try {
			languages = await languagesClient.listLanguages();
		} catch (err: any) {
			error = err.message || 'Failed to load languages';
			console.error('Error loading languages:', err);
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

	async function createLanguage() {
		if (!newLanguage.name) {
			error = 'Please enter a language name';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await languagesClient.createLanguage(newLanguage);
			languages = [created, ...languages];
			newLanguage = {
				name: '',
				proficiency: 'intermediate'
			};
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create language';
			console.error('Error creating language:', err);
		} finally {
			creating = false;
		}
	}

	async function deleteLanguage(id: string) {
		if (!confirm('Are you sure you want to delete this language?')) {
			return;
		}

		try {
			await languagesClient.deleteLanguage(id);
			languages = languages.filter((l) => l.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete language';
			console.error('Error deleting language:', err);
		}
	}

	function getProficiencyColor(proficiency: string) {
		const colors: Record<string, string> = {
			beginner: 'bg-gray-100 text-gray-800',
			intermediate: 'bg-blue-100 text-blue-800',
			advanced: 'bg-purple-100 text-purple-800',
			fluent: 'bg-green-100 text-green-800',
			native: 'bg-indigo-100 text-indigo-800'
		};
		return colors[proficiency] || colors.intermediate;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Languages</h1>
				<p class="mt-2 text-gray-600">Manage your language proficiencies</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors"
			>
				<Plus size={20} />
				Add Language
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Add Language</h2>
			<form
				on:submit|preventDefault={createLanguage}
				class="grid gap-4 grid-cols-1 md:grid-cols-2"
			>
				<div>
					<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
						Language Name *
					</label>
					<input
						id="name"
						type="text"
						bind:value={newLanguage.name}
						placeholder="e.g., Spanish, Portuguese"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					/>
				</div>

				<div>
					<label for="proficiency" class="block text-sm font-medium text-gray-700 mb-1">
						Proficiency Level
					</label>
					<select
						id="proficiency"
						bind:value={newLanguage.proficiency}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
					>
						{#each proficiencyLevels as level}
							<option value={level.value}>{level.label}</option>
						{/each}
					</select>
				</div>

				<div class="md:col-span-2 flex gap-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						{creating ? 'Adding...' : 'Add Language'}
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
			<p class="mt-4 text-gray-600">Loading languages...</p>
		</div>
	{:else if languages.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">No languages added yet. Add your language proficiencies to get started.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each languages as language (language.id)}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-lg font-semibold text-gray-900">{language.name}</h3>
						<button
							on:click={() => deleteLanguage(language.id)}
							class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 hover:bg-red-50 transition-colors"
							title="Delete language"
						>
							<Trash2 size={16} />
						</button>
					</div>

					<div class={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getProficiencyColor(language.proficiency)}`}>
						{proficiencyLevels.find((l) => l.value === language.proficiency)?.label || language.proficiency}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
