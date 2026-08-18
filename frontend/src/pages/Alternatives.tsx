import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { Alternative, Decision } from '@/lib/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Plus, Trash2, Check } from 'lucide-react'

export default function Alternatives() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ decision_id: 0, title: '', description: '', cost: '', risk_level: '', feasibility: '', is_selected: false })

  const { data: alts = [], isLoading } = useQuery<Alternative[]>({ queryKey: ['alternatives'], queryFn: () => api.get('/alternatives').then(r => r.data) })
  const { data: decisions = [] } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r => r.data) })

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/alternatives', d),
    onSuccess: () => { qc.invalidateQueries({queryKey:['alternatives']}); setShowForm(false); toast.success('Alternative added') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/alternatives/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['alternatives']}); toast.success('Deleted') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const RISK = ['Low','Medium','High']
  const FEASIBILITY = ['Low','Medium','High']

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Alternatives</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Alternative</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Add Alternative</h2>
          <form onSubmit={e => { e.preventDefault(); createMut.mutate({...form, decision_id: Number(form.decision_id), cost: form.cost ? Number(form.cost) : null}) }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Decision *</label>
              <select required className="input" value={form.decision_id} onChange={e => setForm(f=>({...f,decision_id:Number(e.target.value)}))}>
                <option value={0}>Select decision</option>
                {decisions.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input required className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Alternative title" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cost ($)</label>
              <input type="number" className="input" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Risk Level</label>
              <select className="input" value={form.risk_level} onChange={e=>setForm(f=>({...f,risk_level:e.target.value}))}>
                <option value="">Select</option>
                {RISK.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Feasibility</label>
              <select className="input" value={form.feasibility} onChange={e=>setForm(f=>({...f,feasibility:e.target.value}))}>
                <option value="">Select</option>
                {FEASIBILITY.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending} className="btn-primary">{createMut.isPending ? 'Adding…' : 'Add Alternative'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {isLoading ? <div className="animate-pulse h-32 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Title</th><th>Decision</th><th>Cost</th><th>Risk</th><th>Feasibility</th><th>Selected</th><th>Actions</th></tr></thead>
              <tbody>
                {alts.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.title}</td>
                    <td>{decisions.find(d=>d.id===a.decision_id)?.title ?? `#${a.decision_id}`}</td>
                    <td>{a.cost != null ? `$${a.cost.toLocaleString()}` : '—'}</td>
                    <td>{a.risk_level || '—'}</td>
                    <td>{a.feasibility || '—'}</td>
                    <td>{a.is_selected ? <Check className="w-4 h-4 text-green-600" /> : '—'}</td>
                    <td>
                      <button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(a.id) }} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {!alts.length && <tr><td colSpan={7} className="text-center text-slate-500 py-8">No alternatives yet</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
