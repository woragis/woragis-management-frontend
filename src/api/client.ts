import type {
  ApiError,
  MediaAsset,
  Profile,
  Project,
  ProjectDomain,
  ProjectGalleryItem,
  ProjectLink,
  ProjectSecret,
  ProjectEnv,
  Dashboard,
  ProjectFilters,
  SocialLink,
} from './types'

const ADMIN_KEY_STORAGE = 'woragis_admin_key'
const API_URL_STORAGE = 'woragis_api_url'

export function getAdminKey(): string {
  return localStorage.getItem(ADMIN_KEY_STORAGE) ?? ''
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key)
}

export function getApiBase(): string {
  const stored = localStorage.getItem(API_URL_STORAGE)
  if (stored !== null) return stored
  return import.meta.env.VITE_API_URL ?? ''
}

export function setApiBase(url: string) {
  localStorage.setItem(API_URL_STORAGE, url)
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = getApiBase()
  const headers = new Headers(init.headers)
  const key = getAdminKey()
  if (key) headers.set('X-Admin-Key', key)
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${base}${path}`, { ...init, headers })
  if (res.status === 204) return undefined as T
  if (!res.ok) {
    let err: ApiError = { code: 'UNKNOWN', message: res.statusText }
    try {
      err = await res.json()
    } catch {
      /* ignore */
    }
    throw new Error(err.message || err.code)
  }
  return res.json() as Promise<T>
}

export const api = {
  dashboard: {
    get: () => request<Dashboard>('/v1/admin/dashboard'),
  },
  projects: {
    list: (filters?: ProjectFilters) => {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.isPublic !== undefined) params.set('isPublic', String(filters.isPublic))
      if (filters?.featured !== undefined) params.set('featured', String(filters.featured))
      if (filters?.q) params.set('q', filters.q)
      const qs = params.toString()
      return request<Project[]>(`/v1/admin/projects${qs ? `?${qs}` : ''}`)
    },
    get: (id: string) => request<Project>(`/v1/admin/projects/${id}`),
    create: (body: Partial<Project> & { name: string }) =>
      request<Project>('/v1/admin/projects', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Project>) =>
      request<Project>(`/v1/admin/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request<void>(`/v1/admin/projects/${id}`, { method: 'DELETE' }),
    addLink: (id: string, body: Omit<ProjectLink, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) =>
      request<ProjectLink>(`/v1/admin/projects/${id}/links`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteLink: (id: string, linkId: string) =>
      request<void>(`/v1/admin/projects/${id}/links/${linkId}`, { method: 'DELETE' }),
    addDomain: (id: string, body: { domain: string; registrar?: string; purpose?: string; notes?: string }) =>
      request<ProjectDomain>(`/v1/admin/projects/${id}/domains`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteDomain: (id: string, domainId: string) =>
      request<void>(`/v1/admin/projects/${id}/domains/${domainId}`, { method: 'DELETE' }),
    listSecrets: (id: string) =>
      request<ProjectSecret[]>(`/v1/admin/projects/${id}/secrets`),
    getSecret: (id: string, secretId: string) =>
      request<ProjectSecret>(`/v1/admin/projects/${id}/secrets/${secretId}`),
    addSecret: (id: string, body: { name: string; value: string; environment?: string; service?: string; notes?: string }) =>
      request<ProjectSecret>(`/v1/admin/projects/${id}/secrets`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteSecret: (id: string, secretId: string) =>
      request<void>(`/v1/admin/projects/${id}/secrets/${secretId}`, { method: 'DELETE' }),
    addGallery: (id: string, body: { mediaAssetId: string; displayOrder?: number; caption?: string }) =>
      request<ProjectGalleryItem>(`/v1/admin/projects/${id}/gallery`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteGallery: (id: string, itemId: string) =>
      request<void>(`/v1/admin/projects/${id}/gallery/${itemId}`, { method: 'DELETE' }),
    listEnvs: (id: string) =>
      request<ProjectEnv[]>(`/v1/admin/projects/${id}/envs`),
    addEnv: (id: string, body: { key: string; value: string; environment?: string; notes?: string }) =>
      request<ProjectEnv>(`/v1/admin/projects/${id}/envs`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    deleteEnv: (id: string, envId: string) =>
      request<void>(`/v1/admin/projects/${id}/envs/${envId}`, { method: 'DELETE' }),
  },
  media: {
    list: () => request<MediaAsset[]>('/v1/admin/media'),
    upload: (file: File, altText = '') => {
      const fd = new FormData()
      fd.append('file', file)
      if (altText) fd.append('altText', altText)
      return request<MediaAsset>('/v1/admin/media', { method: 'POST', body: fd })
    },
    delete: (id: string) =>
      request<void>(`/v1/admin/media/${id}`, { method: 'DELETE' }),
  },
  profile: {
    get: () => request<Profile>('/v1/admin/profile'),
    update: (body: {
      displayName?: string
      headline?: string
      bio?: string
      avatarId?: string | null
      location?: string
      availability?: string
      resumeAssetId?: string | null
      socialLinks?: SocialLink[]
    }) =>
      request<Profile>('/v1/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },
}
