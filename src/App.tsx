import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Layout } from './components/Layout'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { MediaPage } from './pages/MediaPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectNewPage } from './pages/ProjectNewPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { FinanceLayout } from './pages/finance/FinanceLayout'
import { FinanceDashboardPage } from './pages/finance/FinanceDashboardPage'
import { FinanceIncomePage } from './pages/finance/FinanceIncomePage'
import { FinanceExpensesPage } from './pages/finance/FinanceExpensesPage'
import { FinanceTransactionsPage } from './pages/finance/FinanceTransactionsPage'
import { FinanceInvoicesPage } from './pages/finance/FinanceInvoicesPage'
import { FinanceInvoiceDetailPage } from './pages/finance/FinanceInvoiceDetailPage'
import { FinanceBudgetsPage } from './pages/finance/FinanceBudgetsPage'
import { ContentLayout } from './pages/content/ContentLayout'
import { LeetcodeVideosPage } from './pages/content/leetcode/LeetcodeVideosPage'
import { LeetcodeVideoDetailPage } from './pages/content/leetcode/LeetcodeVideoDetailPage'
import { LeetcodeTemplatesPage } from './pages/content/leetcode/LeetcodeTemplatesPage'
import { LeetcodeSettingsPage } from './pages/content/leetcode/LeetcodeSettingsPage'
import { LeetcodeWhatsappPage } from './pages/content/leetcode/LeetcodeWhatsappPage'
import { LeetcodeWhatsappTemplatesPage } from './pages/content/leetcode/LeetcodeWhatsappTemplatesPage'
import { MessagingLayout } from './pages/messaging/MessagingLayout'
import { MessagingDestinationsPage } from './pages/messaging/MessagingDestinationsPage'
import { MessagingTemplatesPage } from './pages/messaging/MessagingTemplatesPage'
import { MessagingJobsPage } from './pages/messaging/MessagingJobsPage'
import { MessagingDeliveriesPage } from './pages/messaging/MessagingDeliveriesPage'
import { MessagingChannelsPage } from './pages/messaging/MessagingChannelsPage'
import { PresenceLayout } from './pages/presence/PresenceLayout'
import { PresencePostsPage } from './pages/presence/PresencePostsPage'
import { PresenceCampaignsPage } from './pages/presence/PresenceCampaignsPage'
import { PresenceTemplatesPage } from './pages/presence/PresenceTemplatesPage'
import { PresenceSettingsPage } from './pages/presence/PresenceSettingsPage'

function Protected({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth()

  if (status === 'loading') {
    return (
      <div className="login-page">
        <div className="card login-card">
          <h1>Woragis Management</h1>
          <p className="muted">Carregando…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectNewPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/finance" element={<FinanceLayout />}>
          <Route index element={<FinanceDashboardPage />} />
          <Route path="income" element={<FinanceIncomePage />} />
          <Route path="expenses" element={<FinanceExpensesPage />} />
          <Route path="transactions" element={<FinanceTransactionsPage />} />
          <Route path="invoices" element={<FinanceInvoicesPage />} />
          <Route path="budgets" element={<FinanceBudgetsPage />} />
        </Route>
        <Route path="/finance/invoices/:id" element={<FinanceInvoiceDetailPage />} />
        <Route path="/content" element={<ContentLayout />}>
          <Route path="leetcode" element={<LeetcodeVideosPage />} />
          <Route path="leetcode/templates" element={<LeetcodeTemplatesPage />} />
          <Route path="leetcode/settings" element={<LeetcodeSettingsPage />} />
          <Route path="leetcode/whatsapp" element={<LeetcodeWhatsappPage />} />
          <Route path="leetcode/whatsapp-templates" element={<LeetcodeWhatsappTemplatesPage />} />
        </Route>
        <Route path="/content/leetcode/:id" element={<LeetcodeVideoDetailPage />} />
        <Route path="/messaging" element={<MessagingLayout />}>
          <Route index element={<MessagingDestinationsPage />} />
          <Route path="templates" element={<MessagingTemplatesPage />} />
          <Route path="jobs" element={<MessagingJobsPage />} />
          <Route path="deliveries" element={<MessagingDeliveriesPage />} />
          <Route path="channels" element={<MessagingChannelsPage />} />
        </Route>
        <Route path="/presence" element={<PresenceLayout />}>
          <Route index element={<PresencePostsPage />} />
          <Route path="campaigns" element={<PresenceCampaignsPage />} />
          <Route path="templates" element={<PresenceTemplatesPage />} />
          <Route path="settings" element={<PresenceSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
