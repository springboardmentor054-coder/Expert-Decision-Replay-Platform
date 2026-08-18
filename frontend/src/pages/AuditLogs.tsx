import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { AuditLog, User, Decision } from '@/lib/types'
import { format } from 'date-fns'
import { ClipboardList, Search, Filter } from 'lucide-react'

const ACTION_TYPES = ['USER_LOGIN','USER_REGISTERED','DECISION_CREATED','DECISION_UPDATED','DECISION_DELETED','DOCUMENT_UPLOADED','COMMENT_ADDED','APPROVAL_ACTION']

export default function AuditLogs() {
  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('')

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit-logs?limit=500').then(r=>r.data),
  })
  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r=>r.data) })
  const { data: decisions = [] } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r=>r.data) })

  const filtered = logs.filter(l =>
    (!filterUser || String(l.user_id) === filterUser) &&
    (!filterAction || l.action_type === filterAction)
  )

  const ACTION_COLORS: Record<string,string> = {
    USER_LOGIN: 'bg-blue-100 text-blue-700',
    USER_REGISTERED: 'bg-purple-100 text-purple-700',
    DECISION_CREATED: 'bg-green-100 text-green-700',
    DECISION_UPDATED: 'bg-yellow-100 text-yellow-700',
    DECISION_DELETED: 'bg-red-100 text-red-700',
    DOCUMENT_UPLOADED: 'bg-teal-100 text-teal-700',
    COMMENT_ADDED: 'bg-indigo-100 text-indigo-700',
    APPROVAL_ACTION: 'bg-orange-100 text-orange-700',
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-indigo-600" /> Audit Logs
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Complete audit trail of all system actions (read-only)</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter by User</label>
            <select className="input text-sm py-1.5" value={filterUser} onChange={e=>setFilterUser(e.target.value)}>
              <option value="">All users</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Action</label>
            <select className="input text-sm py-1.5" value={filterAction} onChange={e=>setFilterAction(e.target.value)}>
              <option value="">All actions</option>
              {ACTION_TYPES.map(a=><option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button onClick={() => { setFilterUser(''); setFilterAction('') }} className="btn-secondary text-sm py-1.5">Reset</button>
          <span className="text-xs text-slate-500 ml-auto self-end">{filtered.length} records</span>
        </div>
      </div>

      <div className="card">
        {isLoading ? <div className="animate-pulse h-48 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Decision</th>
                  <th>Description</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const user = users.find(u=>u.id===log.user_id)
                  const decision = decisions.find(d=>d.id===log.decision_id)
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="text-xs whitespace-nowrap">{format(new Date(log.created_at),'MMM dd HH:mm:ss')}</td>
                      <td className="text-sm">{user?.full_name ?? (log.user_id ? `#${log.user_id}` : '—')}</td>
                      <td>
                        <span className={`badge text-xs ${ACTION_COLORS[log.action_type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="text-xs text-slate-600">{decision?.title ?? (log.decision_id ? `#${log.decision_id}` : '—')}</td>
                      <td className="text-xs text-slate-600 max-w-xs truncate">{log.description || '—'}</td>
                      <td className="text-xs text-slate-400">{log.ip_address || '—'}</td>
                    </tr>
                  )
                })}
                {!filtered.length && <tr><td colSpan={6} className="text-center text-slate-500 py-8">No audit logs found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
