import { writable, derived } from 'svelte/store';

// Sidebar state
export const sidebarCollapsed = writable(false);
export const sidebarOpen = writable(true); // Mobile: sidebar open/closed

// Group collapse states
export const groupCollapsedState = writable<Record<string, boolean>>({
	career: true,
	planning: false,
	account: true
});

// Load group states from localStorage
if (typeof window !== 'undefined') {
	const stored = localStorage.getItem('sidebarGroups');
	if (stored) {
		try {
			groupCollapsedState.set(JSON.parse(stored));
		} catch (e) {
			console.error('Failed to load sidebar groups state:', e);
		}
	}
}

// Subscribe to changes and save to localStorage
groupCollapsedState.subscribe((value) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('sidebarGroups', JSON.stringify(value));
	}
});

// Load collapsed state from localStorage
if (typeof window !== 'undefined') {
	const stored = localStorage.getItem('sidebarCollapsed');
	if (stored) {
		sidebarCollapsed.set(stored === 'true');
	}
}

sidebarCollapsed.subscribe((value) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem('sidebarCollapsed', value.toString());
	}
});

// Derived store for checking if a group is collapsed
export function isGroupCollapsed(groupId: string) {
	return derived(groupCollapsedState, ($state) => $state[groupId] ?? false);
}

// Toggle functions
export function toggleSidebar() {
	sidebarCollapsed.update((v) => !v);
}

export function toggleGroup(groupId: string) {
	groupCollapsedState.update((state) => ({
		...state,
		[groupId]: !(state[groupId] ?? false)
	}));
}

export function closeMobileSidebar() {
	if (typeof window !== 'undefined' && window.innerWidth < 768) {
		sidebarOpen.set(false);
	}
}

export function openMobileSidebar() {
	sidebarOpen.set(true);
}

export function toggleMobileSidebar() {
	sidebarOpen.update((v) => !v);
}
