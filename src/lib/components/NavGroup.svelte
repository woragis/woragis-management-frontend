<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { toggleGroup, isGroupCollapsed } from '$lib/stores/sidebar';
	import NavItem from './NavItem.svelte';
	import type { NavGroup } from '$lib/types/navigation';
	import * as LucideIcons from 'lucide-svelte';

	export let group: NavGroup;

	$: collapsed = isGroupCollapsed(group.id);
	$: IconComponent = (LucideIcons as any)[group.icon] || LucideIcons.Folder;
</script>

<div class="nav-group">
	<!-- Group Header (Collapsible) -->
	<button
		on:click={() => toggleGroup(group.id)}
		class="group-header"
		class:group-header-collapsed={$collapsed}
		role="button"
		aria-expanded={!$collapsed}
	>
		<span class="group-label">
			{group.label}
		</span>
		<ChevronDown class="group-chevron" size={16} />
	</button>

	<!-- Group Items (Collapsible) -->
	<div class="group-items" class:group-items-collapsed={$collapsed} role="group">
		{#each group.items as item (item.id)}
			<NavItem {item} isSubItem={true} level={1} />
			{#if item.children}
				<div class="sub-group">
					{#each item.children as subItem (subItem.id)}
						<NavItem item={subItem} isSubItem={true} level={2} />
					{/each}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.nav-group {
		display: flex;
		flex-direction: column;
		margin-top: 8px;
	}

	.group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.group-header:hover {
		color: #475569;
		background-color: rgba(241, 245, 249, 0.5);
	}

	.group-label {
		flex: 1;
		text-align: left;
	}

	.group-chevron {
		flex-shrink: 0;
		transition: transform 0.2s ease;
		color: inherit;
	}

	.group-header-collapsed .group-chevron {
		transform: rotate(-90deg);
	}

	.group-items {
		display: flex;
		flex-direction: column;
		max-height: 500px;
		transition: max-height 0.3s ease, opacity 0.2s ease;
		opacity: 1;
	}

	.group-items-collapsed {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
	}

	.sub-group {
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 1023px) {
		.group-header {
			padding: 8px 12px;
		}
	}
</style>
