import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import type { Approval, Decision, User } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Plus, CheckCircle, XCircle } from 'lucide-react'

export default function Approvals() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ decision_id: 0, approver_id: 0, remarks: '' })

  const { data: approvals = [], isLoading } = useQuery<Approval[]>({ queryKey: ['approvals'], queryFn: () => api.get('/approvals').then(r=>r.data) })
  const { data: decisions = [] } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r=>r.data) })
  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r=>r.data) })

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/approvals', d),
    onSuccess: () => { qc.invalidateQueries({queryKey:['approvals']}); setShowForm(false); toast.success('Approval request created') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, status, remarks }: any) => api.put(`/approvals/${id}`, { status, remarks }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['approvals']}); toast.success('Status updated') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Approvals</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Request Approval</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Request Approval</h2>
          <form onSubmit={e => { e.preventDefault(); createMut.mutate({...form, decision_id: Number(form.decision_id), approver_id: Number(form.approver_id)}) }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Decision *</label>
              <select required className="input" value={form.decision_id} onChange={e=>setForm(f=>({...f,decision_id:Number(e.target.value)}))}>
                <option value={0}>Select decision</option>
                {decisions.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reviewer *</label>
              <select required className="input" value={form.approver_id} onChange={e=>setForm(f=>({...f,approver_id:Number(e.target.value)}))}>
                <option value={0}>Select reviewer</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
              <textarea className="input" rows={2} value={form.remarks} onChange={e=>setForm(f=>({...f,remarks:e.target.value}))} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending} className="btn-primary">{createMut.isPending ? 'Creating…' : 'Create Request'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {isLoading ? <div className="animate-pulse h-32 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Decision</th><th>Reviewer</th><th>Status</th><th>Remarks</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {approvals.map(a => (
                  <tr key={a.id}>
                    <td>{decisions.find(d=>d.id===a.decision_id)?.title ?? `#${a.decision_id}`}</td>
                    <td>{users.find(u=>u.id===a.approver_id)?.full_name ?? `User #${a.approver_id}`}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="max-w-xs truncate">{a.remarks || '—'}</td>
                    <td>{format(new Date(a.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => updateMut.mutate({id:a.id, status:'approved', remarks:a.remarks})} className="text-green-600 hover:text-green-800" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => updateMut.mutate({id:a.id, status:'rejected', remarks:a.remarks})} className="text-red-500 hover:text-red-700" title="Reject"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!approvals.length && <tr><td colSpan={6} className="text-center text-slate-500 py-8">No approvals yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
