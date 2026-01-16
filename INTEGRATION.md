# Management Frontend Integration

Complete integration of the management backend with the frontend using axios and a structured API client organization pattern.

## Project Structure

```
src/lib/
├── config.ts                  # API configuration and URLs
├── index.ts                   # Main exports
│
├── api/
│   ├── utils.ts              # Axios client factory and utilities
│   ├── types.ts              # Comprehensive TypeScript types
│   ├── base-client.ts        # Base class for CRUD operations
│   │
│   ├── auth/
│   │   ├── client.ts         # Auth API client
│   │   ├── cookies.ts        # Token storage utilities
│   │   ├── types.ts          # Auth-specific types
│   │   └── index.ts          # Module exports
│   │
│   ├── projects/
│   │   ├── client.ts         # Projects API client
│   │   └── index.ts          # Module exports
│   │
│   ├── ideas/
│   │   ├── client.ts         # Ideas API client
│   │   └── index.ts          # Module exports
│   │
│   ├── chats/
│   │   ├── client.ts         # Chats API client
│   │   └── index.ts          # Module exports
│   │
│   ├── clients/
│   │   ├── client.ts         # Clients API client
│   │   └── index.ts          # Module exports
│   │
│   ├── finances/
│   │   ├── client.ts         # Finances API client
│   │   └── index.ts          # Module exports
│   │
│   ├── experiences/
│   │   ├── client.ts         # Experiences API client
│   │   └── index.ts          # Module exports
│   │
│   ├── user-preferences/
│   │   ├── client.ts         # User Preferences API client
│   │   └── index.ts          # Module exports
│   │
│   ├── user-profiles/
│   │   ├── client.ts         # User Profiles API client
│   │   └── index.ts          # Module exports
│   │
│   ├── api-keys/
│   │   ├── client.ts         # API Keys client
│   │   └── index.ts          # Module exports
│   │
│   ├── languages/
│   │   ├── client.ts         # Languages API client
│   │   └── index.ts          # Module exports
│   │
│   ├── scheduler/
│   │   ├── client.ts         # Scheduler API client
│   │   └── index.ts          # Module exports
│   │
│   └── testimonials/
│       ├── client.ts         # Testimonials API client
│       └── index.ts          # Module exports
│
└── stores/
    └── auth.ts               # Svelte auth store with login/logout
```

## Configuration

Set environment variables in `.env.local`:

```env
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010
```

## Usage Examples

### Authentication

```typescript
import { login, logout, isAuthenticated, user } from '$lib';

// Login
await login('user@example.com', 'password');

// Access user data
let currentUser;
user.subscribe(u => currentUser = u);

// Check if authenticated
let authenticated;
isAuthenticated.subscribe(a => authenticated = a);

// Logout
await logout();
```

### Working with Projects

```typescript
import { projectsClient } from '$lib';

// Create project
const project = await projectsClient.createProject({
	name: 'My Project',
	description: 'Project description',
	status: 'planning',
});

// List projects
const { data: projects, meta } = await projectsClient.listProjects(1, 10);

// Get project by slug
const project = await projectsClient.getProjectBySlug('my-project');

// Update project status
await projectsClient.updateStatus(projectId, 'in_progress');

// Add milestone
const milestone = await projectsClient.createMilestone(projectId, {
	title: 'Alpha Release',
	targetDate: '2024-02-28',
});

// Get Kanban board
const board = await projectsClient.getKanbanBoard(projectId);

// Add technology
const tech = await projectsClient.createTechnology(projectId, {
	name: 'TypeScript',
	category: 'Language',
});
```

### Working with Ideas

```typescript
import { ideasClient } from '$lib';

// Create idea
const idea = await ideasClient.createIdea({
	title: 'New Feature',
	description: 'Feature description',
	priority: 'high',
});

// List ideas
const { data: ideas, meta } = await ideasClient.listIdeas(1, 10);

// Update idea
await ideasClient.updateIdea(ideaId, {
	status: 'active',
	priority: 'medium',
});

// Delete idea
await ideasClient.deleteIdea(ideaId);
```

### Working with Chats

```typescript
import { chatsClient } from '$lib';

// Create chat conversation
const chat = await chatsClient.createChat({
	title: 'Project Discussion',
	topic: 'planning',
});

// Send message
const message = await chatsClient.sendMessage(chatId, 'Hello!');

// Get chat history
const messages = await chatsClient.getMessages(chatId, 50);
```

### Working with Finances

