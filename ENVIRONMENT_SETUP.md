# Environment Configuration

## Environment Variables

Create a `.env.local` file in the frontend root directory with the following variables:

### Development

```env
# Public API URLs (these are exposed to the browser)
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010
```

### Production

```env
PUBLIC_MANAGEMENT_API_URL=https://api.yourdomain.com/management
PUBLIC_AUTH_API_URL=https://api.yourdomain.com/auth
```

## Backend API Ports (Reference)

- **Management Service**: http://localhost:3012
- **Auth Service**: http://localhost:3010
- **Jobs Service**: http://localhost:3011 (if needed)

## Running the Integration

### 1. Start Backend Services

```bash
# From management backend directory
docker-compose up

# Or if using individual services
npm start
```

### 2. Configure Frontend Environment

Create `.env.local`:

```env
PUBLIC_MANAGEMENT_API_URL=http://localhost:3012
PUBLIC_AUTH_API_URL=http://localhost:3010
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Documentation

### Base URLs

- Management API: `{PUBLIC_MANAGEMENT_API_URL}/api/v1`
- Auth API: `{PUBLIC_AUTH_API_URL}/api/v1`

### Authentication

All endpoints (except login/register) require an `Authorization: Bearer {token}` header. This is handled automatically by the auth client and axios interceptors.

### Endpoints Available

#### Auth Service

```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
GET  /auth/me
GET  /auth/profile
PATCH /auth/profile
POST /auth/change-password
```

#### Management Service

**Projects**

```
POST   /projects
GET    /projects
GET    /projects/slug/:slug
GET    /projects/slug (search)
PATCH  /projects/:id/status
PATCH  /projects/:id/metrics
DELETE /projects/:id
POST   /projects/:id/duplicate

Milestones:
POST   /projects/:id/milestones
GET    /projects/:id/milestones
PATCH  /projects/milestones/:milestoneId
POST   /projects/:id/milestones/bulk

Kanban:
GET    /projects/:id/kanban
POST   /projects/:id/kanban/columns
PATCH  /projects/:id/kanban/columns/:columnId
PATCH  /projects/:id/kanban/columns/reorder
DELETE /projects/:id/kanban/columns/:columnId
POST   /projects/:id/kanban/cards
PATCH  /projects/:id/kanban/cards/:cardId
PATCH  /projects/:id/kanban/cards/:cardId/move
DELETE /projects/:id/kanban/cards/:cardId

And more: dependencies, documentation, technologies, file-structures, architecture-diagrams
```

**Ideas**

```
POST   /ideas
GET    /ideas
GET    /ideas/:id
PATCH  /ideas/:id
DELETE /ideas/:id
```

**Chats**

```
POST   /chats
GET    /chats
GET    /chats/:id
PATCH  /chats/:id
DELETE /chats/:id
POST   /chats/:id/messages
GET    /chats/:id/messages
```

**Clients**

```
POST   /clients
GET    /clients
GET    /clients/:id
PATCH  /clients/:id
DELETE /clients/:id
```

**Finance**

```
POST   /finance
GET    /finance
GET    /finance/:id
PATCH  /finance/:id
DELETE /finance/:id
GET    /finance/report
GET    /finance/category/:category
```

**Experiences**

```
POST   /experiences
GET    /experiences
GET    /experiences/:id
PATCH  /experiences/:id
DELETE /experiences/:id
```

**User Preferences**

```
GET   /user-preferences
PATCH /user-preferences
```

**User Profiles**

```
GET    /user-profiles
PATCH  /user-profiles
GET    /user-profiles/public/:userId
```

**API Keys**

```
POST   /api-keys
GET    /api-keys
DELETE /api-keys/:id
```

**Languages**

```
POST   /languages
GET    /languages
GET    /languages/:id
PATCH  /languages/:id
DELETE /languages/:id
```

**Scheduler**

```
POST   /scheduler
GET    /scheduler
GET    /scheduler/:id
PATCH  /scheduler/:id
DELETE /scheduler/:id
```

**Testimonials**

```
POST   /testimonials
GET    /testimonials
GET    /testimonials/:id
PATCH  /testimonials/:id
DELETE /testimonials/:id
GET    /testimonials/public
```

## Troubleshooting

### CORS Issues

If you get CORS errors, ensure:

1. Backend is configured to accept requests from frontend origin
2. `withCredentials: true` is set (already done in client configuration)
3. Backend response includes appropriate CORS headers

### 401 Unauthorized

- Ensure token is being stored in cookies
- Check if token has expired (should auto-refresh)
- Try logging in again
- Clear browser cookies and retry

### Connection Refused

- Verify backend is running on the correct port
- Check firewall settings
- Verify `PUBLIC_MANAGEMENT_API_URL` matches backend URL
- Try `http://localhost:PORT` format

### Missing Environment Variables

- Ensure `.env.local` exists in the frontend root
- Use `PUBLIC_` prefix for browser-accessible variables
- Frontend won't start without them - check terminal output

## Development Tips

### Debug API Calls

Add this to your component to debug:

```typescript
import { config } from '$lib';

console.log('Management API:', config.managementApiUrl);
console.log('Auth API:', config.authApiUrl);
```

### Check Authentication Status

```typescript
import { isAuthenticated, user, hasTokens } from '$lib';

// In component:
$: console.log('Authenticated:', $isAuthenticated);
$: console.log('Current user:', $user);
$: console.log('Has tokens:', $hasTokens);
```

### Test API Calls

Use the browser console:

```javascript
// Import dynamically
const lib = await import('$lib');

// List projects
const response = await lib.projectsClient.listProjects(1, 10);
console.log(response);

// Create project
const project = await lib.projectsClient.createProject({
	name: 'Test',
	description: 'Test project'
});
console.log(project);
```

## Production Build

```bash
npm run build
npm run preview
```

Then build the Docker image with the generated files in the `build` directory.
