<script lang="ts">
	import { X, LogOut, Settings } from 'lucide-svelte';
	import { sidebarCollapsed, sidebarOpen, toggleMobileSidebar, closeMobileSidebar } from '$lib/stores/sidebar';
	import { authClient } from '$lib/api/auth';
	import { goto } from '$app/navigation';
	import NavItem from './NavItem.svelte';
	import NavGroup from './NavGroup.svelte';
	import { navigationConfig } from '$lib/config/navigation';
	import type { NavItem as NavItemType } from '$lib/types/navigation';

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

	// Close sidebar on escape key
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isMobile && $sidebarOpen) {
			closeMobileSidebar();
		}
	}

	async function handleLogout() {
		try {
			await authClient.logout();
			await goto('/auth/login');
		} catch (err) {
			console.error('Logout failed:', err);
		}
	}

	function handleFooterItemClick(item: NavItemType) {
		goto(item.route);
		closeMobileSidebar();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Mobile Overlay -->
{#if isMobile && $sidebarOpen}
	<div
		class="sidebar-overlay"
		on:click={closeMobileSidebar}
		role="presentation"
		aria-hidden="true"
	/>
{/if}

<!-- Sidebar -->
<aside
	class="sidebar"
	class:sidebar-collapsed={$sidebarCollapsed}
	class:sidebar-mobile={isMobile}
	class:sidebar-open={$sidebarOpen}
	role="navigation"
	aria-label="Main navigation"
>
	<!-- Header -->
	<div class="sidebar-header">
		<div class="logo">
			<span class="logo-icon">W</span>
			<span class="logo-text">Woragis</span>
		</div>
		{#if isMobile}
			<button
				on:click={closeMobileSidebar}
				class="close-button"
				aria-label="Close sidebar"
			>
				<X size={20} />
			</button>
		{/if}
	</div>

	<!-- Main Navigation -->
	<nav class="sidebar-nav" role="menu">
		<!-- Primary Items -->
		<div class="nav-section">
			{#each navigationConfig.primaryItems as item (item.id)}
				<NavItem {item} />
			{/each}
		</div>

		<!-- Groups -->
		<div class="nav-section">
			{#each navigationConfig.groups as group (group.id)}
				<NavGroup {group} />
			{/each}
		</div>
	</nav>

	<!-- Footer -->
	<div class="sidebar-footer">
		<!-- Footer Items -->
		{#each navigationConfig.footerItems as item (item.id)}
			<button
				on:click={() => handleFooterItemClick(item)}
				class="footer-item"
				role="menuitem"
			>
				<div class="footer-item-icon">
					<!-- Icon placeholder -->
				</div>
				<span class="footer-item-label">{item.label}</span>
			</button>
		{/each}

		<!-- Logout -->
		<button
			on:click={handleLogout}
			class="footer-item footer-item-logout"
			role="menuitem"
		>
			<LogOut size={20} />
			<span class="footer-item-label">Logout</span>
		</button>
	</div>
</aside>

<style>
	.sidebar {
		position: fixed;
		left: 0;
		top: 64px;
		bottom: 0;
		width: 250px;
		height: calc(100vh - 64px);
		background-color: #f8fafc;
		border-right: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		z-index: 30;
		transition: width 0.3s ease-in-out;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.sidebar-collapsed {
		width: 70px;
	}

	@media (max-width: 767px) {
		.sidebar.sidebar-mobile {
			position: fixed;
			top: 64px;
			left: 0;
			right: 0;
			width: 250px;
			transform: translateX(-100%);
			transition: transform 0.3s ease;
			z-index: 1000;
			box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
		}

		.sidebar.sidebar-mobile.sidebar-open {
			transform: translateX(0);
		}
	}

	.sidebar-overlay {
		position: fixed;
		top: 64px;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0);
		transition: background-color 0.3s ease;
		z-index: 999;
		animation: fadeIn 0.3s ease forwards;
	}

	@keyframes fadeIn {
		to {
			background-color: rgba(0, 0, 0, 0.5);
		}
	}

	/* Header */
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #e2e8f0;
		height: 60px;
		flex-shrink: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 12px;
		font-weight: 700;
		color: #1e293b;
		flex: 1;
		min-width: 0;
		transition: gap 0.3s ease;
	}

	.sidebar-collapsed .logo {
		gap: 0;
		justify-content: center;
	}

	.logo-icon {
		width: 32px;
		height: 32px;
		background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 800;
		font-size: 16px;
		flex-shrink: 0;
	}

	.logo-text {
		white-space: nowrap;
		font-size: 16px;
		transition: opacity 0.2s ease-in 0.1s;
	}

	.sidebar-collapsed .logo-text {
		display: none;
	}

	.close-button {
		display: none;
		padding: 8px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: #64748b;
		transition: color 0.15s ease;
	}

	.close-button:hover {
		color: #1e293b;
	}

	@media (max-width: 767px) {
		.close-button {
			display: block;
		}
	}

	/* Navigation */
	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 12px 0;
	}

	.nav-section {
		display: flex;
		flex-direction: column;
		padding: 0 0 8px 0;
		border-bottom: 1px solid #e2e8f0;
		margin: 8px 0;
	}

	.nav-section:last-child {
		border-bottom: none;
	}

	/* Footer */
	.sidebar-footer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px 0;
		border-top: 1px solid #e2e8f0;
		flex-shrink: 0;
		height: 60px;
	}

	.footer-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: transparent;
		border: none;
		color: #64748b;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		overflow: hidden;
	}

	.footer-item:hover {
		background-color: #f1f5f9;
		color: #1e293b;
	}

	.footer-item-logout {
		color: #dc2626;
	}

	.footer-item-logout:hover {
		background-color: #fee2e2;
		color: #991b1b;
	}

	.footer-item-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.footer-item-label {
		flex: 1;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.sidebar-collapsed .footer-item-label {
		display: none;
	}

	/* Scrollbar Styling */
	.sidebar-nav::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar-nav::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-nav::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}

	.sidebar-nav::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}

	/* Layout adjustment */
	:global(.main-content) {
		margin-left: 250px;
		transition: margin-left 0.3s ease-in-out;
	}

	:global(.main-content.sidebar-collapsed) {
		margin-left: 70px;
	}

	@media (max-width: 767px) {
		:global(.main-content) {
			margin-left: 0;
		}

		:global(.main-content.sidebar-collapsed) {
			margin-left: 0;
		}
	}
</style>
