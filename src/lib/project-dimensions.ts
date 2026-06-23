export const PROJECT_INTENTS = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'academic', label: 'Academic' },
  { value: 'personal_tool', label: 'Personal tool' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'hobby', label: 'Hobby' },
  { value: 'nonprofit', label: 'Non-profit' },
] as const

export const PROJECT_DISTRIBUTIONS = [
  { value: 'web', label: 'Web' },
  { value: 'play_store', label: 'Play Store' },
  { value: 'app_store', label: 'App Store' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'internal_only', label: 'Internal only' },
] as const

export const PROJECT_MONETIZATION = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'one_time', label: 'One-time' },
  { value: 'ads', label: 'Ads' },
  { value: 'services', label: 'Services' },
  { value: 'indirect', label: 'Indirect' },
  { value: 'none', label: 'None' },
] as const

export const PROJECT_MATURITY = [
  { value: 'idea', label: 'Idea' },
  { value: 'building', label: 'Building' },
  { value: 'mvp', label: 'MVP' },
  { value: 'launched', label: 'Launched' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'sunset', label: 'Sunset' },
] as const

export const PROJECT_VISIBILITY_GOALS = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'job_hunting', label: 'Job hunting' },
  { value: 'academic_credit', label: 'Academic credit' },
  { value: 'community', label: 'Community' },
  { value: 'private', label: 'Private' },
] as const

export const SOCIAL_PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'twitter', label: 'Twitter / X' },
] as const

export const SOCIAL_GOALS = [
  { value: 'job_hunting', label: 'Job hunting' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'launch', label: 'Launch' },
  { value: 'visibility', label: 'Visibility' },
  { value: 'academic', label: 'Academic' },
  { value: 'community', label: 'Community' },
] as const

export const SOCIAL_POST_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export function labelFor<T extends { value: string; label: string }>(options: readonly T[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value
}
