import type { Project, SocialPlatform } from '../api/types'

export const PLATFORM_CHAR_LIMITS: Record<SocialPlatform, number> = {
  linkedin: 3000,
  twitter: 280,
  reddit: 40000,
}

export const PLATFORM_TITLE_LIMITS: Partial<Record<SocialPlatform, number>> = {
  reddit: 300,
}

export type TemplateVars = Record<string, string>

export function projectTemplateVars(project: Pick<Project, 'name' | 'slug' | 'shortDescription' | 'demoUrl' | 'githubUrl' | 'repoUrl' | 'stack'>): TemplateVars {
  return {
    projectName: project.name,
    projectSlug: project.slug,
    shortDescription: project.shortDescription || '',
    demoUrl: project.demoUrl || '',
    githubUrl: project.githubUrl || '',
    repoUrl: project.repoUrl || '',
    stack: (project.stack ?? []).join(', '),
  }
}

export function applyTemplate(body: string, vars: TemplateVars): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '')
}

export function charStatus(length: number, limit: number) {
  const remaining = limit - length
  const over = remaining < 0
  return { length, limit, remaining, over }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
