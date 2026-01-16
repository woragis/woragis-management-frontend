import axios, { type AxiosInstance } from 'axios';
import { config } from '$lib/config';
import { tokenCookies } from '../auth/cookies';
import type {
	Project,
	Technology,
	Milestone,
	KanbanColumn,
	KanbanCard,
	ProjectDependency,
	ProjectDocumentation,
	DocumentationSection,
	FileStructure,
	ArchitectureDiagram,
	ApiResponse,
	PaginatedApiResponse
} from '../types';

/**
 * Projects API Client
 */
class ProjectsApiClient {
	private client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL: `${config.managementApiUrl}/projects`,
			headers: {
				'Content-Type': 'application/json'
			},
			withCredentials: true
		});

		// Add request interceptor to include token
		this.client.interceptors.request.use((config) => {
			const token = tokenCookies.getAccessToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});
	}

	// ========== Project CRUD ==========

	async createProject(data: Partial<Project>): Promise<Project> {
		const response = await this.client.post<ApiResponse<Project>>('/', data);
		return response.data.data!;
	}

	async listProjects(page = 1, limit = 10): Promise<PaginatedApiResponse<Project>> {
		const response = await this.client.get<PaginatedApiResponse<Project>>('/', {
			params: { page, limit }
		});
		return response.data;
	}

	async getProjectBySlug(slug: string): Promise<Project> {
		const response = await this.client.get<ApiResponse<Project>>(`/slug/${slug}`);
		return response.data.data!;
	}

	async searchProjectsBySlug(query: string): Promise<Project[]> {
		const response = await this.client.get<ApiResponse<Project[]>>('/slug', {
			params: { q: query }
		});
		return response.data.data!;
	}

	async updateStatus(projectId: string, status: Project['status']): Promise<Project> {
		const response = await this.client.patch<ApiResponse<Project>>(`/${projectId}/status`, {
			status
		});
		return response.data.data!;
	}

	async updateMetrics(projectId: string, metrics: any): Promise<Project> {
		const response = await this.client.patch<ApiResponse<Project>>(
			`/${projectId}/metrics`,
			metrics
		);
		return response.data.data!;
	}

	async deleteProject(projectId: string): Promise<void> {
		await this.client.delete(`/${projectId}`);
	}

	async duplicateProject(projectId: string): Promise<Project> {
		const response = await this.client.post<ApiResponse<Project>>(`/${projectId}/duplicate`, {});
		return response.data.data!;
	}

	// ========== Milestones ==========

	async createMilestone(projectId: string, data: Partial<Milestone>): Promise<Milestone> {
		const response = await this.client.post<ApiResponse<Milestone>>(
			`/${projectId}/milestones`,
			data
		);
		return response.data.data!;
	}

	async listMilestones(projectId: string): Promise<Milestone[]> {
		const response = await this.client.get<ApiResponse<Milestone[]>>(`/${projectId}/milestones`);
		return response.data.data!;
	}

	async toggleMilestoneCompletion(milestoneId: string): Promise<Milestone> {
		const response = await this.client.patch<ApiResponse<Milestone>>(
			`/milestones/${milestoneId}`,
			{}
		);
		return response.data.data!;
	}

	async bulkUpdateMilestones(projectId: string, milestones: Milestone[]): Promise<Milestone[]> {
		const response = await this.client.post<ApiResponse<Milestone[]>>(
			`/${projectId}/milestones/bulk`,
			{ milestones }
		);
		return response.data.data!;
	}

	// ========== Kanban ==========

	async getKanbanBoard(projectId: string): Promise<any> {
		const response = await this.client.get<ApiResponse<any>>(`/${projectId}/kanban`);
		return response.data.data!;
	}

	async createKanbanColumn(projectId: string, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
		const response = await this.client.post<ApiResponse<KanbanColumn>>(
			`/${projectId}/kanban/columns`,
			data
		);
		return response.data.data!;
	}

	async updateKanbanColumn(columnId: string, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
		const response = await this.client.patch<ApiResponse<KanbanColumn>>(
			`/kanban/columns/${columnId}`,
			data
		);
		return response.data.data!;
	}

	async reorderKanbanColumns(projectId: string, columnOrder: string[]): Promise<any> {
		const response = await this.client.patch<ApiResponse<any>>(
			`/${projectId}/kanban/columns/reorder`,
			{ order: columnOrder }
		);
		return response.data.data!;
	}

	async deleteKanbanColumn(projectId: string, columnId: string): Promise<void> {
		await this.client.delete(`/${projectId}/kanban/columns/${columnId}`);
	}

	async createKanbanCard(projectId: string, data: Partial<KanbanCard>): Promise<KanbanCard> {
		const response = await this.client.post<ApiResponse<KanbanCard>>(
			`/${projectId}/kanban/cards`,
			data
		);
		return response.data.data!;
	}

	async updateKanbanCard(
		projectId: string,
		cardId: string,
		data: Partial<KanbanCard>
	): Promise<KanbanCard> {
		const response = await this.client.patch<ApiResponse<KanbanCard>>(
			`/${projectId}/kanban/cards/${cardId}`,
			data
		);
		return response.data.data!;
	}

	async moveKanbanCard(
		projectId: string,
		cardId: string,
		columnId: string,
		order: number
	): Promise<KanbanCard> {
		const response = await this.client.patch<ApiResponse<KanbanCard>>(
			`/${projectId}/kanban/cards/${cardId}/move`,
			{ columnId, order }
		);
		return response.data.data!;
	}

	async deleteKanbanCard(projectId: string, cardId: string): Promise<void> {
		await this.client.delete(`/${projectId}/kanban/cards/${cardId}`);
	}

	// ========== Dependencies ==========

	async createDependency(
		projectId: string,
		data: Partial<ProjectDependency>
	): Promise<ProjectDependency> {
		const response = await this.client.post<ApiResponse<ProjectDependency>>(
			`/${projectId}/dependencies`,
			data
		);
		return response.data.data!;
	}

	async listDependencies(projectId: string): Promise<ProjectDependency[]> {
		const response = await this.client.get<ApiResponse<ProjectDependency[]>>(
			`/${projectId}/dependencies`
		);
		return response.data.data!;
	}

	async deleteDependency(projectId: string, dependencyId: string): Promise<void> {
		await this.client.delete(`/${projectId}/dependencies/${dependencyId}`);
	}

	// ========== Documentation ==========

	async createDocumentation(
		projectId: string,
		data: Partial<ProjectDocumentation>
	): Promise<ProjectDocumentation> {
		const response = await this.client.post<ApiResponse<ProjectDocumentation>>(
			`/${projectId}/documentation`,
			data
		);
		return response.data.data!;
	}

	async getDocumentation(projectId: string): Promise<ProjectDocumentation> {
		const response = await this.client.get<ApiResponse<ProjectDocumentation>>(
			`/${projectId}/documentation`
		);
		return response.data.data!;
	}

	async updateDocumentationVisibility(
		projectId: string,
		isPublic: boolean
	): Promise<ProjectDocumentation> {
		const response = await this.client.patch<ApiResponse<ProjectDocumentation>>(
			`/${projectId}/documentation/visibility`,
			{ isPublic }
		);
		return response.data.data!;
	}

	async deleteDocumentation(projectId: string): Promise<void> {
		await this.client.delete(`/${projectId}/documentation`);
	}

	async getPublicDocumentation(slug: string): Promise<ProjectDocumentation> {
		const response = await this.client.get<ApiResponse<ProjectDocumentation>>(
			`/slug/${slug}/documentation`
		);
		return response.data.data!;
	}

	// ========== Documentation Sections ==========

	async createDocumentationSection(
		projectId: string,
		data: Partial<DocumentationSection>
	): Promise<DocumentationSection> {
		const response = await this.client.post<ApiResponse<DocumentationSection>>(
			`/${projectId}/documentation/sections`,
			data
		);
		return response.data.data!;
	}

	async listDocumentationSections(projectId: string): Promise<DocumentationSection[]> {
		const response = await this.client.get<ApiResponse<DocumentationSection[]>>(
			`/${projectId}/documentation/sections`
		);
		return response.data.data!;
	}

	async updateDocumentationSection(
		sectionId: string,
		data: Partial<DocumentationSection>
	): Promise<DocumentationSection> {
		const response = await this.client.patch<ApiResponse<DocumentationSection>>(
			`/documentation/sections/${sectionId}`,
			data
		);
		return response.data.data!;
	}

	async deleteDocumentationSection(sectionId: string): Promise<void> {
		await this.client.delete(`/documentation/sections/${sectionId}`);
	}

	async reorderDocumentationSections(projectId: string, sectionOrder: string[]): Promise<any> {
		const response = await this.client.patch<ApiResponse<any>>(
			`/${projectId}/documentation/sections/reorder`,
			{ order: sectionOrder }
		);
		return response.data.data!;
	}

	// ========== Technologies ==========

	async createTechnology(projectId: string, data: Partial<Technology>): Promise<Technology> {
		const response = await this.client.post<ApiResponse<Technology>>(
			`/${projectId}/technologies`,
			data
		);
		return response.data.data!;
	}

	async listTechnologies(projectId: string): Promise<Technology[]> {
		const response = await this.client.get<ApiResponse<Technology[]>>(`/${projectId}/technologies`);
		return response.data.data!;
	}

	async updateTechnology(techId: string, data: Partial<Technology>): Promise<Technology> {
		const response = await this.client.patch<ApiResponse<Technology>>(
			`/technologies/${techId}`,
			data
		);
		return response.data.data!;
	}

	async deleteTechnology(techId: string): Promise<void> {
		await this.client.delete(`/technologies/${techId}`);
	}

	async bulkCreateTechnologies(
		projectId: string,
		technologies: Technology[]
	): Promise<Technology[]> {
		const response = await this.client.post<ApiResponse<Technology[]>>(
			`/${projectId}/technologies/bulk`,
			{ technologies }
		);
		return response.data.data!;
	}

	async bulkUpdateTechnologies(
		projectId: string,
		technologies: Technology[]
	): Promise<Technology[]> {
		const response = await this.client.patch<ApiResponse<Technology[]>>(
			`/${projectId}/technologies/bulk`,
			{ technologies }
		);
		return response.data.data!;
	}

	// ========== File Structures ==========

	async createFileStructure(
		projectId: string,
		data: Partial<FileStructure>
	): Promise<FileStructure> {
		const response = await this.client.post<ApiResponse<FileStructure>>(
			`/${projectId}/file-structures`,
			data
		);
		return response.data.data!;
	}

	async listFileStructures(projectId: string): Promise<FileStructure[]> {
		const response = await this.client.get<ApiResponse<FileStructure[]>>(
			`/${projectId}/file-structures`
		);
		return response.data.data!;
	}

	async updateFileStructure(
		fileStructureId: string,
		data: Partial<FileStructure>
	): Promise<FileStructure> {
		const response = await this.client.patch<ApiResponse<FileStructure>>(
			`/file-structures/${fileStructureId}`,
			data
		);
		return response.data.data!;
	}

	async deleteFileStructure(fileStructureId: string): Promise<void> {
		await this.client.delete(`/file-structures/${fileStructureId}`);
	}

	async bulkCreateFileStructures(
		projectId: string,
		fileStructures: FileStructure[]
	): Promise<FileStructure[]> {
		const response = await this.client.post<ApiResponse<FileStructure[]>>(
			`/${projectId}/file-structures/bulk`,
			{ fileStructures }
		);
		return response.data.data!;
	}

	async bulkUpdateFileStructures(
		projectId: string,
		fileStructures: FileStructure[]
	): Promise<FileStructure[]> {
		const response = await this.client.patch<ApiResponse<FileStructure[]>>(
			`/${projectId}/file-structures/bulk`,
			{ fileStructures }
		);
		return response.data.data!;
	}

	// ========== Architecture Diagrams ==========

	async createArchitectureDiagram(
		projectId: string,
		data: Partial<ArchitectureDiagram>
	): Promise<ArchitectureDiagram> {
		const response = await this.client.post<ApiResponse<ArchitectureDiagram>>(
			`/${projectId}/architecture-diagrams`,
			data
		);
		return response.data.data!;
	}

	async listArchitectureDiagrams(projectId: string): Promise<ArchitectureDiagram[]> {
		const response = await this.client.get<ApiResponse<ArchitectureDiagram[]>>(
			`/${projectId}/architecture-diagrams`
		);
		return response.data.data!;
	}

	async getArchitectureDiagram(diagramId: string): Promise<ArchitectureDiagram> {
		const response = await this.client.get<ApiResponse<ArchitectureDiagram>>(
			`/architecture-diagrams/${diagramId}`
		);
		return response.data.data!;
	}

	async updateArchitectureDiagram(
		diagramId: string,
		data: Partial<ArchitectureDiagram>
	): Promise<ArchitectureDiagram> {
		const response = await this.client.patch<ApiResponse<ArchitectureDiagram>>(
			`/architecture-diagrams/${diagramId}`,
			data
		);
		return response.data.data!;
	}

	async deleteArchitectureDiagram(diagramId: string): Promise<void> {
		await this.client.delete(`/architecture-diagrams/${diagramId}`);
	}
}

export const projectsClient = new ProjectsApiClient();
