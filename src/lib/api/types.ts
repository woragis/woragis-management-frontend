// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardStats {
	totalProjects: number;
	activeProjects: number;
	completedProjects: number;
	totalIdeas: number;
	totalClients: number;
	recentTransactions: any[];
	upcomingTasks: any[];
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export interface Transaction {
	id: string;
	userId: string;
	description: string;
	amount: number;
	type: 'income' | 'expense';
	category: string;
	date: string;
	createdAt: string;
	updatedAt: string;
}
// ============================================================================
// CERTIFICATIONS
// ============================================================================

export interface Certification {
	id: string;
	name: string;
	issuer: string;
	issueDate: string;
	expiryDate?: string;
	credentialUrl?: string;
	credentialId?: string;
	createdAt: string;
	updatedAt: string;
}
/**
 * Management API Domain Types
 * Types for all management service domains
 */

// ============================================================================
// PROJECTS
// ============================================================================

export interface Technology {
	id: string;
	name: string;
	category?: string;
	description?: string;
}

export interface Milestone {
	id: string;
	projectId: string;
	title: string;
	description?: string;
	targetDate?: string;
	completed: boolean;
	completedAt?: string;
	order: number;
}

export interface KanbanColumn {
	id: string;
	projectId: string;
	title: string;
	order: number;
	color?: string;
}

export interface KanbanCard {
	id: string;
	columnId: string;
	title: string;
	description?: string;
	order: number;
	assignee?: string;
}

export interface ProjectDependency {
	id: string;
	projectId: string;
	dependsOnProjectId: string;
	dependencyType: 'blocks' | 'blocked_by' | 'related_to';
	description?: string;
}

export interface ProjectDocumentation {
	id: string;
	projectId: string;
	title: string;
	content: string;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface DocumentationSection {
	id: string;
	documentationId: string;
	title: string;
	content: string;
	order: number;
}

export interface FileStructure {
	id: string;
	projectId: string;
	name: string;
	structure: string; // Tree-like structure as string
	description?: string;
	language?: string;
}

export interface ArchitectureDiagram {
	id: string;
	projectId: string;
	title: string;
	description?: string;
	diagramData: string; // SVG or other format
	type: string;
}

export interface ProjectMetrics {
	totalTasks?: number;
	completedTasks?: number;
	completionPercentage?: number;
	estimatedHours?: number;
	actualHours?: number;
}

export interface Project {
	id: string;
	userId: string;
	name: string;
	slug: string;
	description?: string;
	status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
	startDate?: string;
	endDate?: string;
	metrics?: ProjectMetrics;
	technologies?: Technology[];
	milestones?: Milestone[];
	documentation?: ProjectDocumentation;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// IDEAS
// ============================================================================

export interface Idea {
	id: string;
	userId: string;
	title: string;
	description: string;
	category?: string;
	status: 'draft' | 'active' | 'archived' | 'implemented';
	priority?: 'low' | 'medium' | 'high';
	tags?: string[];
	relatedProject?: string;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// CHATS
// ============================================================================

export interface ChatMessage {
	id: string;
	conversationId: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
	metadata?: Record<string, unknown>;
}

export interface Chat {
	id: string;
	userId: string;
	title: string;
	topic?: string;
	provider?: string;
	model?: string;
	messages: ChatMessage[];
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// CLIENTS
// ============================================================================

export interface Client {
	id: string;
	userId: string;
	name: string;
	email?: string;
	phone?: string;
	company?: string;
	website?: string;
	location?: string;
	notes?: string;
	status: 'active' | 'inactive' | 'archived';
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// FINANCES
// ============================================================================

export interface FinanceEntry {
	id: string;
	userId: string;
	type: 'income' | 'expense';
	category: string;
	amount: number;
	currency: string;
	description?: string;
	date: string;
	projectId?: string;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
}

export interface FinanceReport {
	period: string;
	totalIncome: number;
	totalExpense: number;
	netIncome: number;
	byCategory: Record<string, number>;
}

// ============================================================================
// EXPERIENCES
// ============================================================================

export interface Experience {
	id: string;
	userId: string;
	title: string;
	company: string;
	position: string;
	description?: string;
	startDate: string;
	endDate?: string;
	isCurrent: boolean;
	technologies?: string[];
	location?: string;
	skills?: string[];
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
	id: string;
	userId: string;
	theme: 'light' | 'dark' | 'auto';
	language: string;
	timezone: string;
	emailNotifications: boolean;
	pushNotifications: boolean;
	twoFactorEnabled: boolean;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// USER PROFILES
// ============================================================================

export interface UserProfile {
	id: string;
	userId: string;
	firstName: string;
	lastName: string;
	bio?: string;
	avatar?: string;
	website?: string;
	location?: string;
	socialLinks?: Record<string, string>;
	publicProfile: boolean;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// API KEYS
// ============================================================================

export interface ApiKey {
	id: string;
	userId: string;
	name: string;
	key: string; // Only returned when created
	lastUsed?: string;
	expiresAt?: string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// LANGUAGES
// ============================================================================

export interface Language {
	id: string;
	userId: string;
	name: string;
	proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
	certification?: string;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// SCHEDULER
// ============================================================================

export interface ScheduledTask {
	id: string;
	userId: string;
	title: string;
	description?: string;
	dueDate: string;
	dueTime?: string;
	priority: 'low' | 'medium' | 'high';
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
	category?: string;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

export interface Testimonial {
	id: string;
	userId: string;
	clientName: string;
	clientTitle?: string;
	company?: string;
	content: string;
	rating?: number;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface PaginatedApiResponse<T> {
	data: T[];
	meta: PaginationMeta;
}
