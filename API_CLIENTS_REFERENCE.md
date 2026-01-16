# API Clients Reference

Complete reference for all available API clients and their methods.

## Auth Client

```typescript
import { authClient, tokenCookies } from '$lib';

// Login
await authClient.login({ email: 'user@example.com', password: 'password' });

// Register
await authClient.register({
  email: 'user@example.com',
  password: 'password',
  username: 'username',
  firstName: 'John',
  lastName: 'Doe'
});

// Get current user
const user = await authClient.getCurrentUser();

// Get user profile
const profile = await authClient.getProfile();

// Update profile
await authClient.updateProfile({
  firstName: 'Jane',
  lastName: 'Smith',
  bio: 'My bio',
  avatar: 'https://...'
});

// Change password
await authClient.changePassword({
  oldPassword: 'oldpassword',
  newPassword: 'newpassword'
});

// Refresh token
const authData = await authClient.refreshAccessToken(refreshToken);

// Logout
await authClient.logout();

// Check authentication
const isAuth = authClient.isAuthenticated();

// Token management
const token = tokenCookies.getAccessToken();
tokenCookies.setAccessToken(token, 24); // 24 hours
tokenCookies.clearTokens();
```

## Projects Client

```typescript
import { projectsClient } from '$lib';

// CRUD Operations
const project = await projectsClient.createProject({
  name: 'My Project',
  description: 'Project description',
  status: 'planning'
});

const { data: projects, meta } = await projectsClient.listProjects(1, 10);

const project = await projectsClient.getProjectBySlug('my-project-slug');

const projects = await projectsClient.searchProjectsBySlug('keyword');

const updated = await projectsClient.updateStatus(projectId, 'in_progress');

const updated = await projectsClient.updateMetrics(projectId, {
  totalTasks: 10,
  completedTasks: 5
});

await projectsClient.deleteProject(projectId);

const duplicated = await projectsClient.duplicateProject(projectId);

// Milestones
const milestone = await projectsClient.createMilestone(projectId, {
  title: 'Alpha Release',
  targetDate: '2024-02-28'
});

const milestones = await projectsClient.listMilestones(projectId);

const toggled = await projectsClient.toggleMilestoneCompletion(milestoneId);

const updated = await projectsClient.bulkUpdateMilestones(projectId, milestones);

// Kanban
const board = await projectsClient.getKanbanBoard(projectId);

const column = await projectsClient.createKanbanColumn(projectId, {
  title: 'To Do',
  order: 1
});

const updated = await projectsClient.updateKanbanColumn(columnId, {
  title: 'Doing'
});

const reordered = await projectsClient.reorderKanbanColumns(projectId, [
  'col1', 'col2', 'col3'
]);

await projectsClient.deleteKanbanColumn(projectId, columnId);

const card = await projectsClient.createKanbanCard(projectId, {
  title: 'Task name',
  columnId: 'col1',
  order: 1
});

const updated = await projectsClient.updateKanbanCard(projectId, cardId, {
  title: 'Updated task'
});

const moved = await projectsClient.moveKanbanCard(projectId, cardId, newColumnId, newOrder);

await projectsClient.deleteKanbanCard(projectId, cardId);

// Dependencies
const dependency = await projectsClient.createDependency(projectId, {
  dependsOnProjectId: 'otherProjectId',
  dependencyType: 'blocks'
});

const dependencies = await projectsClient.listDependencies(projectId);

await projectsClient.deleteDependency(projectId, dependencyId);

// Documentation
const doc = await projectsClient.createDocumentation(projectId, {
  title: 'API Documentation',
  content: 'markdown content'
});

const doc = await projectsClient.getDocumentation(projectId);

const updated = await projectsClient.updateDocumentationVisibility(projectId, true);

await projectsClient.deleteDocumentation(projectId);

const publicDoc = await projectsClient.getPublicDocumentation('project-slug');

// Documentation Sections
const section = await projectsClient.createDocumentationSection(projectId, {
  title: 'Introduction',
  content: 'section content',
  order: 1
});

const sections = await projectsClient.listDocumentationSections(projectId);

const updated = await projectsClient.updateDocumentationSection(sectionId, {
  title: 'Updated Title'
});

await projectsClient.deleteDocumentationSection(sectionId);

const reordered = await projectsClient.reorderDocumentationSections(projectId, [
  'sec1', 'sec2'
]);

// Technologies
const tech = await projectsClient.createTechnology(projectId, {
  name: 'TypeScript',
  category: 'Language'
});

const technologies = await projectsClient.listTechnologies(projectId);

const updated = await projectsClient.updateTechnology(techId, {
  name: 'TypeScript 5'
});

await projectsClient.deleteTechnology(techId);

const created = await projectsClient.bulkCreateTechnologies(projectId, [tech1, tech2]);

const updated = await projectsClient.bulkUpdateTechnologies(projectId, [tech1, tech2]);

// File Structures
const fs = await projectsClient.createFileStructure(projectId, {
  name: 'Root',
  structure: 'tree structure string',
  language: 'typescript'
});

const fileStructures = await projectsClient.listFileStructures(projectId);

const updated = await projectsClient.updateFileStructure(fsId, { name: 'Updated' });

await projectsClient.deleteFileStructure(fsId);

const created = await projectsClient.bulkCreateFileStructures(projectId, [fs1, fs2]);

const updated = await projectsClient.bulkUpdateFileStructures(projectId, [fs1, fs2]);

// Architecture Diagrams
const diagram = await projectsClient.createArchitectureDiagram(projectId, {
  title: 'System Architecture',
  diagramData: 'svg or json',
  type: 'mermaid'
});

const diagrams = await projectsClient.listArchitectureDiagrams(projectId);

const diagram = await projectsClient.getArchitectureDiagram(diagramId);

const updated = await projectsClient.updateArchitectureDiagram(diagramId, {
  title: 'Updated'
});

await projectsClient.deleteArchitectureDiagram(diagramId);
```

