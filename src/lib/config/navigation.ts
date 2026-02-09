import type { NavigationConfig } from '$lib/types/navigation';

export const navigationConfig: NavigationConfig = {
	primaryItems: [
		{
			id: 'dashboard',
			label: 'Dashboard',
			route: '/dashboard',
			icon: 'LayoutDashboard'
		},
		{
			id: 'projects',
			label: 'Projects',
			route: '/projects',
			icon: 'FolderOpen'
		},
		{
			id: 'ideas',
			label: 'Ideas',
			route: '/ideas',
			icon: 'Lightbulb'
		},
		{
			id: 'clients',
			label: 'Clients',
			route: '/clients',
			icon: 'Users'
		},
		{
			id: 'finances',
			label: 'Finances',
			route: '/finances',
			icon: 'TrendingUp'
		}
	],

	groups: [
		{
			id: 'career',
			label: 'Career Development',
			icon: 'Briefcase',
			collapsed: true,
			items: [
				{
					id: 'experiences',
					label: 'Experiences',
					route: '/experiences',
					icon: 'Award'
				},
				{
					id: 'languages',
					label: 'Languages',
					route: '/languages',
					icon: 'Globe'
				},
				{
					id: 'certifications',
					label: 'Certifications',
					route: '/certifications',
					icon: 'Certificate'
				},
				{
					id: 'testimonials',
					label: 'Testimonials',
					route: '/testimonials',
					icon: 'MessageSquare'
				}
			]
		},
		{
			id: 'planning',
			label: 'Planning & AI',
			icon: 'Calendar',
			collapsed: false,
			items: [
				{
					id: 'scheduler',
					label: 'Scheduler',
					route: '/scheduler',
					icon: 'Clock'
				},
				{
					id: 'chats',
					label: 'Chats',
					route: '/chats',
					icon: 'Zap'
				}
			]
		},
		{
			id: 'account',
			label: 'Account',
			icon: 'User',
			collapsed: true,
			items: [
				{
					id: 'profile',
					label: 'Profile',
					route: '/profile',
					icon: 'UserCircle'
				},
				{
					id: 'settings',
					label: 'Settings',
					route: '/settings',
					icon: 'Settings',
					children: [
						{
							id: 'preferences',
							label: 'Preferences',
							route: '/settings/preferences',
							icon: 'Sliders'
						},
						{
							id: 'api-keys',
							label: 'API Keys',
							route: '/settings/api-keys',
							icon: 'Key'
						}
					]
				}
			]
		}
	],

	footerItems: [
		{
			id: 'help',
			label: 'Help & Support',
			route: '/help',
			icon: 'HelpCircle'
		}
	]
};
