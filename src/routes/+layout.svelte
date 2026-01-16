<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { isAuthenticated, user, initializeAuth, logout } from '$lib/stores/auth';

	let { children } = $props();

	// Initialize auth store on app load
	onMount(async () => {
		await initializeAuth();
	});

	async function handleLogout() {
		try {
			await logout();
			await goto('/auth/login');
		} catch (err) {
			console.error('Logout error:', err);
			await goto('/auth/login');
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if $isAuthenticated}
	<nav class="border-b border-gray-200 bg-white shadow-sm">
		<div class="container mx-auto px-4">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center gap-6">
					<a href="/projects" class="text-xl font-bold text-gray-900 hover:text-blue-600">
						Management
					</a>
					<div class="flex gap-4">
						<a href="/dashboard" class="text-sm text-gray-700 hover:text-blue-600">
							Dashboard
						</a>
						<a href="/projects" class="text-sm text-gray-700 hover:text-blue-600">
							Projects
						</a>
						<a href="/ideas" class="text-sm text-gray-700 hover:text-blue-600">
							Ideas
						</a>
						<a href="/clients" class="text-sm text-gray-700 hover:text-blue-600">
							Clients
						</a>
						<a href="/auth/profile" class="text-sm text-gray-700 hover:text-blue-600">
							Profile
						</a>
					</div>
				</div>
				<div class="flex items-center gap-4">
					{#if $user}
						<span class="text-sm text-gray-600">
							{$user.firstName} {$user.lastName}
						</span>
					{/if}
					<button
						onclick={handleLogout}
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	</nav>
{/if}

{@render children()}