```typescript
import { financesClient } from '$lib';

// Create financial entry
const entry = await financesClient.createEntry({
	type: 'income',
	category: 'Freelance',
	amount: 1000,
	currency: 'USD',
	description: 'Client project payment',
});

// List entries
const { data: entries, meta } = await financesClient.listEntries(1, 10);

// Get financial report
const report = await financesClient.getReport('2024-01');

// Get entries by category
const categoryEntries = await financesClient.getByCategory('Freelance');
```

### Working with User Profile

```typescript
import { userProfilesClient } from '$lib';

// Get user profile
const profile = await userProfilesClient.getProfile();

// Update profile
await userProfilesClient.updateProfile({
	firstName: 'John',
	lastName: 'Doe',
	bio: 'Software Developer',
	avatar: 'https://...',
});

// Get public profile
const publicProfile = await userProfilesClient.getPublicProfile(userId);
```

### Working with User Preferences

```typescript
import { userPreferencesClient } from '$lib';

// Get preferences
const prefs = await userPreferencesClient.getPreferences();

// Update preferences
await userPreferencesClient.updatePreferences({
	theme: 'dark',
	language: 'en',
	emailNotifications: true,
});
```

### Error Handling

```typescript
import { getErrorMessage } from '$lib';
import type { AxiosError } from 'axios';

try {
	await projectsClient.createProject(data);
} catch (error) {
	const message = getErrorMessage(error);
	console.error('Failed to create project:', message);
}
```

## API Client Features

### Automatic Token Management

- Tokens are stored in secure cookies
- Automatically included in all requests via Authorization header
- Automatic token refresh on 401 responses (for auth client)

### Error Handling

- Consistent error responses across all clients
- Axios interceptors handle authentication errors
- Helper function `getErrorMessage()` extracts error details

### Pagination

- List endpoints support page and limit parameters
- Returns paginated response with metadata
- Example: `{ data: [...], meta: { total, page, limit, totalPages } }`

### Type Safety

- Full TypeScript support with comprehensive type definitions
- Separate types for each domain
- Shared types like `ApiResponse` and `PaginatedApiResponse`

## Key Features

### Auth Store (`$lib/stores/auth`)

- User state management
- Loading states for async operations
- Error tracking
- Derived stores for `isAuthenticated` and `hasTokens`
- Functions: `initializeAuth()`, `login()`, `register()`, `logout()`, `refreshUser()`, `changePassword()`, `clearAuth()`

### Config (`$lib/config`)

- Centralized API URL configuration
- Environment variable support with fallbacks
- Development logging

### Base API Client

- Reusable CRUD operations
- Standard methods: `create()`, `list()`, `getById()`, `update()`, `delete()`
- Extended by domain-specific clients

### API Utilities

- `createApiClient()` - Factory for axios instances
- `getErrorMessage()` - Extract error messages consistently
- Common type definitions

## Setting Up Authentication

In your layout or root component:

```typescript
<script>
	import { initializeAuth } from '$lib';
	import { onMount } from 'svelte';

	onMount(async () => {
		// Initialize auth from stored token
		await initializeAuth();
	});
</script>
```

## Error Handling Example

```typescript
<script>
	import { user, isLoading, error, login } from '$lib';

	let email = '';
	let password = '';

	async function handleLogin() {
		try {
			await login(email, password);
			// Navigate to dashboard
		} catch (err) {
			// Error is automatically set in the error store
		}
	}
</script>

<form on:submit|preventDefault={handleLogin}>
	<input bind:value={email} type="email" placeholder="Email" />
	<input bind:value={password} type="password" placeholder="Password" />
	<button disabled={$isLoading} type="submit">
		{$isLoading ? 'Logging in...' : 'Login'}
	</button>
	{#if $error}
		<p class="error">{$error}</p>
	{/if}
</form>
```

## Available API Clients

1. **projectsClient** - Comprehensive project management with milestones, kanban, documentation, architecture diagrams, etc.
2. **ideasClient** - Store and manage ideas
3. **chatsClient** - Conversation management and messaging
4. **clientsClient** - Client/contact management
5. **financesClient** - Financial tracking and reporting
6. **experiencesClient** - Work experience and professional history
7. **userPreferencesClient** - User settings and preferences
8. **userProfilesClient** - User profile management
9. **apiKeysClient** - API key management
10. **languagesClient** - Language proficiency tracking
11. **schedulerClient** - Task scheduling and planning
12. **testimonialsClient** - Client testimonials management
13. **authClient** - Authentication and user management (exported from auth module)

## Environment Setup

### Development

```bash
npm install
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012 npm run dev
```

### Build

```bash
npm run build
```

## Notes

- All API calls require authentication (access token in cookie)
- Tokens are managed automatically via the auth client
- The auth store provides state management for Svelte components
- All API responses follow a consistent format with `data` and `meta` fields
- Error handling is consistent across all clients using axios interceptors
