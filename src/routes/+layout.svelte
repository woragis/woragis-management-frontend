<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { isAuthenticated, initializeAuth } from '$lib/stores/auth';
	import MainLayout from '$lib/layouts/MainLayout.svelte';

	let { children } = $props();

	// Initialize auth store on app load
	onMount(async () => {
		await initializeAuth();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<MainLayout>
	{@render children()}
</MainLayout>

