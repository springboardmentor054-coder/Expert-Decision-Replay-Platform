import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import { format } from 'date-fns'
import { BarChart2, Download, FileText, CheckCircle, Users, ClipboardList } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#4F46E5','#10B981','#EF4444','#F59E0B','#3B82F6']

function exportCSV(data: any[], name: string) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const csv = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k]??'')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `${name}.csv`; a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { data: decisionsReport } = useQuery({ queryKey: ['reports','decisions'], queryFn: () => api.get('/reports/decisions').then(r=>r.data) })
  const { data: approvalsReport } = useQuery({ queryKey: ['reports','approvals'], queryFn: () => api.get('/reports/approvals').then(r=>r.data) })
  const { data: teamsReport } = useQuery({ queryKey: ['reports','teams'], queryFn: () => api.get('/reports/teams').then(r=>r.data) })
  const { data: auditReport } = useQuery({ queryKey: ['reports','audit'], queryFn: () => api.get('/reports/audit').then(r=>r.data) })

  const statusData = decisionsReport ? [
    { name: 'Approved', value: decisionsReport.approved },
    { name: 'Rejected', value: decisionsReport.rejected },
    { name: 'Pending', value: decisionsReport.pending },
  ] : []

  const teamData = (teamsReport?.items || []).map((t: any) => ({ name: t.team, decisions: t.total_decisions, users: t.total_users }))

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><BarChart2 className="w-6 h-6 text-indigo-600" /> Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Comprehensive analytics and summaries</p>
      </div>

      {/* Summary cards */}
      {decisionsReport && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Decisions', value: decisionsReport.total, color: 'bg-indigo-600' },
            { label: 'Approved', value: decisionsReport.approved, color: 'bg-emerald-500' },
            { label: 'Rejected', value: decisionsReport.rejected, color: 'bg-red-500' },
            { label: 'Pending', value: decisionsReport.pending, color: 'bg-amber-500' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className={`w-10 h-10 ${s.color} rounded-lg mx-auto mb-2 flex items-center justify-center`}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status chart */}
        {statusData.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4">Decision Status Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Team chart */}
        {teamData.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-slate-800 mb-4">Decisions by Team</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={teamData}>
                <XAxis dataKey="name" tick={{fontSize:12}} />
                <YAxis tick={{fontSize:12}} />
                <Tooltip />
                <Bar dataKey="decisions" fill="#4F46E5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Decision Report Table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-600" /> Decision Report</h2>
          <button onClick={() => exportCSV(decisionsReport?.items||[], 'decisions-report')} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        {!decisionsReport ? <div className="animate-pulse h-20 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {decisionsReport.items.map((d: any) => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.title}</td>
                    <td>{d.category || '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>{format(new Date(d.created_at), 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approval Report */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Approval Report</h2>
          <button onClick={() => exportCSV(approvalsReport?.items||[], 'approvals-report')} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        {!approvalsReport ? <div className="animate-pulse h-20 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Reviewer</th><th>Approved</th><th>Rejected</th><th>Pending</th></tr></thead>
              <tbody>
                {approvalsReport.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="font-medium">{item.reviewer}</td>
                    <td><span className="badge bg-green-100 text-green-700">{item.approved}</span></td>
                    <td><span className="badge bg-red-100 text-red-700">{item.rejected}</span></td>
                    <td><span className="badge bg-gray-100 text-gray-700">{item.pending}</span></td>
                  </tr>
                ))}
                {!approvalsReport.items.length && <tr><td colSpan={4} className="text-center text-slate-500 py-4">No approval data</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team Report */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Team Report</h2>
          <button onClick={() => exportCSV(teamsReport?.items||[], 'teams-report')} className="btn-secondary text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        {!teamsReport ? <div className="animate-pulse h-20 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Team</th><th>Total Users</th><th>Total Decisions</th><th>Total Approvals</th></tr></thead>
              <tbody>
                {teamsReport.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="font-medium">{item.team}</td>
                    <td>{item.total_users}</td>
                    <td>{item.total_decisions}</td>
                    <td>{item.total_approvals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Summary */}
      {auditReport && (
        <div className="card">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-purple-600" /> Audit Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Logins', value: auditReport.total_logins },
              { label: 'Decisions Created', value: auditReport.decisions_created },
              { label: 'Documents Uploaded', value: auditReport.documents_uploaded },
              { label: 'Comments Added', value: auditReport.comments_added },
              { label: 'Approval Actions', value: auditReport.approval_actions },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
