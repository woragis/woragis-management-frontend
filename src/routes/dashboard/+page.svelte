<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isAuthenticated } from '$lib/stores/auth';
	import { dashboardClient } from '$lib/api/dashboard';
	import { goto } from '$app/navigation';
	import { TrendingUp, Lightbulb, Users, Zap } from 'lucide-svelte';
	import type { DashboardStats } from '$lib/api/types';

	let loading = true;
	let error: string | null = null;
	let stats: DashboardStats = {
		totalProjects: 0,
		activeProjects: 0,
		completedProjects: 0,
		totalIdeas: 0,
		totalClients: 0,
		recentTransactions: [],
		upcomingTasks: []
	};

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadDashboard();
	});

	async function loadDashboard() {
		loading = true;
		error = null;

		try {
			try {
				const data = await dashboardClient.getDashboardStats();
				stats = data;
			} catch (err) {
				console.warn('Dashboard endpoint not available, using default data:', err);
				stats = {
					totalProjects: 0,
					activeProjects: 0,
					completedProjects: 0,
					totalIdeas: 0,
					totalClients: 0,
					recentTransactions: [],
					upcomingTasks: []
				};
			}
		} catch (err: any) {
			error = err.message || 'Failed to load dashboard';
			console.error('Error loading dashboard:', err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
		<p class="mt-2 text-gray-600">Welcome back, {$user?.firstName || 'User'}</p>
	</div>

	{#if loading}
		<div class="py-12 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-4 text-gray-600">Loading dashboard...</p>
		</div>
	{:else}
		<!-- Stats Grid -->
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			<!-- Projects Card -->
			<div
				class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm font-medium tracking-wide text-gray-600 uppercase">Projects</p>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
					>
						<TrendingUp size={20} />
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
				<p class="mt-2 text-sm text-gray-600">
					<span class="font-medium text-green-600">{stats.activeProjects} active</span>
					<span class="text-gray-400">•</span>
					<span class="font-medium text-blue-600">{stats.completedProjects} completed</span>
				</p>
			</div>

			<!-- Ideas Card -->
			<div
				class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm font-medium tracking-wide text-gray-600 uppercase">Ideas</p>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600"
					>
						<Lightbulb size={20} />
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900">{stats.totalIdeas}</p>
				<p class="mt-2 text-sm text-gray-600">Concepts captured</p>
			</div>

			<!-- Clients Card -->
			<div
				class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm font-medium tracking-wide text-gray-600 uppercase">Clients</p>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"
					>
						<Users size={20} />
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
				<p class="mt-2 text-sm text-gray-600">Active relationships</p>
			</div>

			<!-- Performance Card -->
			<div
				class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
			>
				<div class="mb-4 flex items-center justify-between">
					<p class="text-sm font-medium tracking-wide text-gray-600 uppercase">Performance</p>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"
					>
						<Zap size={20} />
					</div>
				</div>
				<p class="text-3xl font-bold text-gray-900">
					{stats.totalProjects > 0
						? Math.round((stats.completedProjects / stats.totalProjects) * 100)
						: 0}%
				</p>
				<p class="mt-2 text-sm text-gray-600">Completion rate</p>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<a
					href="/projects"
					class="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
				>
					+ New Project
				</a>
				<a
					href="/ideas"
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
				>
					+ New Idea
				</a>
				<a
					href="/clients"
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
				>
					+ New Client
				</a>
				<a
					href="/scheduler"
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
				>
					Plan Task
				</a>
			</div>
		</div>

		{#if error}
			<div class="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
		{/if}
	{/if}
</div>
