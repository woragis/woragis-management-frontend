<script lang="ts">
	import { goto } from '$app/navigation';
	import { register } from '$lib/stores/auth';

	let firstName = '';
	let lastName = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	const handleSubmit = async (event: SubmitEvent) => {
		event.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;

		try {
			await register(email, password, email, firstName, lastName);
			
			// Redirect to login
			await goto('/auth/login?message=Account created successfully. Please sign in.');
		} catch (err: any) {
			error = err.response?.data?.message || err.message || 'Unable to create account. Please try again.';
			console.error('Register error:', err);
		} finally {
			loading = false;
		}
	};
</script>

<div class="container mx-auto px-4 py-16">
	<div class="mx-auto max-w-md">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Create Account</h1>
			<p class="text-gray-600">Sign up to get started</p>
		</div>

		<form class="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm" on:submit={handleSubmit}>
			{#if error}
				<div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
			{/if}

			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
							First Name
						</label>
						<input
							id="firstName"
							type="text"
							placeholder="John"
							bind:value={firstName}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
							Last Name
						</label>
						<input
							id="lastName"
							type="text"
							placeholder="Doe"
							bind:value={lastName}
							required
							class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						/>
					</div>
				</div>

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
						placeholder="••••••••"
						bind:value={password}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						bind:value={confirmPassword}
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
					Creating account...
				{:else}
					Create Account
				{/if}
			</button>

			<div class="text-center text-sm text-gray-600">
				<p>
					Already have an account?
					<a href="/auth/login" class="text-blue-600 hover:underline">Sign in</a>
				</p>
			</div>
		</form>
	</div>
</div>
