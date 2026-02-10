<script lang="ts">
	let github = '';
	let linkedin = '';
	let twitter = '';

	function syncSocialLinksFromProfile() {
		if (!profile.socialLinks) profile.socialLinks = {};
		github = profile.socialLinks.github || '';
		linkedin = profile.socialLinks.linkedin || '';
		twitter = profile.socialLinks.twitter || '';
	}

	function updateSocialLinks() {
		if (!profile.socialLinks) profile.socialLinks = {};
		profile.socialLinks.github = github;
		profile.socialLinks.linkedin = linkedin;
		profile.socialLinks.twitter = twitter;
	}

	onMount(() => {
		syncSocialLinksFromProfile();
	});
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
	let profile: UserProfile = {
		id: '',
		userId: '',
		firstName: '',
		lastName: '',
		bio: '',
		avatar: '',
		website: '',
		location: '',
		socialLinks: {},
		publicProfile: false,
		createdAt: '',
		updatedAt: ''
	};

	$: if (!profile.socialLinks) profile.socialLinks = {};

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
			const data = await userProfilesClient.getProfile();
			profile = data;
		} catch (err: any) {
			console.warn('Failed to load profile, using auth data:', err);
			// Use data from auth store if endpoint not available
			profile.firstName = $user?.firstName || '';
			profile.lastName = $user?.lastName || '';
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
			await userProfilesClient.updateProfile(profile);
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

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
			<p class="mt-2 text-gray-600">Manage your profile information</p>
		</div>
		<button
			on:click={toggleEdit}
			class="flex items-center gap-2 rounded-lg {isEditing
				? 'bg-gray-200 text-gray-900'
				: 'bg-blue-600 text-white'} px-4 py-2 font-medium transition-opacity hover:opacity-90"
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
		<div class="py-12 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-4 text-gray-600">Loading profile...</p>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Basic Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="firstName" class="mb-1 block text-sm font-medium text-gray-700">
							First Name
						</label>
						<input
							id="firstName"
							type="text"
							bind:value={profile.firstName}
							disabled={!isEditing}
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						/>
					</div>

					<div>
						<label for="lastName" class="mb-1 block text-sm font-medium text-gray-700">
							Last Name
						</label>
						<input
							id="lastName"
							type="text"
							bind:value={profile.lastName}
							disabled={!isEditing}
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> Email </label>
						<input
							id="email"
							type="email"
							value={$user?.email}
							disabled
							class="w-full cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900"
						/>
						<p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
					</div>
				</div>
			</div>

			<!-- Contact Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Contact Information</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<!-- Phone field removed: not present in backend UserProfile -->
					</div>

					<div>
						<label for="location" class="mb-1 block text-sm font-medium text-gray-700">
							Location
						</label>
						<input
							id="location"
							type="text"
							bind:value={profile.location}
							disabled={!isEditing}
							placeholder="e.g., San Francisco, CA"
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						/>
					</div>

					<div class="md:col-span-2">
						<label for="bio" class="mb-1 block text-sm font-medium text-gray-700"> Bio </label>
						<textarea
							id="bio"
							bind:value={profile.bio}
							disabled={!isEditing}
							placeholder="Tell us about yourself"
							rows="3"
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						></textarea>
					</div>
				</div>
			</div>

			<!-- Social Links -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Social Links</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="website" class="mb-1 block text-sm font-medium text-gray-700">
							Website
						</label>
						<input
							id="website"
							type="url"
							bind:value={profile.website}
							disabled={!isEditing}
							placeholder="https://example.com"
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						/>
					</div>

					<div>
						<label for="github" class="mb-1 block text-sm font-medium text-gray-700">
							GitHub
						</label>
						<input
							id="github"
							type="url"
							bind:value={github}
							on:input={updateSocialLinks}
							disabled={!isEditing}
							placeholder="https://github.com/username"
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						/>
					</div>

					<div>
						<label for="linkedin" class="mb-1 block text-sm font-medium text-gray-700">
							LinkedIn
						</label>
						<input
							id="linkedin"
							type="url"
							bind:value={linkedin}
							on:input={updateSocialLinks}
							disabled={!isEditing}
							placeholder="https://linkedin.com/in/username"
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
						/>
					</div>

					<div>
						<label for="twitter" class="mb-1 block text-sm font-medium text-gray-700">
							Twitter
						</label>
						<input
							id="twitter"
							type="url"
							bind:value={twitter}
							on:input={updateSocialLinks}
							disabled={!isEditing}
							placeholder="https://twitter.com/username"
							class={`{isEditing ? 'border-gray-300 focus:ring-blue-600' : 'border-gray-200 cursor-default'} w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-900 text-gray-900 focus:ring-2 focus:outline-none`}
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
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						<Save size={20} />
						{saving ? 'Saving...' : 'Save Profile'}
					</button>
					<button
						on:click={toggleEdit}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50"
					>
						Cancel
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>
