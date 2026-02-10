<script lang="ts">
	import { onMount } from 'svelte';
	import { userPreferencesClient } from '$lib/api/user-preferences';
	import { csrfTokenService } from '$lib/api/csrf';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { UserPreferences } from '$lib/api/types';
	import { Save } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let success = false;
	let preferences: UserPreferences = {
		id: '',
		userId: '',
		theme: 'light',
		language: 'en',
		timezone: '',
		emailNotifications: true,
		pushNotifications: false,
		twoFactorEnabled: false,
		createdAt: '',
		updatedAt: ''
	};
	let saving = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadPreferences();
	});

	async function loadPreferences() {
		loading = true;
		error = null;

		try {
			const prefs = await userPreferencesClient.getPreferences();
			preferences = prefs;
		} catch (err: any) {
			console.warn('Failed to load preferences, using defaults:', err);
			// Use defaults if endpoint not available yet
		} finally {
			loading = false;
		}
	}

	async function savePreferences() {
		saving = true;
		error = null;
		success = false;

		try {
			await csrfTokenService.fetchCSRFToken();
			await userPreferencesClient.updatePreferences(preferences);
			success = true;
			setTimeout(() => (success = false), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to save preferences';
			console.error('Error saving preferences:', err);
		} finally {
			saving = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Settings</h1>
		<p class="mt-2 text-gray-600">Manage your account preferences</p>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if success}
		<div class="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
			✓ Preferences saved successfully
		</div>
	{/if}

	{#if loading}
		<div class="py-12 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-4 text-gray-600">Loading preferences...</p>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Appearance -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Appearance</h2>
				<div class="space-y-4">
					<div>
						<label for="theme" class="mb-2 block text-sm font-medium text-gray-700"> Theme </label>
						<select
							id="theme"
							bind:value={preferences.theme}
							class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
						>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
							<option value="auto">Auto (System)</option>
						</select>
					</div>

					<div>
						<label for="language" class="mb-2 block text-sm font-medium text-gray-700">
							Language
						</label>
						<select
							id="language"
							bind:value={preferences.language}
							class="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
						>
							<option value="en">English</option>
							<option value="es">Spanish</option>
							<option value="pt">Portuguese</option>
							<option value="fr">French</option>
							<option value="de">German</option>
						</select>
					</div>
				</div>
			</div>

			<!-- Notifications -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Notifications</h2>
				<div class="space-y-4">
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							bind:checked={preferences.emailNotifications}
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
						/>
						<div>
							<p class="text-sm font-medium text-gray-900">Email Notifications</p>
							<p class="text-xs text-gray-600">Receive updates via email</p>
						</div>
					</label>

					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							bind:checked={preferences.pushNotifications}
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
						/>
						<div>
							<p class="text-sm font-medium text-gray-900">Push Notifications</p>
							<p class="text-xs text-gray-600">Receive browser notifications</p>
						</div>
					</label>
				</div>
			</div>

			<!-- Security -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Security</h2>
				<div class="space-y-4">
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							bind:checked={preferences.twoFactorEnabled}
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
						/>
						<div>
							<p class="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
							<p class="text-xs text-gray-600">Add an extra layer of security</p>
						</div>
					</label>
				</div>
			</div>

			<!-- Save Button -->
			<div class="flex gap-2">
				<button
					on:click={savePreferences}
					disabled={saving}
					class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
				>
					<Save size={20} />
					{saving ? 'Saving...' : 'Save Preferences'}
				</button>
			</div>
		</div>
	{/if}
</div>