## Ideas Client

```typescript
import { ideasClient } from '$lib';

const idea = await ideasClient.createIdea({
  title: 'New Feature',
  description: 'Feature description',
  category: 'feature',
  priority: 'high'
});

const { data: ideas, meta } = await ideasClient.listIdeas(1, 10);

const idea = await ideasClient.getIdea(ideaId);

const updated = await ideasClient.updateIdea(ideaId, {
  status: 'active'
});

await ideasClient.deleteIdea(ideaId);
```

## Chats Client

```typescript
import { chatsClient } from '$lib';

const chat = await chatsClient.createChat({
  title: 'Project Discussion',
  topic: 'planning'
});

const { data: chats, meta } = await chatsClient.listChats(1, 10);

const chat = await chatsClient.getChat(chatId);

const updated = await chatsClient.updateChat(chatId, {
  title: 'Updated Title'
});

await chatsClient.deleteChat(chatId);

const message = await chatsClient.sendMessage(chatId, 'Hello!');

const messages = await chatsClient.getMessages(chatId, 50);
```

## Clients Client

```typescript
import { clientsClient } from '$lib';

const client = await clientsClient.createClient({
  name: 'Client Name',
  email: 'client@example.com',
  company: 'Company'
});

const { data: clients, meta } = await clientsClient.listClients(1, 10);

const client = await clientsClient.getClient(clientId);

const updated = await clientsClient.updateClient(clientId, {
  status: 'inactive'
});

await clientsClient.deleteClient(clientId);
```

## Finances Client

```typescript
import { financesClient } from '$lib';

const entry = await financesClient.createEntry({
  type: 'income',
  category: 'Freelance',
  amount: 1000,
  currency: 'USD'
});

const { data: entries, meta } = await financesClient.listEntries(1, 10);

const entry = await financesClient.getEntry(entryId);

const updated = await financesClient.updateEntry(entryId, {
  amount: 1200
});

await financesClient.deleteEntry(entryId);

const report = await financesClient.getReport('2024-01');

const entries = await financesClient.getByCategory('Freelance');
```

