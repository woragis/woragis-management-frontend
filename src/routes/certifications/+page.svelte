<script lang="ts">
	import { onMount } from 'svelte';
	import { certificationsClient } from '$lib/api/certifications';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Certification, PaginatedApiResponse } from '$lib/api/types';
	import { Trash2, Plus, ExternalLink } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let certifications: Certification[] = [];
	let newCertification = {
		name: '',
		issuer: '',
		issueDate: '',
		expiryDate: '',
		credentialUrl: '',
		credentialId: ''
	};
	let showForm = false;
	let creating = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadCertifications();
	});

	async function loadCertifications() {
		loading = true;
		error = null;

		try {
			const response: PaginatedApiResponse<Certification> =
				await certificationsClient.listCertifications();
			certifications = response.data;
		} catch (err: any) {
			error = err.message || 'Failed to load certifications';
			console.error('Error loading certifications:', err);
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

	async function createCertification() {
		if (!newCertification.name || !newCertification.issuer || !newCertification.issueDate) {
			error = 'Please fill in name, issuer, and issue date';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await certificationsClient.createCertification(newCertification);
			certifications = [created, ...certifications];
			newCertification = {
				name: '',
				issuer: '',
				issueDate: '',
				expiryDate: '',
				credentialUrl: '',
				credentialId: ''
			};
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create certification';
			console.error('Error creating certification:', err);
		} finally {
			creating = false;
		}
	}

	async function deleteCertification(id: string) {
		if (!confirm('Are you sure you want to delete this certification?')) {
			return;
		}

		try {
			await certificationsClient.deleteCertification(id);
			certifications = certifications.filter((c) => c.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete certification';
			console.error('Error deleting certification:', err);
		}
	}

	function isExpired(expiryDate: string | undefined): boolean {
		if (!expiryDate) return false;
		return new Date(expiryDate) < new Date();
	}

	function isExpiringSoon(expiryDate: string | undefined): boolean {
		if (!expiryDate) return false;
		const now = new Date();
		const expiry = new Date(expiryDate);
		const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
		return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Certifications</h1>
				<p class="mt-2 text-gray-600">Showcase your professional credentials</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				<Plus size={20} />
				New Certification
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">New Certification</h2>
			<form
				on:submit|preventDefault={createCertification}
				class="grid grid-cols-1 gap-4 md:grid-cols-2"
			>
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">
						Certification Name *
					</label>
					<input
						id="name"
						type="text"
						bind:value={newCertification.name}
						placeholder="e.g., AWS Solutions Architect"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="issuer" class="mb-1 block text-sm font-medium text-gray-700">
						Issuer *
					</label>
					<input
						id="issuer"
						type="text"
						bind:value={newCertification.issuer}
						placeholder="e.g., Amazon Web Services"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="issueDate" class="mb-1 block text-sm font-medium text-gray-700">
						Issue Date *
					</label>
					<input
						id="issueDate"
						type="date"
						bind:value={newCertification.issueDate}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="expiryDate" class="mb-1 block text-sm font-medium text-gray-700">
						Expiry Date
					</label>
					<input
						id="expiryDate"
						type="date"
						bind:value={newCertification.expiryDate}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="credentialId" class="mb-1 block text-sm font-medium text-gray-700">
						Credential ID
					</label>
					<input
						id="credentialId"
						type="text"
						bind:value={newCertification.credentialId}
						placeholder="e.g., Unique credential identifier"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="credentialUrl" class="mb-1 block text-sm font-medium text-gray-700">
						Credential URL
					</label>
					<input
						id="credentialUrl"
						type="url"
						bind:value={newCertification.credentialUrl}
						placeholder="https://verify.example.com"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div class="flex gap-2 md:col-span-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create Certification'}
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
			<p class="mt-4 text-gray-600">Loading certifications...</p>
		</div>
	{:else if certifications.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">
				No certifications added yet. Add your first certification to showcase your credentials.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each certifications as cert (cert.id)}
				<div
					class="rounded-lg border {isExpired(cert.expiryDate)
						? 'border-red-200 bg-red-50'
						: isExpiringSoon(cert.expiryDate)
							? 'border-yellow-200 bg-yellow-50'
							: 'border-gray-200'} p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="mb-3 flex items-start justify-between">
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-gray-900">{cert.name}</h3>
							<p class="text-gray-600">{cert.issuer}</p>
						</div>
						<button
							on:click={() => deleteCertification(cert.id)}
							class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
							title="Delete certification"
						>
							<Trash2 size={16} />
						</button>
					</div>

					<div class="mb-4 space-y-2 text-sm text-gray-700">
						<p>
							<span class="font-medium">Issue Date:</span>
							{new Date(cert.issueDate).toLocaleDateString()}
						</p>
						{#if cert.expiryDate}
							<p
								class={isExpired(cert.expiryDate)
									? 'font-medium text-red-700'
									: isExpiringSoon(cert.expiryDate)
										? 'font-medium text-yellow-700'
										: ''}
							>
								<span class="font-medium">Expiry Date:</span>
								{new Date(cert.expiryDate).toLocaleDateString()}
								{#if isExpired(cert.expiryDate)}
									<span
										class="ml-2 inline-block rounded-full bg-red-200 px-2 py-1 text-xs font-bold text-red-800"
									>
										Expired
									</span>
								{:else if isExpiringSoon(cert.expiryDate)}
									<span
										class="ml-2 inline-block rounded-full bg-yellow-200 px-2 py-1 text-xs font-bold text-yellow-800"
									>
										Expiring Soon
									</span>
								{/if}
							</p>
						{/if}
						{#if cert.credentialId}
							<p>
								<span class="font-medium">Credential ID:</span>
								<span class="font-mono text-gray-600">{cert.credentialId}</span>
							</p>
						{/if}
					</div>

					{#if cert.credentialUrl}
						<a
							href={cert.credentialUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
						>
							View Credential
							<ExternalLink size={14} />
						</a>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
