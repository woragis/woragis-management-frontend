# Frontend Library Structure

Complete file structure for the management frontend integration.

## Directory Tree

```
frontend/
├── src/
│   ├── app.d.ts
│   ├── app.html
│   ├── demo.spec.ts
│   │
│   ├── lib/
│   │   ├── config.ts                          # API configuration
│   │   ├── index.ts                           # Main library exports
│   │   │
│   │   ├── api/
│   │   │   ├── utils.ts                       # Axios factory & utilities
│   │   │   ├── types.ts                       # All domain types
│   │   │   ├── base-client.ts                 # Base CRUD class
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── client.ts                  # Auth API client
│   │   │   │   ├── cookies.ts                 # Token storage
│   │   │   │   ├── types.ts                   # Auth types
│   │   │   │   └── index.ts                   # Auth exports
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── client.ts                  # Projects API client
│   │   │   │   └── index.ts                   # Projects exports
│   │   │   │
│   │   │   ├── ideas/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── chats/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── clients/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── finances/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── experiences/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── user-preferences/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── user-profiles/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── api-keys/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── languages/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── scheduler/
│   │   │   │   ├── client.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── testimonials/
│   │   │       ├── client.ts
│   │   │       └── index.ts
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   └── ProjectsExample.svelte          # Example component
│   │   │
│   │   └── stores/
│   │       └── auth.ts                         # Auth state store
│   │
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── layout.css
│   │   └── page.svelte.spec.ts
│   │
│   └── static/
│       └── robots.txt
│
├── .svelte-kit/
├── .vscode/
│   └── settings.json
├── .gitignore
├── .npmrc
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── package.json
├── playwright.config.ts
├── README.md
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
│
├── INTEGRATION.md                              # Integration guide
├── INTEGRATION_SUMMARY.md                      # Quick summary
├── ENVIRONMENT_SETUP.md                        # Environment variables
├── API_CLIENTS_REFERENCE.md                    # API reference
├── STRUCTURE.md                                # This file
│
└── e2e/
    └── demo.test.ts
```

## File Descriptions

### Core Configuration
- **config.ts** - Manages API URLs from environment variables
- **index.ts** - Central export point for all modules

### API Infrastructure
- **api/utils.ts** - Axios client factory, error handling, type definitions
- **api/types.ts** - TypeScript types for all 12 domains
- **api/base-client.ts** - Abstract base class with common CRUD operations

### Authentication Module (api/auth/)
- **client.ts** - Auth API client with login, register, logout, token refresh
- **cookies.ts** - Secure token storage using browser cookies
- **types.ts** - Auth-specific TypeScript interfaces
- **index.ts** - Public exports for auth module

### Domain Clients (api/{domain}/)
Each of 12 domains has the same pattern:
- **client.ts** - Domain-specific API client class
- **index.ts** - Module exports

**Domains:**
1. projects - Full project management with sub-resources
2. ideas - Idea tracking
3. chats - Chat conversations
4. clients - Client management
5. finances - Financial tracking
6. experiences - Work experience
7. user-preferences - User settings
8. user-profiles - User profiles
9. api-keys - API key management
10. languages - Language proficiency
11. scheduler - Task scheduling
12. testimonials - Testimonials

### State Management
- **stores/auth.ts** - Svelte stores for authentication state
  - user, isLoading, error
  - Derived: isAuthenticated, hasTokens
  - Functions: initializeAuth, login, register, logout, refreshUser, changePassword, clearAuth

### Components
- **components/ProjectsExample.svelte** - Full example component showing:
  - Create projects
  - List projects with pagination
  - Update status
  - Delete projects
  - Error handling
  - Loading states

### Documentation
- **INTEGRATION.md** - Comprehensive integration guide with usage examples
- **INTEGRATION_SUMMARY.md** - Quick summary of what was created
- **ENVIRONMENT_SETUP.md** - Environment variables and backend setup
- **API_CLIENTS_REFERENCE.md** - Complete reference for all API clients
- **STRUCTURE.md** - This file

## Import Patterns

### Import from main library
```typescript
import { 
  projectsClient, 
  ideasClient,
  user, 
  isAuthenticated,
  login,
  logout
} from '$lib';
```

### Import from specific modules
```typescript
import { projectsClient } from '$lib/api/projects';
import { authClient, tokenCookies } from '$lib/api/auth';
import { user, login } from '$lib/stores/auth';
```

### Import types
```typescript
import type { Project, Idea, Chat } from '$lib';
import type { User, AuthResponse } from '$lib/api/auth';
```

## File Statistics

| Category | Count | Files |
|----------|-------|-------|
| API Clients | 24 | 12 domains × 2 files |
| API Infrastructure | 4 | config, utils, types, base-client |
| Auth Module | 4 | client, cookies, types, index |
| State Management | 1 | auth.ts |
| Components | 1 | ProjectsExample.svelte |
| Documentation | 5 | INTEGRATION, SUMMARY, ENVIRONMENT, API_REFERENCE, STRUCTURE |
| Config Files | 10 | package.json, tsconfig, eslint, etc. |
| **Total** | **49** | **API + Infrastructure files** |

## Key Design Patterns

### 1. Modular Organization
```
api/
├── utils.ts (shared)
├── auth/ (module)
├── projects/ (module)
└── ...
```

### 2. Consistent Client Pattern
```typescript
class XyzClient extends BaseApiClient {
  constructor() { super('/endpoint'); }
  // Domain-specific methods + inherited CRUD
}
```

### 3. Single Instance Pattern
```typescript
export const projectsClient = new ProjectsApiClient();
```

### 4. Svelte Stores for State
```typescript
const user = writable<User | null>(null);
export const isAuthenticated = derived(user, ...);
```

### 5. Centralized Exports
All modules export through `lib/index.ts` for clean imports.

## Token Flow

```
User Login
    ↓
authClient.login()
    ↓
Tokens stored in cookies (via tokenCookies)
    ↓
All API clients fetch token from cookies
    ↓
Token added to Authorization header (via axios interceptor)
    ↓
On 401: Auto-refresh token
    ↓
Retry request with new token
```

## API Call Flow

```
Component
    ↓
Client Method (e.g., projectsClient.createProject())
    ↓
Axios Request
    ↓
Request Interceptor (add token from cookies)
    ↓
Backend API
    ↓
Response Interceptor (handle 401, refresh token)
    ↓
Return Data / Throw Error
```

## TypeScript Organization

- **api/types.ts** - All domain types (Project, Idea, Chat, etc.)
- **api/auth/types.ts** - Auth-specific types (User, AuthResponse, etc.)
- **api/utils.ts** - Shared response types (ApiResponse, PaginatedApiResponse)
- Each client imports needed types

## Dependency Management

### External Dependencies
- **axios** - HTTP client (v1.13.2)

### Built-in SvelteKit
- svelte/store - State management
- $app/environment - Runtime environment check
- $lib - Path alias for lib folder

## Next Steps After Integration

1. ✅ Setup (install axios)
2. ✅ Configure API URLs (environment variables)
3. ✅ Create auth store and clients
4. ✅ Create domain clients
5. 🔲 Initialize auth in root layout
6. 🔲 Build your pages using clients
7. 🔲 Test API integrations
8. 🔲 Deploy to production

See INTEGRATION.md for detailed usage examples.
