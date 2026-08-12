import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PreferencesProvider } from './context/PreferencesContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DecisionList from './pages/DecisionList';
import CreateDecision from './pages/CreateDecision';
import DecisionEdit from './pages/DecisionEdit';
import DecisionDetail from './pages/DecisionDetail';
import AlternativesView from './pages/AlternativesView';
import AddAlternative from './pages/AddAlternative';
import EditAlternative from './pages/EditAlternative';
import AlternativesCompare from './pages/AlternativesCompare';
import DocumentsView from './pages/DocumentsView';
import UploadDocument from './pages/UploadDocument';
import Discussion from './pages/Discussion';
import VersionHistory from './pages/VersionHistory';
import GlobalAlternatives from './pages/GlobalAlternatives';
import GlobalDocuments from './pages/GlobalDocuments';
import GlobalDiscussions from './pages/GlobalDiscussions';
import GlobalVersionHistory from './pages/GlobalVersionHistory';
import MyDecisions from './pages/MyDecisions';
import DraftedDecisions from './pages/DraftedDecisions';
import Reviews from './pages/Reviews';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import AccessLog from './pages/AccessLog';
import AuditLogs from './pages/AuditLogs';
import ReportsLayout from './layouts/ReportsLayout';
import DecisionReport from './pages/reports/DecisionReport';
import ApprovalReport from './pages/reports/ApprovalReport';
import TeamReport from './pages/reports/TeamReport';
import AuditReport from './pages/reports/AuditReport';
import Permissions from './pages/Permissions';
import PendingApprovals from './pages/PendingApprovals';
import ApprovalDetail from './pages/ApprovalDetail';
import ApprovalHistory from './pages/ApprovalHistory';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <PreferencesProvider>
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="decisions" element={<DecisionList />} />
            <Route path="decisions/new" element={<CreateDecision />} />
            <Route path="decisions/:id" element={<DecisionDetail />} />
            <Route path="decisions/:id/edit" element={<DecisionEdit />} />
            <Route path="decisions/:decisionId/alternatives" element={<AlternativesView />} />
            <Route path="decisions/:decisionId/alternatives/new" element={<AddAlternative />} />
            <Route path="decisions/:decisionId/alternatives/compare" element={<AlternativesCompare />} />
            <Route path="decisions/:decisionId/alternatives/:altId/edit" element={<EditAlternative />} />
            <Route path="decisions/:decisionId/documents" element={<DocumentsView />} />
            <Route path="decisions/:decisionId/documents/upload" element={<UploadDocument />} />
            <Route path="decisions/:decisionId/discussion" element={<Discussion />} />
            <Route path="decisions/:decisionId/versions" element={<VersionHistory />} />
            <Route path="alternatives" element={<GlobalAlternatives />} />
            <Route path="documents" element={<GlobalDocuments />} />
            <Route path="documents/upload" element={<UploadDocument />} />
            <Route path="discussions" element={<GlobalDiscussions />} />
            <Route path="version-history" element={<GlobalVersionHistory />} />
            <Route path="my-decisions" element={<MyDecisions />} />
            <Route path="drafted-decisions" element={<DraftedDecisions />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="users" element={<Users />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="access-log" element={<AccessLog />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="reports" element={<ReportsLayout />}>
              <Route index element={<Navigate to="decisions" replace />} />
              <Route path="decisions" element={<DecisionReport />} />
              <Route path="approvals" element={<ApprovalReport />} />
              <Route path="teams" element={<TeamReport />} />
              <Route path="audit" element={<AuditReport />} />
            </Route>
            <Route path="approvals" element={<PendingApprovals />} />
            <Route path="approvals/:id" element={<ApprovalDetail />} />
            <Route path="approval-history" element={<ApprovalHistory />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
    </PreferencesProvider>
    </GoogleOAuthProvider>
  );
}

export default App;