## Experiences Client

```typescript
import { experiencesClient } from '$lib';

const experience = await experiencesClient.createExperience({
  title: 'Senior Developer',
  company: 'Tech Corp',
  position: 'Lead',
  startDate: '2020-01-01'
});

const { data: experiences, meta } = await experiencesClient.listExperiences(1, 10);

const exp = await experiencesClient.getExperience(expId);

const updated = await experiencesClient.updateExperience(expId, {
  endDate: '2024-01-01'
});

await experiencesClient.deleteExperience(expId);
```

## User Preferences Client

```typescript
import { userPreferencesClient } from '$lib';

const prefs = await userPreferencesClient.getPreferences();

const updated = await userPreferencesClient.updatePreferences({
  theme: 'dark',
  language: 'en',
  timezone: 'UTC'
});
```

## User Profiles Client

```typescript
import { userProfilesClient } from '$lib';

const profile = await userProfilesClient.getProfile();

const updated = await userProfilesClient.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  bio: 'My bio'
});

const publicProfile = await userProfilesClient.getPublicProfile(userId);
```

## API Keys Client

```typescript
import { apiKeysClient } from '$lib';

const key = await apiKeysClient.createKey({
  name: 'My API Key'
});

const { data: keys, meta } = await apiKeysClient.listKeys(1, 10);

await apiKeysClient.revokeKey(keyId);
```

## Languages Client

```typescript
import { languagesClient } from '$lib';

const language = await languagesClient.createLanguage({
  name: 'English',
  proficiency: 'native'
});

const { data: languages, meta } = await languagesClient.listLanguages(1, 10);

const lang = await languagesClient.getLanguage(langId);

const updated = await languagesClient.updateLanguage(langId, {
  proficiency: 'advanced'
});

await languagesClient.deleteLanguage(langId);
```

## Scheduler Client

```typescript
import { schedulerClient } from '$lib';

const task = await schedulerClient.createTask({
  title: 'Complete task',
  dueDate: '2024-02-01',
  priority: 'high'
});

const { data: tasks, meta } = await schedulerClient.listTasks(1, 10);

const task = await schedulerClient.getTask(taskId);

const updated = await schedulerClient.updateTask(taskId, {
  priority: 'low'
});

await schedulerClient.deleteTask(taskId);

const completed = await schedulerClient.completeTask(taskId);
```

## Testimonials Client

```typescript
import { testimonialsClient } from '$lib';

const testimonial = await testimonialsClient.createTestimonial({
  clientName: 'John Smith',
  company: 'Tech Corp',
  content: 'Great work!',
  rating: 5
});

const { data: testimonials, meta } = await testimonialsClient.listTestimonials(1, 10);

const testimonial = await testimonialsClient.getTestimonial(testimonialId);

const updated = await testimonialsClient.updateTestimonial(testimonialId, {
  isPublic: true
});

await testimonialsClient.deleteTestimonial(testimonialId);

const publicTestimonials = await testimonialsClient.listPublicTestimonials(1, 10);
```

## Error Handling

All clients throw errors on failed requests. Use try-catch:

```typescript
import { getErrorMessage } from '$lib';

try {
  const result = await projectsClient.createProject(data);
} catch (error) {
  const message = getErrorMessage(error);
  console.error('Error:', message);
}
```

## Common Patterns

### Pagination

```typescript
let page = 1;
const limit = 10;

const { data, meta } = await projectsClient.listProjects(page, limit);

console.log('Total items:', meta.total);
console.log('Total pages:', meta.totalPages);
console.log('Current page:', meta.page);
```

### Loading States

```typescript
let loading = false;

async function loadData() {
  try {
    loading = true;
    const result = await projectsClient.listProjects(1, 10);
  } finally {
    loading = false;
  }
}
```

### Svelte Stores Integration

```typescript
import { projectsClient } from '$lib';
import { writable } from 'svelte/store';

const projects = writable([]);

async function loadProjects() {
  const { data } = await projectsClient.listProjects(1, 10);
  projects.set(data);
}
```
