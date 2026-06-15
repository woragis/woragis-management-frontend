export type Project = {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  longDescription: string
  status: 'active' | 'paused' | 'archived'
  stack: string[]
  repoUrl: string
  demoUrl: string
  githubUrl: string
  notes: string
  isPublic: boolean
  featured: boolean
  displayOrder: number
  publicSlug: string
  coverImageId: string | null
  parentProjectId: string | null
  createdAt: string
  updatedAt: string
  links?: ProjectLink[]
  domains?: ProjectDomain[]
  gallery?: ProjectGalleryItem[]
}

export type ProjectLink = {
  id: string
  projectId: string
  type: string
  url: string
  environment: string
  label: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type ProjectDomain = {
  id: string
  projectId: string
  domain: string
  registrar: string
  purpose: string
  expiresAt: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export type ProjectSecret = {
  id: string
  projectId: string
  name: string
  value?: string
  environment: string
  service: string
  expiresAt: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export type ProjectGalleryItem = {
  id: string
  projectId: string
  mediaAssetId: string
  displayOrder: number
  caption: string
  createdAt: string
}

export type MediaAsset = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  publicUrl: string
  altText: string
  width: number
  height: number
  createdAt: string
}

export type SocialLink = {
  type: string
  url: string
}

export type Profile = {
  id: string
  slug: string
  displayName: string
  headline: string
  bio: string
  avatarId: string | null
  location: string
  availability: 'open_to_work' | 'freelancing' | 'not_available'
  resumeAssetId: string | null
  socialLinks: SocialLink[]
  createdAt: string
  updatedAt: string
}

export type ApiError = {
  code: string
  message: string
}
