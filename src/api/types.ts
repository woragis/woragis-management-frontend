export type Project = {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  longDescription: string
  status: 'active' | 'paused' | 'archived'
  intent: ProjectIntent
  distribution: ProjectDistribution[]
  monetization: ProjectMonetization
  maturity: ProjectMaturity
  visibilityGoal: ProjectVisibilityGoal
  stack: string[]
  repoUrl: string
  demoUrl: string
  githubUrl: string
  repoVisibility: 'public' | 'private'
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
  envs?: ProjectEnv[]
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

export type ProjectEnv = {
  id: string
  projectId: string
  key: string
  value: string
  environment: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type Dashboard = {
  projectCount: number
  publicProjectCount: number
  activeProjectCount: number
  mediaCount: number
  secretsExpiringSoon: ProjectSecret[]
  domainsExpiringSoon: ProjectDomain[]
}

export type ProjectFilters = {
  status?: string
  intent?: string
  monetization?: string
  maturity?: string
  visibilityGoal?: string
  distribution?: string
  isPublic?: boolean
  featured?: boolean
  q?: string
}

export type ProjectIntent =
  | 'commercial'
  | 'academic'
  | 'personal_tool'
  | 'portfolio'
  | 'hobby'
  | 'nonprofit'

export type ProjectDistribution = 'web' | 'play_store' | 'app_store' | 'desktop' | 'internal_only'

export type ProjectMonetization = 'subscription' | 'one_time' | 'ads' | 'services' | 'indirect' | 'none'

export type ProjectMaturity = 'idea' | 'building' | 'mvp' | 'launched' | 'maintenance' | 'sunset'

export type ProjectVisibilityGoal = 'revenue' | 'job_hunting' | 'academic_credit' | 'community' | 'private'

export type SocialPlatform = 'linkedin' | 'reddit' | 'twitter'

export type SocialGoal = 'job_hunting' | 'revenue' | 'launch' | 'visibility' | 'academic' | 'community'

export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'cancelled'

export type SocialCampaign = {
  id: string
  name: string
  goal: SocialGoal
  description: string
  projectId: string | null
  startDate: string | null
  endDate: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type PostTemplate = {
  id: string
  slug: string
  name: string
  platform: SocialPlatform | 'any'
  goal: SocialGoal
  body: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type SocialPost = {
  id: string
  projectId: string | null
  campaignId: string | null
  platform: SocialPlatform
  goal: SocialGoal
  status: SocialPostStatus
  title: string
  body: string
  hook: string
  cta: string
  templateSlug: string
  scheduledAt: string | null
  reminderSentAt: string | null
  notifyDestinationId: string | null
  publishedAt: string | null
  publishedUrl: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type PresenceSettings = {
  id: string
  remindersEnabled: boolean
  defaultDestinationId: string | null
  createdAt: string
  updatedAt: string
}

export type ApiError = {
  code: string
  message: string
}

export type IncomeSource = {
  id: string
  name: string
  type: string
  amountCents: number
  currency: string
  frequency: string
  dayOfMonth: number
  projectId: string | null
  active: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export type Expense = {
  id: string
  name: string
  category: string
  amountCents: number
  currency: string
  frequency: string
  dayOfMonth: number
  dueDate: string | null
  autoPay: boolean
  projectId: string | null
  active: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export type Transaction = {
  id: string
  type: 'income' | 'expense'
  amountCents: number
  currency: string
  description: string
  date: string
  incomeSourceId: string | null
  expenseId: string | null
  projectId: string | null
  invoiceId: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export type Invoice = {
  id: string
  name: string
  cardLastFour: string
  dueDate: string
  closedAt: string | null
  totalCents: number
  paidCents: number
  status: 'open' | 'paid' | 'overdue'
  notes: string
  createdAt: string
  updatedAt: string
  items?: InvoiceItem[]
}

export type InvoiceItem = {
  id: string
  invoiceId: string
  description: string
  amountCents: number
  date: string
  category: string
  installment: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type BudgetPlan = {
  id: string
  year: number
  month: number
  category: string
  plannedCents: number
  notes: string
  createdAt: string
  updatedAt: string
}

export type FinanceDashboard = {
  monthIncomeCents: number
  monthExpenseCents: number
  monthNetCents: number
  openInvoiceCount: number
  activeIncomeCount: number
  activeExpenseCount: number
  upcomingInvoices: Invoice[]
}

export type MonthlySummary = {
  year: number
  month: number
  incomeCents: number
  expenseCents: number
  netCents: number
  byCategory: Record<string, number>
  budgets?: BudgetPlan[]
}

export type CalendarEvent = {
  date: string
  type: 'income' | 'expense' | 'invoice'
  title: string
  amountCents: number
  refId: string
}

export type LeetcodeVideo = {
  id: string
  title: string
  status: 'draft' | 'published' | 'scheduled'
  seriesNumber?: number | null
  trackName?: string | null
  problemTitle?: string | null
  leetcodeProblemNumber?: number | null
  leetcodeSlug?: string | null
  studyPlanSlug?: string | null
  difficulty?: string | null
  topics?: string[]
  shortDescription?: string | null
  leetcodeProblemUrl?: string | null
  leetcodeSubmissionUrl?: string | null
  notes?: string | null
  youtubeUrl?: string | null
  problemDate?: string | null
  whatsappEnabled?: boolean
  whatsappProblemSentAt?: string | null
  whatsappDiscussionSentAt?: string | null
  whatsappSolutionSentAt?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  thumbnails?: ContentThumbnail[]
}

export type LeetcodeChannelSettings = {
  id: string
  timezone: string
  problemPostTime: string
  discussionPostTime: string
  solutionPostTime: string
  weeklySummaryDay: string
  weeklySummaryTime: string
  discussionEnabled: boolean
  inviteLink?: string | null
  defaultStudyPlanSlug?: string | null
  nextTheme?: string | null
  createdAt: string
  updatedAt: string
}

export type WhatsappMessageTemplate = {
  id: string
  channelSlug: string
  slug: string
  name: string
  body: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type WhatsappDispatchResult = {
  videoId?: string
  templateSlug: string
  message: string
  skip?: boolean
  skipReason?: string
}

export type WhatsappWorkerStatus = {
  configured: boolean
  connected: boolean
}

export type ContentThumbnail = {
  id: string
  videoId: string
  status: 'draft' | 'generating' | 'ready' | 'approved' | 'failed'
  prompt: string
  negativePrompt?: string | null
  size: string
  quality: string
  model: string
  mode: string
  referenceMediaIds?: string[]
  creativesJobId?: string | null
  outputMediaId?: string | null
  errorMessage?: string | null
  createdAt: string
  updatedAt: string
}

export type ContentPromptTemplate = {
  id: string
  channelSlug: string
  name: string
  slug: string
  promptTemplate: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type MessageChannel = 'whatsapp' | 'telegram'

export type ChannelDestination = {
  id: string
  channel: MessageChannel
  externalId: string
  name: string
  description: string
  responsibilities: string
  tags: string[] | null
  metadata: Record<string, unknown> | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export type MessageTemplate = {
  id: string
  destinationId: string | null
  programSlug: string
  slug: string
  name: string
  body: string
  composeMode: 'static' | 'ai_assisted'
  aiPromptHint: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type ScheduledJob = {
  id: string
  name: string
  destinationId: string
  templateSlug: string
  programAction: string
  cronExpr: string
  timezone: string
  enabled: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  createdAt: string
  updatedAt: string
}

export type MessageDelivery = {
  id: string
  jobId: string | null
  destinationId: string
  channel: MessageChannel
  externalId: string
  templateSlug: string
  body: string
  status: string
  errorMessage: string
  externalRef: string
  sentAt: string
  createdAt: string
}
