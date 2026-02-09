<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { sidebarCollapsed } from '$lib/stores/sidebar';
	import { isAuthenticated } from '$lib/stores/auth';
</script>

{#if $isAuthenticated}
	<Navigation />
	<Sidebar />
{/if}

<main class="main-content" class:sidebar-collapsed={$sidebarCollapsed}>
	<slot />
</main>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			'Helvetica Neue',
			Arial,
			sans-serif;
		background-color: #ffffff;
		color: #1e293b;
	}

	:global(body) {
		padding-top: 64px;
	}

	.main-content {
		min-height: calc(100vh - 64px);
		margin-left: 250px;
		transition: margin-left 0.3s ease-in-out;
		background-color: #ffffff;
	}

	.main-content.sidebar-collapsed {
		margin-left: 70px;
	}

	@media (max-width: 767px) {
		.main-content {
			margin-left: 0;
		}

		.main-content.sidebar-collapsed {
			margin-left: 0;
		}
	}
</style>
