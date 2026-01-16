<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/stores/auth';
	import type { LoginRequest } from '$lib/api/auth';

	let email = '';
	let password = '';
	let loading = false;
	let error = '';

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		error = '';
		loading = true;

		try {
			await login(email, password);
			
			// Redirect to dashboard
			await goto('/dashboard');
		} catch (err: any) {
			error = err.response?.data?.message || err.message || 'Unable to sign in. Check your credentials and try again.';
			console.error('Login error:', err);
		} finally {
			loading = false;
		}
	};
</script>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-md">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Sign In</h1>
			<p class="text-gray-600">Sign in to access the management dashboard</p>
		</div>

		<form class="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm" on:submit={handleSubmit}>
			{#if error}
				<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
			{/if}

			<div class="space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email
					</label>
					<input
						id="email"
						type="email"
						placeholder="you@example.com"
						bind:value={email}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-1">
						Password
					</label>
					<input
						id="password"
						type="password"
						placeholder="********"
						bind:value={password}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if loading}
					Signing in...
				{:else}
					Sign In
				{/if}
			</button>

			<div class="text-center text-sm text-gray-600">
				<p>
					Don't have an account?
					<a href="/auth/register" class="text-blue-600 hover:underline">Create one</a>
				</p>
			</div>
		</form>
	</div>
</div>
