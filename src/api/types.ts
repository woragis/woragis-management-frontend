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
  isPublic?: boolean
  featured?: boolean
  q?: string
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
  leetcodeProblemNumber?: number | null
  leetcodeSlug?: string | null
  difficulty?: string | null
  topics?: string[]
  notes?: string | null
  youtubeUrl?: string | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  thumbnails?: ContentThumbnail[]
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
