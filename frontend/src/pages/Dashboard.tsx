import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { Decision, DocumentMeta, User, Notification } from '@/lib/types'
import { StatusBadge } from '@/components/StatusBadge'
import { format, formatDistanceToNow } from 'date-fns'
import { FileText, Files, Users as UsersIcon, Bell, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/decisions'), api.get('/documents'), api.get('/users'), api.get('/notifications')])
      .then(([d, doc, u, n]) => {
        setDecisions(d.data); setDocuments(doc.data); setUsers(u.data); setNotifications(n.data)
      }).finally(() => setLoading(false))
  }, [])

  const approved = decisions.filter(d => d.status === 'approved').length
  const rejected = decisions.filter(d => d.status === 'rejected').length
  const pending = decisions.filter(d => ['open','in_review'].includes(d.status)).length
  const unread = notifications.filter(n => n.status === 'unread').length

  if (loading) return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-slate-200 rounded-xl" />)}
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your decision management platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Decisions" value={decisions.length} icon={FileText} color="bg-indigo-600" sub={`${approved} approved`} />
        <StatCard label="Pending Review" value={pending} icon={Clock} color="bg-amber-500" sub={`${rejected} rejected`} />
        <StatCard label="Documents" value={documents.length} icon={Files} color="bg-teal-500" sub="Uploaded files" />
        <StatCard label="Notifications" value={unread} icon={Bell} color="bg-rose-500" sub="Unread" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Decisions</h2>
            <Link to="/decisions" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {decisions.slice(0, 6).map(d => (
              <Link key={d.id} to={`/decisions/${d.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                <div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">{d.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
                </div>
                <StatusBadge status={d.status} />
              </Link>
            ))}
            {!decisions.length && <p className="text-sm text-slate-500 text-center py-6">No decisions yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Notifications</h2>
            <Link to="/notifications" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 6).map(n => (
              <div key={n.id} className={`p-3 rounded-lg border ${n.status === 'unread' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'}`}>
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
              </div>
            ))}
            {!notifications.length && <p className="text-sm text-slate-500 text-center py-6">No notifications</p>}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
