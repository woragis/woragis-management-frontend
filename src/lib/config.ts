import { env } from '$env/dynamic/public';

/**
 * API Configuration
 * Requires PUBLIC_MANAGEMENT_API_URL and PUBLIC_AUTH_API_URL to be set in environment variables
 * Uses $env/dynamic/public which is available at runtime and won't fail if variables don't exist
 */

const getManagementApiUrl = (): string => {
	// Access the env variables at runtime with fallback to development default
	const baseUrl = env.PUBLIC_MANAGEMENT_API_URL || 'http://localhost:3012';

	// Debug: Log the URL being used (only in development)
	if (import.meta.env.DEV) {
		console.log('[Config] PUBLIC_MANAGEMENT_API_URL from env:', env.PUBLIC_MANAGEMENT_API_URL);
		console.log('[Config] Using management API URL:', baseUrl);
	}

	// Remove trailing slash if present
	const cleanUrl = baseUrl.replace(/\/$/, '');

	// Add /api/v1 prefix as all routes are under /api/v1
	return `${cleanUrl}/api/v1`;
};

const getAuthApiUrl = (): string => {
	// Access the env variables at runtime with fallback to development default
	const baseUrl = env.PUBLIC_AUTH_API_URL || 'http://localhost:3010';

	// Debug: Log the URL being used (only in development)
	if (import.meta.env.DEV) {
		console.log('[Config] PUBLIC_AUTH_API_URL from env:', env.PUBLIC_AUTH_API_URL);
		console.log('[Config] Using auth API URL:', baseUrl);
	}

	// Remove trailing slash if present
	const cleanUrl = baseUrl.replace(/\/$/, '');

	// Add /api/v1 prefix as all routes are under /api/v1
	return `${cleanUrl}/api/v1`;
};

export const config = {
	managementApiUrl: getManagementApiUrl(),
	authApiUrl: getAuthApiUrl()
} as const;
