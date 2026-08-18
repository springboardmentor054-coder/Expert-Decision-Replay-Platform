import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Decisions from '@/pages/Decisions'
import DecisionDetail from '@/pages/DecisionDetail'
import Alternatives from '@/pages/Alternatives'
import Approvals from '@/pages/Approvals'
import Documents from '@/pages/Documents'
import Discussions from '@/pages/Discussions'
import VersionHistory from '@/pages/VersionHistory'
import VoiceRecordings from '@/pages/VoiceRecordings'
import Notifications from '@/pages/Notifications'
import Reports from '@/pages/Reports'
import AuditLogs from '@/pages/AuditLogs'
import Users from '@/pages/Users'
import Roles from '@/pages/Roles'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/decisions" element={<ProtectedRoute><Decisions /></ProtectedRoute>} />
        <Route path="/decisions/:id" element={<ProtectedRoute><DecisionDetail /></ProtectedRoute>} />
        <Route path="/alternatives" element={<ProtectedRoute><Alternatives /></ProtectedRoute>} />
        <Route path="/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><Discussions /></ProtectedRoute>} />
        <Route path="/versions" element={<ProtectedRoute><VersionHistory /></ProtectedRoute>} />
        <Route path="/recordings" element={<ProtectedRoute><VoiceRecordings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
