# Management Frontend

A SvelteKit-based management dashboard frontend fully integrated with the management backend microservice using axios and a professional API client organization pattern.

## ✨ Features

- **Full Backend Integration** - All 12 management service domains integrated
- **Automatic Token Management** - Secure cookie-based authentication with auto-refresh
- **Type Safety** - Complete TypeScript support with comprehensive types
- **Modular Architecture** - 12 independent domain clients with shared infrastructure
- **Production Ready** - Error handling, loading states, and pagination support
- **Developer Friendly** - Clear code organization and extensive documentation

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
echo "PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010" > .env.local

# 3. Start development
npm run dev
```

Visit `http://localhost:5173`

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get running in 5 minutes
- **[INTEGRATION.md](INTEGRATION.md)** - Comprehensive integration guide with examples
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - What was created and coverage
- **[API_CLIENTS_REFERENCE.md](API_CLIENTS_REFERENCE.md)** - Complete API client methods
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - Backend setup and environment config
- **[STRUCTURE.md](STRUCTURE.md)** - Detailed file and directory structure

## 🏗️ Architecture

### API Clients (12 domains)

- **Projects** - Full project management with milestones, kanban, documentation
- **Ideas** - Idea tracking and management
- **Chats** - Conversation management
- **Clients** - Client/contact information
- **Finances** - Financial tracking and reporting
- **Experiences** - Work experience and professional history
- **User Preferences** - User settings and preferences
- **User Profiles** - User profile management
- **API Keys** - API key management
- **Languages** - Language proficiency tracking
- **Scheduler** - Task scheduling and planning
- **Testimonials** - Testimonials management

### Authentication

- Secure cookie-based token storage
- Automatic token refresh on 401
- Login, register, logout functions
- User state management with Svelte stores

## 💻 Usage Examples

### Authentication

```typescript
import { login, logout, isAuthenticated, user } from '$lib';

// Login
await login('user@example.com', 'password');

// Access current user
user.subscribe(u => console.log(u));

// Check authentication status
isAuthenticated.subscribe(auth => console.log(auth));

// Logout
await logout();
```

### Projects

```typescript
import { projectsClient } from '$lib';

// List projects
const { data: projects, meta } = await projectsClient.listProjects(1, 10);

// Create project
const project = await projectsClient.createProject({
  name: 'My Project',
  description: 'Project description',
  status: 'planning'
});

// Update status
await projectsClient.updateStatus(projectId, 'in_progress');

// Add milestone
await projectsClient.createMilestone(projectId, {
  title: 'Release 1.0',
  targetDate: '2024-02-28'
});

// Manage kanban
const board = await projectsClient.getKanbanBoard(projectId);
```

### Any Other Domain

```typescript
import { ideasClient, chatsClient, clientsClient } from '$lib';

// Ideas
const { data: ideas } = await ideasClient.listIdeas(1, 10);
await ideasClient.createIdea({ title: 'Feature idea', priority: 'high' });

// Chats
const { data: chats } = await chatsClient.listChats(1, 10);
await chatsClient.sendMessage(chatId, 'Hello!');

// Clients
const { data: clients } = await clientsClient.listClients(1, 10);
```

## 📁 Project Structure

```
src/lib/
├── config.ts                    # API configuration
├── index.ts                     # Main exports
├── api/
│   ├── utils.ts                # Axios factory & utilities
│   ├── types.ts                # All domain types
│   ├── base-client.ts          # Base CRUD class
│   ├── auth/                   # Auth module
│   └── {projects, ideas, ...}/ # Domain clients (12 total)
└── stores/
    └── auth.ts                 # Auth state management
```

## 🔧 Configuration

### Environment Variables

```env
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010
```

### Backend Services (Reference)

- Management: `http://localhost:3012`
- Auth: `http://localhost:3010`

## 📦 Dependencies

- **axios** (^1.13.2) - HTTP client for API calls
- **svelte** (^5.45.6) - UI framework
- **@sveltejs/kit** (^2.49.1) - Framework
- Standard SvelteKit dev dependencies

## ✅ What's Included

### Core Infrastructure

✅ Axios client factory with interceptors
✅ Base CRUD client class
✅ Comprehensive TypeScript types
✅ Error handling utilities
✅ Token management system

### Authentication

✅ Auth client with login/register/logout
✅ Secure cookie-based token storage
✅ Automatic token refresh
✅ Svelte auth store with derived stores

### Domain Clients

✅ All 12 management service domains
✅ Automatic token inclusion in requests
✅ Pagination support
✅ Error handling and validation

### Documentation

✅ Integration guide (INTEGRATION.md)
✅ Quick start guide (QUICK_START.md)
✅ API reference (API_CLIENTS_REFERENCE.md)
✅ Environment setup (ENVIRONMENT_SETUP.md)
✅ Structure documentation (STRUCTURE.md)

### Examples

✅ Example component (ProjectsExample.svelte)
✅ Usage patterns throughout docs
✅ Component implementation guide

## 🎯 Key Features

### Automatic Token Management

- Tokens stored in secure, httpOnly cookies (server-side)
- Automatically included in all requests
- Automatic refresh on 401 responses
- Seamless user experience

### Type Safety

- Full TypeScript support
- 12+ domain-specific types
- Shared API response types
- Better IDE autocomplete

### Consistent API Pattern

- All clients extend BaseApiClient
- Standard CRUD: create(), list(), getById(), update(), delete()
- Domain-specific methods for complex operations
- Predictable method signatures

### Error Handling

- Consistent error format across all clients
- Axios interceptors for global handling
- getErrorMessage() helper for extraction
- Try-catch ready

### Pagination

- Built-in pagination parameters
- Returns total count and page info
- Easy navigation between pages

## 🚀 Deploying

```bash
# Build production version
npm run build

# Preview production build
npm run preview

# Docker deployment
docker build -t management-frontend .
docker run -p 80:5173 management-frontend
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e

# Run all tests
npm run test
```

## 📝 Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run check
```

## 🔗 Integration Pattern

This frontend follows the same integration pattern as the jobs frontend:

- Modular API clients organized by domain
- Axios for HTTP requests
- Svelte stores for state management
- TypeScript for type safety
- Clear separation of concerns

## 📞 Support

For issues or questions:

1. Check the documentation files (INTEGRATION.md, API_CLIENTS_REFERENCE.md)
2. Review the example component (ProjectsExample.svelte)
3. Check the browser console for error messages
4. Verify environment variables are set correctly

## 📄 License

Part of the Woragis platform.

---

**Created with TypeScript, SvelteKit, and Axios** ✨

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
