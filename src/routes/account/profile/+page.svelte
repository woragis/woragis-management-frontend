<script lang="ts">
	import { onMount } from 'svelte';
	import { userProfilesClient } from '$lib/api/user-profiles';
	import { csrfTokenService } from '$lib/api/csrf';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { UserProfile } from '$lib/api/types';
	import { Save, Edit2 } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let success = false;
	let isEditing = false;
	let saving = false;
	let profile = {
		firstName: '',
		lastName: '',
		email: '',
		bio: '',
		avatar: '',
		phone: '',
		location: '',
		website: '',
		github: '',
		linkedin: '',
		twitter: ''
	};

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadProfile();
	});

	async function loadProfile() {
		loading = true;
		error = null;

		try {
			const data = await userProfilesClient.getUserProfile($user!.id);
			profile = data;
		} catch (err: any) {
			console.warn('Failed to load profile, using auth data:', err);
			// Use data from auth store if endpoint not available
			profile.firstName = $user?.firstName || '';
			profile.lastName = $user?.lastName || '';
			profile.email = $user?.email || '';
		} finally {
			loading = false;
		}
	}

	async function toggleEdit() {
		if (isEditing) {
			isEditing = false;
		} else {
			isEditing = true;
			try {
				await csrfTokenService.fetchCSRFToken();
			} catch (err) {
				console.error('Failed to fetch CSRF token:', err);
			}
		}
	}

	async function saveProfile() {
		saving = true;
		error = null;
		success = false;

		try {
			await userProfilesClient.updateUserProfile($user!.id, profile);
			success = true;
			isEditing = false;
			setTimeout(() => (success = false), 3000);
		} catch (err: any) {
			error = err.message || 'Failed to save profile';
			console.error('Error saving profile:', err);
		} finally {
			saving = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
			<p class="mt-2 text-gray-600">Manage your profile information</p>
		</div>
		<button
			on:click={toggleEdit}
			class="flex items-center gap-2 rounded-lg {isEditing ? 'bg-gray-200 text-gray-900' : 'bg-blue-600 text-white'} px-4 py-2 font-medium hover:opacity-90 transition-opacity"
		>
			<Edit2 size={20} />
			{isEditing ? 'Cancel' : 'Edit Profile'}
		</button>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if success}
		<div class="mb-6 rounded-lg bg-green-50 p-4 text-green-800">✓ Profile saved successfully</div>
	{/if}

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
			<p class="mt-4 text-gray-600">Loading profile...</p>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Basic Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
				<div class="grid gap-4 grid-cols-1 md:grid-cols-2">
					<div>
						<label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
							First Name
						</label>
						<input
							id="firstName"
							type="text"
							bind:value={profile.firstName}
							disabled={!isEditing}
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div>
						<label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
							Last Name
						</label>
						<input
							id="lastName"
							type="text"
							bind:value={profile.lastName}
							disabled={!isEditing}
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email
						</label>
						<input
							id="email"
							type="email"
							bind:value={profile.email}
							disabled
							class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 cursor-default"
						/>
						<p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
					</div>
				</div>
			</div>

			<!-- Contact Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
				<div class="grid gap-4 grid-cols-1 md:grid-cols-2">
					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
							Phone
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={profile.phone}
							disabled={!isEditing}
							placeholder="e.g., +1 (555) 123-4567"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div>
						<label for="location" class="block text-sm font-medium text-gray-700 mb-1">
							Location
						</label>
						<input
							id="location"
							type="text"
							bind:value={profile.location}
							disabled={!isEditing}
							placeholder="e.g., San Francisco, CA"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="bio" class="block text-sm font-medium text-gray-700 mb-1">
							Bio
						</label>
						<textarea
							id="bio"
							bind:value={profile.bio}
							disabled={!isEditing}
							placeholder="Tell us about yourself"
							rows="3"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Social Links -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
				<div class="grid gap-4 grid-cols-1 md:grid-cols-2">
					<div>
						<label for="website" class="block text-sm font-medium text-gray-700 mb-1">
							Website
						</label>
						<input
							id="website"
							type="url"
							bind:value={profile.website}
							disabled={!isEditing}
							placeholder="https://example.com"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div>
						<label for="github" class="block text-sm font-medium text-gray-700 mb-1">
							GitHub
						</label>
						<input
							id="github"
							type="url"
							bind:value={profile.github}
							disabled={!isEditing}
							placeholder="https://github.com/username"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div>
						<label for="linkedin" class="block text-sm font-medium text-gray-700 mb-1">
							LinkedIn
						</label>
						<input
							id="linkedin"
							type="url"
							bind:value={profile.linkedin}
							disabled={!isEditing}
							placeholder="https://linkedin.com/in/username"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>

					<div>
						<label for="twitter" class="block text-sm font-medium text-gray-700 mb-1">
							Twitter
						</label>
						<input
							id="twitter"
							type="url"
							bind:value={profile.twitter}
							disabled={!isEditing}
							placeholder="https://twitter.com/username"
							class={`w-full rounded-lg border px-3 py-2 {isEditing ? 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600' : 'border-gray-200 bg-gray-50 text-gray-900 cursor-default'}`}
						/>
					</div>
				</div>
			</div>

			<!-- Save Button -->
			{#if isEditing}
				<div class="flex gap-2">
					<button
						on:click={saveProfile}
						disabled={saving}
						class="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
					>
						<Save size={20} />
						{saving ? 'Saving...' : 'Save Profile'}
					</button>
					<button
						on:click={toggleEdit}
						class="rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-2 font-medium hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
