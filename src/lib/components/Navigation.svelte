<script lang="ts">
	import { Menu, X, LogOut, Settings } from 'lucide-svelte';
	import { sidebarCollapsed, toggleSidebar, toggleMobileSidebar, openMobileSidebar } from '$lib/stores/sidebar';
	import { isAuthenticated, user } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/api/auth';

	let showProfileMenu = false;
	let isMobile = false;

	// Detect mobile on mount
	$: if (typeof window !== 'undefined') {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}

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

<nav class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40">
	<div class="flex items-center justify-between h-full px-4">
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
				class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
				aria-label="Toggle navigation"
			>
				{#if isMobile && $sidebarCollapsed}
					<Menu class="w-5 h-5 text-slate-700" />
				{:else if isMobile}
					<X class="w-5 h-5 text-slate-700" />
				{:else}
					<Menu class="w-5 h-5 text-slate-700" />
				{/if}
			</button>

			<div class="hidden md:flex items-center">
				<span class="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
					Woragis
				</span>
			</div>
		</div>

		<!-- Right section: User Profile + Settings -->
		{#if $isAuthenticated}
			<div class="flex items-center gap-2 relative">
				<!-- Settings Icon -->
				<a
					href="/settings/preferences"
					class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
					aria-label="Settings"
				>
					<Settings class="w-5 h-5 text-slate-600" />
				</a>

				<!-- Profile Menu -->
				<button
					on:click={() => (showProfileMenu = !showProfileMenu)}
					class="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
					aria-label="User menu"
					aria-haspopup="true"
					aria-expanded={showProfileMenu}
				>
					{#if $user?.profile?.avatar}
						<img
							src={$user.profile.avatar}
							alt={$user.first_name}
							class="w-8 h-8 rounded-full"
						/>
					{:else}
						<div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
							<span class="text-xs font-semibold text-indigo-600">
								{$user?.first_name?.charAt(0) ?? 'U'}
							</span>
						</div>
					{/if}
					<span class="hidden sm:inline text-sm font-medium text-slate-700">
						{$user?.first_name ?? 'User'}
					</span>
				</button>

				<!-- Dropdown Menu -->
				{#if showProfileMenu}
					<div
						class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
						role="menu"
					>
						<button
							on:click={handleProfile}
							class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
							role="menuitem"
						>
							View Profile
						</button>
						<button
							on:click={handleSettings}
							class="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
							role="menuitem"
						>
							Settings
						</button>
						<hr class="my-1 border-slate-200" />
						<button
							on:click={handleLogout}
							class="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 text-sm flex items-center gap-2 transition-colors"
							role="menuitem"
						>
							<LogOut class="w-4 h-4" />
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
