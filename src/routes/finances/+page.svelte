<script lang="ts">
	import { onMount } from 'svelte';
	import { financesClient } from '$lib/api/finances';
	import { csrfTokenService } from '$lib/api/csrf';
	import { isAuthenticated } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import type { Transaction, PaginatedApiResponse } from '$lib/api/types';
	import { Trash2, Plus } from 'lucide-svelte';

	let loading = true;
	let error: string | null = null;
	let transactions: Transaction[] = [];
	let newTransaction: Transaction = {
		id: '',
		userId: '',
		description: '',
		amount: 0,
		type: 'expense',
		category: 'general',
		date: new Date().toISOString().split('T')[0],
		createdAt: '',
		updatedAt: ''
	};
	let showForm = false;
	let creating = false;

	onMount(async () => {
		if (!$isAuthenticated) {
			await goto('/auth/login');
			return;
		}

		await loadTransactions();
	});

	async function loadTransactions() {
		loading = true;
		error = null;

		try {
			const response: PaginatedApiResponse<Transaction> = await financesClient.listTransactions(
				1,
				100
			);
			transactions = response.data || [];
		} catch (err: any) {
			error = err.message || 'Failed to load transactions';
			console.error('Error loading transactions:', err);
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

	async function createTransaction() {
		if (!newTransaction.description || newTransaction.amount <= 0) {
			error = 'Please fill in all required fields';
			return;
		}

		creating = true;
		error = null;

		try {
			const created = await financesClient.createTransaction(newTransaction);
			transactions = [created, ...transactions];
			newTransaction = {
				id: '',
				userId: '',
				description: '',
				amount: 0,
				type: 'expense',
				category: 'general',
				date: new Date().toISOString().split('T')[0],
				createdAt: '',
				updatedAt: ''
			};
			showForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create transaction';
			console.error('Error creating transaction:', err);
		} finally {
			creating = false;
		}
	}

	async function deleteTransaction(id: string) {
		if (!confirm('Are you sure you want to delete this transaction?')) {
			return;
		}

		try {
			await financesClient.deleteTransaction(id);
			transactions = transactions.filter((t) => t.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete transaction';
			console.error('Error deleting transaction:', err);
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Finances</h1>
				<p class="mt-2 text-gray-600">Track your income and expenses</p>
			</div>
			<button
				on:click={toggleForm}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				<Plus size={20} />
				New Transaction
			</button>
		</div>
	</div>

	{#if error}
		<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
	{/if}

	{#if showForm}
		<div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">New Transaction</h2>
			<form
				on:submit|preventDefault={createTransaction}
				class="grid grid-cols-1 gap-4 md:grid-cols-2"
			>
				<div>
					<label for="description" class="mb-1 block text-sm font-medium text-gray-700">
						Description
					</label>
					<input
						id="description"
						type="text"
						bind:value={newTransaction.description}
						placeholder="e.g., Office supplies"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="amount" class="mb-1 block text-sm font-medium text-gray-700">Amount</label>
					<input
						id="amount"
						type="number"
						bind:value={newTransaction.amount}
						step="0.01"
						placeholder="0.00"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="type" class="mb-1 block text-sm font-medium text-gray-700">Type</label>
					<select
						id="type"
						bind:value={newTransaction.type}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					>
						<option value="income">Income</option>
						<option value="expense">Expense</option>
					</select>
				</div>

				<div>
					<label for="category" class="mb-1 block text-sm font-medium text-gray-700">
						Category
					</label>
					<input
						id="category"
						type="text"
						bind:value={newTransaction.category}
						placeholder="e.g., general"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div>
					<label for="date" class="mb-1 block text-sm font-medium text-gray-700">Date</label>
					<input
						id="date"
						type="date"
						bind:value={newTransaction.date}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
					/>
				</div>

				<div class="flex gap-2 md:col-span-2">
					<button
						type="submit"
						disabled={creating}
						class="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						{creating ? 'Creating...' : 'Create Transaction'}
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
			<p class="mt-4 text-gray-600">Loading transactions...</p>
		</div>
	{:else if transactions.length === 0}
		<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
			<p class="text-gray-600">
				No transactions yet. Create your first transaction to get started.
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
			<table class="w-full">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50">
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Category</th>
						<th class="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
						<th class="px-6 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
						<th class="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each transactions as transaction (transaction.id)}
						<tr class="border-b border-gray-200 hover:bg-gray-50">
							<td class="px-6 py-3 text-sm text-gray-600">
								{new Date(transaction.date).toLocaleDateString()}
							</td>
							<td class="px-6 py-3 text-sm text-gray-900">{transaction.description}</td>
							<td class="px-6 py-3 text-sm text-gray-600">{transaction.category}</td>
							<td class="px-6 py-3 text-sm">
								<span
									class={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
										transaction.type === 'income'
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									}`}
								>
									{transaction.type}
								</span>
							</td>
							<td
								class={`px-6 py-3 text-right text-sm font-medium ${
									transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
								}`}
							>
								{transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
							</td>
							<td class="px-6 py-3 text-center">
								<button
									on:click={() => deleteTransaction(transaction.id)}
									class="inline-flex items-center gap-2 rounded px-2 py-1 text-red-600 transition-colors hover:bg-red-50"
									title="Delete transaction"
								>
									<Trash2 size={16} />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
