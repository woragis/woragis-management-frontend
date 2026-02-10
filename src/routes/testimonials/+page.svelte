<script lang="ts">
	import { onMount } from 'svelte';
	import { testimonialsClient } from '$lib/api/testimonials';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Testimonial, PaginatedApiResponse } from '$lib/api/types';
	import { Trash2, Plus, Star } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let testimonials: Testimonial[] = [];
	let newTestimonial = {
		clientName: '',
		clientTitle: '',
		company: '',
		content: '',
		rating: 5,
		isPublic: true
	};
	let showForm = false;
	let creating = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadTestimonials();
	});

	async function loadTestimonials() {
		loading = true;
		error = null;

		try {
			const response: PaginatedApiResponse<Testimonial> =
				await testimonialsClient.listTestimonials();
			testimonials = response.data;
		} catch (err: any) {
			error = err.message || 'Failed to load testimonials';
			console.error('Error loading testimonials:', err);
		} finally {
			loading = false;
		}
	}

	async function toggleForm() {
		showForm = !showForm;

		if (showForm) {
			try {
				await csrfTokenService.fetchCSRFToken();
			} catch (err) {
				console.error('Failed to fetch CSRF token:', err);
			}
		}
	}

	async function createTestimonial() {
		if (!newTestimonial.clientName || !newTestimonial.content) {
			error = 'Please fill in client name and content';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await testimonialsClient.createTestimonial(newTestimonial);
			testimonials = [created, ...testimonials];
			newTestimonial = {
				clientName: '',
				clientTitle: '',
				company: '',
				content: '',
				rating: 5,
				isPublic: true
			};
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create testimonial';
			console.error('Error creating testimonial:', err);
		} finally {
			creating = false;
		}
	}

	async function deleteTestimonial(id: string) {
		if (!confirm('Are you sure you want to delete this testimonial?')) {
			return;
		}

		try {
			await testimonialsClient.deleteTestimonial(id);
			testimonials = testimonials.filter((t) => t.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete testimonial';
			console.error('Error deleting testimonial:', err);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Testimonials</h1>
				<p class="mt-2 text-gray-600">Collect and display social proof</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				<Plus size={20} />
				New Testimonial
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">New Testimonial</h2>
			<form
				on:submit|preventDefault={createTestimonial}
				class="grid grid-cols-1 gap-4 md:grid-cols-2"
			>
				<div>
					<label for="clientName" class="mb-1 block text-sm font-medium text-gray-700">
						Client Name *
					</label>
					<input
						id="clientName"
						type="text"
						bind:value={newTestimonial.clientName}
						placeholder="e.g., John Doe"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="rating" class="mb-1 block text-sm font-medium text-gray-700">Rating</label>
					<select
						id="rating"
						bind:value={newTestimonial.rating}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					>
						<option value={5}>★★★★★ (5 stars)</option>
						<option value={4}>★★★★ (4 stars)</option>
						<option value={3}>★★★ (3 stars)</option>
						<option value={2}>★★ (2 stars)</option>
						<option value={1}>★ (1 star)</option>
					</select>
				</div>

				<div>
					<label for="clientTitle" class="mb-1 block text-sm font-medium text-gray-700"
						>Client Title</label
					>
					<input
						id="clientTitle"
						type="text"
						bind:value={newTestimonial.clientTitle}
						placeholder="e.g., CEO"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="company" class="mb-1 block text-sm font-medium text-gray-700">Company</label>
					<input
						id="company"
						type="text"
						bind:value={newTestimonial.company}
						placeholder="e.g., Tech Company"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div class="md:col-span-2">
					<label for="content" class="mb-1 block text-sm font-medium text-gray-700">
						Testimonial *
					</label>
					<textarea
						id="content"
						bind:value={newTestimonial.content}
						placeholder="What did you appreciate about working together?"
						rows="4"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					></textarea>
				</div>

				<div class="flex gap-2 md:col-span-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create Testimonial'}
					</button>
					<button
						type="button"
						on:click={toggleForm}
						class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if loading}
		<div class="py-12 text-center">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
			<p class="mt-4 text-gray-600">Loading testimonials...</p>
		</div>
	{:else if testimonials.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">
				No testimonials yet. Add your first testimonial to build social proof.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each testimonials as testimonial (testimonial.id)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="mb-3 flex items-start justify-between">
						<div class="flex gap-1">
							{#each Array(testimonial.rating) as _}
								<Star size={16} class="fill-yellow-400 text-yellow-400" />
							{/each}
						</div>
						<button
							on:click={() => deleteTestimonial(testimonial.id)}
							class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
							title="Delete testimonial"
						>
							<Trash2 size={16} />
						</button>
					</div>

					<p class="mb-4 text-gray-700">"{testimonial.content}"</p>

					<div class="border-t border-gray-200 pt-4">
						<p class="font-semibold text-gray-900">{testimonial.clientName}</p>
						{#if testimonial.clientTitle || testimonial.company}
							<p class="text-sm text-gray-600">
								{testimonial.clientTitle}
								{testimonial.clientTitle && testimonial.company ? '•' : ''}
								{testimonial.company}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
