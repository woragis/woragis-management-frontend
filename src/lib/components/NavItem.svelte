<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarCollapsed, closeMobileSidebar } from '$lib/stores/sidebar';
	import { goto } from '$app/navigation';
	import * as LucideIcons from 'lucide-svelte';
	import type { NavItem } from '$lib/types/navigation';

	export let item: NavItem;
	export let isSubItem = false;
	export let level = 1;

	let showTooltip = false;
	let tooltipTimer: ReturnType<typeof setTimeout>;

	$: isActive =
		$page.url.pathname === item.route || $page.url.pathname.startsWith(item.route + '/');

	// Get icon component
	$: IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Link;

	function handleNavigate() {
		goto(item.route);
		closeMobileSidebar();
	}

	function handleMouseEnter() {
		if ($sidebarCollapsed && !isSubItem) {
			tooltipTimer = setTimeout(() => {
				showTooltip = true;
			}, 300);
		}
	}

	function handleMouseLeave() {
		clearTimeout(tooltipTimer);
		showTooltip = false;
	}
</script>

<button
	on:click={handleNavigate}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	class="nav-item"
	class:nav-item-active={isActive}
	class:nav-item-sub={isSubItem}
	class:level-2={level === 2}
	role="menuitem"
	aria-current={isActive ? 'page' : undefined}
>
	<!-- Icon -->
	<div class="nav-item-icon">
		<svelte:component this={IconComponent} size={20} />
	</div>

	<!-- Label (shown unless collapsed) -->
	{#if !$sidebarCollapsed || isSubItem}
		<span class="nav-item-label">
			{item.label}
		</span>
	{/if}

	<!-- Badge -->
	{#if item.badge}
		<div class="nav-item-badge">
			{#if item.badge === 'new'}
				<span class="rounded bg-indigo-500 px-1.5 py-0.5 text-xs text-white">New</span>
			{:else}
				<span class="rounded bg-indigo-500 px-1.5 py-0.5 text-xs text-white">{item.badge}</span>
			{/if}
		</div>
	{/if}

	<!-- Tooltip (desktop collapsed) -->
	{#if showTooltip}
		<div class="nav-tooltip" role="tooltip">
			{item.label}
		</div>
	{/if}
</button>

<style>
	.nav-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		font-size: 14px;
		font-weight: 500;
		color: #475569;
		background: transparent;
		border: none;
		border-left: 3px solid transparent;
		cursor: pointer;
		transition: all 0.15s ease;
		position: relative;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
	}

	.nav-item:hover {
		background-color: #f1f5f9;
		color: #0f172a;
	}

	.nav-item-active {
		background-color: #e0e7ff;
		color: #4f46e5;
		border-left-color: #4f46e5;
	}

	.nav-item-active:hover {
		background-color: #e0e7ff;
	}

	.nav-item-sub {
		padding-left: 32px;
		font-size: 13px;
		font-weight: 400;
	}

	.level-2 {
		padding-left: 48px;
	}

	.nav-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		color: inherit;
	}

	.nav-item-label {
		flex: 1;
		text-overflow: ellipsis;
		overflow: hidden;
		transition: opacity 0.2s ease-in 0.1s;
	}

	.nav-item-badge {
		flex-shrink: 0;
		margin-left: 8px;
	}

	.nav-tooltip {
		position: absolute;
		left: calc(100% + 8px);
		top: 50%;
		transform: translateY(-50%);
		background-color: #1e293b;
		color: #ffffff;
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 4px;
		z-index: 1001;
		white-space: nowrap;
		pointer-events: none;
	}

	.nav-tooltip::before {
		content: '';
		position: absolute;
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		border: 4px solid transparent;
		border-right-color: #1e293b;
	}

	@media (max-width: 1023px) {
		.nav-item {
			padding: 12px;
			gap: 8px;
		}

		.nav-item-sub {
			padding-left: 32px;
		}

		.level-2 {
			padding-left: 48px;
		}
	}
</style>
