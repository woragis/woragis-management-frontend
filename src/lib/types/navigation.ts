/**
 * Navigation and Sidebar Types
 */

export interface NavItem {
	id: string;
	label: string;
	route: string;
	icon: string; // Icon name from Lucide
	badge?: number | 'new';
	children?: NavItem[];
	action?: () => void;
}

export interface NavGroup {
	id: string;
	label: string;
	icon?: string;
	collapsed: boolean;
	items: NavItem[];
}

export interface NavigationConfig {
	groups: NavGroup[];
	primaryItems: NavItem[];
	footerItems: NavItem[];
}

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
}
