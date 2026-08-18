import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  LayoutDashboard, FileText, GitBranch, CheckCircle, MessageSquare,
  Upload, Users, Shield, Bell, BarChart2, Mic, ClipboardList,
  History, LogOut, Menu, X, ChevronDown, ChevronUp
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Decisions', to: '/decisions', icon: FileText },
  { label: 'Alternatives', to: '/alternatives', icon: GitBranch },
  { label: 'Approvals', to: '/approvals', icon: CheckCircle },
  { label: 'Documents', to: '/documents', icon: Upload },
  { label: 'Discussions', to: '/discussions', icon: MessageSquare },
  { label: 'Version History', to: '/versions', icon: History },
  { label: 'Voice Recordings', to: '/recordings', icon: Mic },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Reports', to: '/reports', icon: BarChart2 },
  { label: 'Audit Logs', to: '/audit-logs', icon: ClipboardList },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Roles', to: '/roles', icon: Shield },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { data: notificationsData } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => api.get('/notifications').then(r => r.data),
  refetchInterval: 15000,
})

const notifs = Array.isArray(notificationsData)
  ? notificationsData
  : Array.isArray(notificationsData?.notifications)
    ? notificationsData.notifications
    : []

const unreadCount = notifs.filter(
  (n: any) => n.status === 'unread'
).length

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-200 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-200">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 text-sm leading-tight">Decision</p>
              <p className="text-xs text-indigo-600 font-medium">Replay Platform</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-slate-400 hover:text-slate-600">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-0.5">
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} relative`
              }
            >
              <div className="relative shrink-0">
                <Icon className="w-4 h-4" />
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-indigo-700 font-semibold text-xs">
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-slate-800 truncate">{user?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role?.name}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
