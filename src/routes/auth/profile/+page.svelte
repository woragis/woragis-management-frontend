<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/api/auth';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let loading = false;
	let saving = false;
	let error = '';
	let success = '';
	let firstName = '';
	let lastName = '';
	let email = '';
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		loading = true;
		try {
			const profile = await authClient.getCurrentUser();
			firstName = profile.firstName || '';
			lastName = profile.lastName || '';
			email = profile.email || '';
		} catch (err: any) {
			error = 'Failed to load profile';
			console.error('Profile load error:', err);
		} finally {
			loading = false;
		}
	});

	const handleUpdateProfile = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';
		success = '';
		saving = true;

		try {
			await authClient.updateProfile({
				firstName: firstName,
				lastName: lastName
			});
			success = 'Profile updated successfully';
		} catch (err: any) {
			error = err.response?.data?.message || 'Failed to update profile';
			console.error('Update error:', err);
		} finally {
			saving = false;
		}
	};

	const handleChangePassword = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';
		success = '';

		if (newPassword !== confirmPassword) {
			error = 'New passwords do not match';
			return;
		}

		saving = true;

		try {
			await authClient.changePassword({
				oldPassword: currentPassword,
				newPassword: newPassword
			});
			success = 'Password changed successfully';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (err: any) {
			error = err.response?.data?.message || 'Failed to change password';
			console.error('Password change error:', err);
		} finally {
			saving = false;
		}
	};
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
			<p class="mt-4 text-gray-600">Loading profile...</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
			<!-- Profile Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-6 text-xl font-semibold text-gray-900">Profile Information</h2>

				{#if error}
					<div class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
				{/if}

				{#if success}
					<div class="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">{success}</div>
				{/if}

				<form class="space-y-4" on:submit={handleUpdateProfile}>
					<div>
						<label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
							First Name
						</label>
						<input
							id="firstName"
							type="text"
							bind:value={firstName}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
							Last Name
						</label>
						<input
							id="lastName"
							type="text"
							bind:value={lastName}
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
							Email (Read-only)
						</label>
						<input
							id="email"
							type="email"
							value={email}
							disabled
							class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
						/>
					</div>

					<button
						type="submit"
						disabled={saving}
						class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if saving}
							Saving...
						{:else}
							Save Changes
						{/if}
					</button>
				</form>
			</div>

			<!-- Change Password -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-6 text-xl font-semibold text-gray-900">Change Password</h2>

				<form class="space-y-4" on:submit={handleChangePassword}>
					<div>
						<label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
							Current Password
						</label>
						<input
							id="currentPassword"
							type="password"
							bind:value={currentPassword}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
							New Password
						</label>
						<input
							id="newPassword"
							type="password"
							bind:value={newPassword}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>

					<button
						type="submit"
						disabled={saving}
						class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if saving}
							Updating...
						{:else}
							Update Password
						{/if}
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
