<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/auth';

	async function redirectToApp() {
		if ($isAuthenticated) {
			await goto('/dashboard');
		} else {
			await goto('/auth/login');
		}
	}
</script>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-2xl text-center">
		<h1 class="mb-4 text-4xl font-bold text-gray-900">Management Dashboard</h1>
		<p class="mb-8 text-lg text-gray-600">
			Manage your projects, clients, ideas, and more all in one place.
		</p>
		<button
			onclick={redirectToApp}
			class="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
		>
			{#if $isAuthenticated}
				Go to Dashboard
			{:else}
				Sign In
			{/if}
		</button>
	</div>
</div>
