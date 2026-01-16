/**
 * Token storage utilities using browser cookies
 * Manages access and refresh tokens with proper security settings
 */

import { browser } from '$app/environment';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Cookie utilities for storing and retrieving tokens
 */
export const tokenCookies = {
	/**
	 * Get the access token from cookie
	 */
	getAccessToken: (): string | null => {
		if (!browser) return null;

		const cookieStr = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${ACCESS_TOKEN_KEY}=`));

		return cookieStr ? cookieStr.split('=')[1] : null;
	},

	/**
	 * Set the access token in cookie
	 */
	setAccessToken: (token: string, expirationHours = 24): void => {
		if (!browser) return;

		const date = new Date();
		date.setTime(date.getTime() + expirationHours * 60 * 60 * 1000);
		const expires = `expires=${date.toUTCString()}`;

		document.cookie = `${ACCESS_TOKEN_KEY}=${token}; ${expires}; path=/; SameSite=Lax`;
	},

	/**
	 * Get the refresh token from cookie
	 */
	getRefreshToken: (): string | null => {
		if (!browser) return null;

		const cookieStr = document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${REFRESH_TOKEN_KEY}=`));

		return cookieStr ? cookieStr.split('=')[1] : null;
	},

	/**
	 * Set the refresh token in cookie
	 */
	setRefreshToken: (token: string, expirationDays = 30): void => {
		if (!browser) return;

		const date = new Date();
		date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
		const expires = `expires=${date.toUTCString()}`;

		document.cookie = `${REFRESH_TOKEN_KEY}=${token}; ${expires}; path=/; SameSite=Lax`;
	},

	/**
	 * Clear both tokens
	 */
	clearTokens: (): void => {
		if (!browser) return;

		document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
		document.cookie = `${REFRESH_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	},

	/**
	 * Clear only the access token
	 */
	clearAccessToken: (): void => {
		if (!browser) return;

		document.cookie = `${ACCESS_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	}
};
