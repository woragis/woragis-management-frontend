<script lang="ts">
	import { Menu, X, LogOut, Settings } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import {
		sidebarCollapsed,
		toggleSidebar,
		toggleMobileSidebar,
		openMobileSidebar
	} from '$lib/stores/sidebar';
	import { isAuthenticated, user } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/api/auth';

	let showProfileMenu = false;
	let isMobile = false;

	// Detect mobile on mount
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	});

	async function handleLogout() {
		try {
			await authClient.logout();
			await goto('/auth/login');
		} catch (err) {
			console.error('Logout failed:', err);
		}
	}

	function handleSettings() {
		showProfileMenu = false;
		goto('/settings/preferences');
	}

	function handleProfile() {
		showProfileMenu = false;
		goto('/profile');
	}
</script>

<nav class="fixed top-0 right-0 left-0 z-40 h-16 border-b border-slate-200 bg-white">
	<div class="flex h-full items-center justify-between px-4">
		<!-- Left section: Hamburger + Logo -->
		<div class="flex items-center gap-4">
			<button
				on:click={() => {
					if (isMobile) {
						toggleMobileSidebar();
					} else {
						toggleSidebar();
					}
				}}
				class="rounded-lg p-2 transition-colors hover:bg-slate-100"
				aria-label="Toggle navigation"
			>
				{#if isMobile && $sidebarCollapsed}
					<Menu class="h-5 w-5 text-slate-700" />
				{:else if isMobile}
					<X class="h-5 w-5 text-slate-700" />
				{:else}
					<Menu class="h-5 w-5 text-slate-700" />
				{/if}
			</button>

			<div class="hidden items-center md:flex">
				<span
					class="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-lg font-bold text-transparent"
				>
					Woragis
				</span>
			</div>
		</div>

		<!-- Right section: User Profile + Settings -->
		{#if $isAuthenticated}
			<div class="relative flex items-center gap-2">
				<!-- Settings Icon -->
				<a
					href="/settings/preferences"
					class="rounded-lg p-2 transition-colors hover:bg-slate-100"
					aria-label="Settings"
				>
					<Settings class="h-5 w-5 text-slate-600" />
				</a>

				<!-- Profile Menu -->
				<button
					on:click={() => (showProfileMenu = !showProfileMenu)}
					class="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100"
					aria-label="User menu"
					aria-haspopup="true"
					aria-expanded={showProfileMenu}
				>
					{#if $user?.profilePicture}
						<img
							src={$user.profilePicture}
							alt={$user.firstName ?? $user.username}
							class="h-8 w-8 rounded-full"
						/>
					{:else}
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
							<span class="text-xs font-semibold text-indigo-600">
								{$user?.firstName?.charAt(0) ?? $user?.username?.charAt(0) ?? 'U'}
							</span>
						</div>
					{/if}
					<span class="hidden text-sm font-medium text-slate-700 sm:inline">
						{$user?.firstName ?? $user?.username ?? 'User'}
					</span>
				</button>

				<!-- Dropdown Menu -->
				{#if showProfileMenu}
					<div
						class="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
						role="menu"
					>
						<button
							on:click={handleProfile}
							class="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
							role="menuitem"
						>
							View Profile
						</button>
						<button
							on:click={handleSettings}
							class="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
							role="menuitem"
						>
							Settings
						</button>
						<hr class="my-1 border-slate-200" />
						<button
							on:click={handleLogout}
							class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-50"
							role="menuitem"
						>
							<LogOut class="h-4 w-4" />
							Logout
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</nav>

<style>
	:global(body) {
		padding-top: 64px;
	}
</style>
