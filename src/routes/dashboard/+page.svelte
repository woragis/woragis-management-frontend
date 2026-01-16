<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		loading = false;
	});
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-2 text-gray-600">Welcome back, {$user?.firstName || 'User'}</p>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
			<p class="mt-4 text-gray-600">Loading dashboard...</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<a href="/projects" class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Projects</p>
						<p class="mt-2 text-2xl font-bold text-gray-900">-</p>
					</div>
					<div class="text-3xl text-blue-600">📁</div>
				</div>
			</a>

			<a href="/ideas" class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Ideas</p>
						<p class="mt-2 text-2xl font-bold text-gray-900">-</p>
					</div>
					<div class="text-3xl text-green-600">💡</div>
				</div>
			</a>

			<a href="/clients" class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Clients</p>
						<p class="mt-2 text-2xl font-bold text-gray-900">-</p>
					</div>
					<div class="text-3xl text-purple-600">👥</div>
				</div>
			</a>

			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Profile</p>
						<p class="mt-2 text-2xl font-bold text-gray-900">✓</p>
					</div>
					<div class="text-3xl text-orange-600">⚙️</div>
				</div>
			</div>
		</div>

		{#if error}
			<div class="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
		{/if}
	{/if}
</div>
