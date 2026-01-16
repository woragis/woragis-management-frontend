# Quick Start Guide

Get the management frontend integrated and running in 5 minutes.

## Installation

```bash
# 1. Install dependencies (including axios)
npm install

# 2. Create .env.local file
cat > .env.local << EOF
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010
EOF

# 3. Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Basic Setup in Your Layout

Create or update `src/routes/+layout.svelte`:

```svelte
<script>
	import { initializeAuth } from '$lib';
	import { onMount } from 'svelte';

	onMount(async () => {
		// Initialize authentication on app start
		await initializeAuth();
	});
</script>

<slot />
```

## Create a Login Page

Create `src/routes/login/+page.svelte`:

```svelte
<script>
	import { login, isLoading, error } from '$lib';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';

	async function handleLogin() {
		try {
			await login(email, password);
			goto('/dashboard');
		} catch (err) {
			// Error is already in the error store
		}
	}
</script>

<form on:submit|preventDefault={handleLogin}>
	<h1>Login</h1>
	{#if $error}
		<p class="error">{$error}</p>
	{/if}
	<input bind:value={email} type="email" placeholder="Email" required />
	<input bind:value={password} type="password" placeholder="Password" required />
	<button disabled={$isLoading} type="submit">
		{$isLoading ? 'Logging in...' : 'Login'}
	</button>
</form>

<style>
	form {
		max-width: 400px;
		margin: 50px auto;
		padding: 20px;
	}

	input {
		width: 100%;
		padding: 10px;
		margin: 10px 0;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 14px;
	}

	button {
		width: 100%;
		padding: 10px;
		background: #0066cc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
	}

	button:hover:not(:disabled) {
		background: #0052a3;
	}

	.error {
		color: #c33;
		background: #fee;
		padding: 10px;
		border-radius: 4px;
		margin-bottom: 10px;
	}
</style>
```

## Create a Projects Page

Create `src/routes/projects/+page.svelte`:

```svelte
<script>
	import { projectsClient, isAuthenticated } from '$lib';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let projects = [];
	let loading = false;
	let error = '';
	let newProjectName = '';

	onMount(async () => {
		// Redirect to login if not authenticated
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}

		await loadProjects();
	});

	async function loadProjects() {
		try {
			loading = true;
			const { data } = await projectsClient.listProjects(1, 10);
			projects = data;
		} catch (err) {
			error = 'Failed to load projects';
		} finally {
			loading = false;
		}
	}

	async function createProject() {
		if (!newProjectName.trim()) return;

		try {
			loading = true;
			error = '';
			await projectsClient.createProject({
				name: newProjectName,
				status: 'planning',
			});
			newProjectName = '';
			await loadProjects();
		} catch (err) {
			error = 'Failed to create project';
		} finally {
			loading = false;
		}
	}
</script>

{#if !$isAuthenticated}
	<p>Redirecting to login...</p>
{:else}
	<div class="container">
		<h1>Projects</h1>

		{#if error}
			<div class="alert">{error}</div>
		{/if}

		<div class="create-form">
			<input
				bind:value={newProjectName}
				type="text"
				placeholder="New project name"
				disabled={loading}
			/>
			<button on:click={createProject} disabled={loading || !newProjectName.trim()}>
				{loading ? 'Creating...' : 'Create'}
			</button>
		</div>

		{#if loading && projects.length === 0}
			<p>Loading projects...</p>
		{:else if projects.length === 0}
			<p>No projects yet</p>
		{:else}
			<ul>
				{#each projects as project (project.id)}
					<li>
						<strong>{project.name}</strong>
						<span class="status">{project.status}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.create-form {
		display: flex;
		gap: 10px;
		margin: 20px 0;
	}

	input {
		flex: 1;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	button {
		padding: 10px 20px;
		background: #0066cc;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: #0052a3;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		padding: 15px;
		border: 1px solid #ddd;
		margin: 10px 0;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.status {
		background: #e3f2fd;
		color: #1976d2;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
	}

	.alert {
		background: #fee;
		color: #c33;
		padding: 10px;
		border-radius: 4px;
		margin: 10px 0;
	}
</style>
```

## Most Common Imports

```typescript
// Auth
import { 
  login, logout, user, isAuthenticated,
  initializeAuth, register, refreshUser
} from '$lib';

// Clients (pick what you need)
import { 
  projectsClient, ideasClient, chatsClient,
  clientsClient, financesClient, experiencesClient,
  userProfilesClient, apiKeysClient, languagesClient,
  schedulerClient, testimonialsClient
} from '$lib';

// Types
import type { Project, Idea, Chat, User } from '$lib';

// Auth specifically
import { authClient, tokenCookies } from '$lib';
```

## Common Operations

### Login
```typescript
await login('user@example.com', 'password');
```

### Create Project
```typescript
const project = await projectsClient.createProject({
  name: 'My Project',
  description: 'Description',
  status: 'planning'
});
```

### List Projects
```typescript
const { data: projects, meta } = await projectsClient.listProjects(1, 10);
```

### Update Project Status
```typescript
await projectsClient.updateStatus(projectId, 'in_progress');
```

### Delete Project
```typescript
await projectsClient.deleteProject(projectId);
```

### Check Authentication
```typescript
import { isAuthenticated, user } from '$lib';

// In component:
if ($isAuthenticated) {
  console.log('Logged in as:', $user.email);
}
```

## File Structure Created

```
src/lib/
├── config.ts                    ✅
├── index.ts                     ✅
├── api/
│   ├── utils.ts                ✅
│   ├── types.ts                ✅
│   ├── base-client.ts          ✅
│   ├── auth/                   ✅ (3 files)
│   └── {12 domains}/           ✅ (24 files)
└── stores/
    └── auth.ts                 ✅
```

## Environment Variables

```env
# Required
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010
```

## Troubleshooting

### "Cannot find module" errors
- Run `npm install`
- Clear node_modules: `rm -rf node_modules && npm install`

### CORS errors
- Ensure backend is running
- Check API URLs match backend
- Backend should have CORS enabled

### 401 Unauthorized
- Check if token is in cookies (browser DevTools → Application → Cookies)
- Try logging in again
- Clear cookies and retry

### Port conflicts
- Change frontend port: `npm run dev -- --port 5174`
- Change backend port in docker-compose.yml

## Next Steps

1. ✅ Install dependencies
2. ✅ Set environment variables
3. ✅ Initialize auth in layout
4. ✅ Create login page
5. ✅ Create your pages using clients
6. 📚 See INTEGRATION.md for more examples
7. 📖 See API_CLIENTS_REFERENCE.md for all methods

## Full Documentation Files

- **INTEGRATION.md** - Comprehensive guide with examples
- **INTEGRATION_SUMMARY.md** - What was created
- **ENVIRONMENT_SETUP.md** - Environment & backend setup
- **API_CLIENTS_REFERENCE.md** - Complete API reference
- **STRUCTURE.md** - Detailed file structure

## Support

All API clients follow the same pattern:
```typescript
// Import
import { domainClient } from '$lib';

// Use
const result = await domainClient.method(params);
```

Every client has automatic:
- Token management
- Error handling
- Pagination support (where applicable)
- TypeScript support

Happy coding! 🚀
