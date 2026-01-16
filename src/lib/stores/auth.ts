import { writable, derived, type Readable } from 'svelte/store';
import { authClient, tokenCookies, type User } from '$lib/api/auth';

/**
 * Auth Store
 * Manages authentication state including user data and token status
 */

// Core state
const user = writable<User | null>(null);
const isLoading = writable(false);
const error = writable<string | null>(null);

/**
 * Derived store to check if user is authenticated
 */
export const isAuthenticated: Readable<boolean> = derived(user, ($user) => $user !== null);

/**
 * Derived store to check if tokens exist
 */
export const hasTokens: Readable<boolean> = derived(user, () => !!tokenCookies.getAccessToken());

/**
 * Initialize auth state from tokens
 */
export async function initializeAuth(): Promise<void> {
	const token = tokenCookies.getAccessToken();

	if (!token) {
		user.set(null);
		return;
	}

	try {
		isLoading.set(true);
		error.set(null);

		const currentUser = await authClient.getCurrentUser();
		user.set(currentUser);
	} catch (err) {
		// Token might be expired or invalid
		tokenCookies.clearTokens();
		user.set(null);
		error.set('Failed to verify authentication');
	} finally {
		isLoading.set(false);
	}
}

/**
 * Login with credentials
 */
export async function login(email: string, password: string): Promise<void> {
	try {
		isLoading.set(true);
		error.set(null);

		const authData = await authClient.login({ email, password });
		user.set(authData.user);
	} catch (err: any) {
		error.set(err.response?.data?.message || 'Login failed');
		throw err;
	} finally {
		isLoading.set(false);
	}
}

/**
 * Register new user
 */
export async function register(
	email: string,
	password: string,
	username: string,
	firstName?: string,
	lastName?: string
): Promise<void> {
	try {
		isLoading.set(true);
		error.set(null);

		const authData = await authClient.register({
			email,
			password,
			username,
			firstName,
			lastName
		});
		user.set(authData.user);
	} catch (err: any) {
		error.set(err.response?.data?.message || 'Registration failed');
		throw err;
	} finally {
		isLoading.set(false);
	}
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
	try {
		isLoading.set(true);
		error.set(null);

		await authClient.logout();
		user.set(null);
	} catch (err: any) {
		error.set(err.message || 'Logout failed');
		throw err;
	} finally {
		isLoading.set(false);
	}
}

/**
 * Refresh current user data
 */
export async function refreshUser(): Promise<void> {
	try {
		isLoading.set(true);
		error.set(null);

		const currentUser = await authClient.getCurrentUser();
		user.set(currentUser);
	} catch (err: any) {
		error.set(err.response?.data?.message || 'Failed to refresh user');
		throw err;
	} finally {
		isLoading.set(false);
	}
}

/**
 * Update user password
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
	try {
		isLoading.set(true);
		error.set(null);

		await authClient.changePassword({ oldPassword, newPassword });
	} catch (err: any) {
		error.set(err.response?.data?.message || 'Failed to change password');
		throw err;
	} finally {
		isLoading.set(false);
	}
}

/**
 * Clear auth state (used for logout or error scenarios)
 */
export function clearAuth(): void {
	user.set(null);
	tokenCookies.clearTokens();
	error.set(null);
}

/**
 * Export stores
 */
export { user, isLoading, error };
