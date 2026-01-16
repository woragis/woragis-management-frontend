/**
 * Library Main Exports
 * Central export point for all API clients, stores, and utilities
 */

// ============================================================================
// API Clients
// ============================================================================

export { authClient, tokenCookies } from './api/auth';
export { projectsClient } from './api/projects';
export { ideasClient } from './api/ideas';
export { chatsClient } from './api/chats';
export { clientsClient } from './api/clients';
export { financesClient } from './api/finances';
export { experiencesClient } from './api/experiences';
export { userPreferencesClient } from './api/user-preferences';
export { userProfilesClient } from './api/user-profiles';
export { apiKeysClient } from './api/api-keys';
export { languagesClient } from './api/languages';
export { schedulerClient } from './api/scheduler';
export { testimonialsClient } from './api/testimonials';

// ============================================================================
// API Utilities
// ============================================================================

export { createApiClient, getErrorMessage } from './api/utils';
export type {
	ApiResponse,
	ApiErrorResponse,
	PaginationMeta,
	PaginatedApiResponse
} from './api/utils';

// ============================================================================
// Types
// ============================================================================

export type {
	// Projects
	Technology,
	Milestone,
	KanbanColumn,
	KanbanCard,
	ProjectDependency,
	ProjectDocumentation,
	DocumentationSection,
	FileStructure,
	ArchitectureDiagram,
	ProjectMetrics,
	Project,
	// Ideas
	Idea,
	// Chats
	ChatMessage,
	Chat,
	// Clients
	Client,
	// Finances
	FinanceEntry,
	FinanceReport,
	// Experiences
	Experience,
	// User Preferences
	UserPreferences,
	// User Profiles
	UserProfile,
	// API Keys
	ApiKey,
	// Languages
	Language,
	// Scheduler
	ScheduledTask,
	// Testimonials
	Testimonial
} from './api/types';

export type {
	User,
	Profile,
	RegisterRequest,
	LoginRequest,
	AuthResponse,
	RefreshTokenRequest,
	LogoutRequest,
	ChangePasswordRequest,
	ProfileUpdateRequest
} from './api/auth';

// ============================================================================
// Stores
// ============================================================================

export {
	user,
	isLoading,
	error,
	isAuthenticated,
	hasTokens,
	initializeAuth,
	login,
	register,
	logout,
	refreshUser,
	changePassword,
	clearAuth
} from './stores/auth';

// ============================================================================
// Config
// ============================================================================

export { config } from './config';
