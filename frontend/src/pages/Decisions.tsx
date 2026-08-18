import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import type { Decision } from '@/lib/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Plus, Trash2, Eye, Search } from 'lucide-react'

const STATUSES = ['open','in_review','approved','rejected']
const CATEGORIES = ['Technology','Finance','Operations','HR','Strategy','Legal','Other']

export default function Decisions() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', problem_statement:'', description:'', category:'', status:'open' })

  const { data: decisions = [], isLoading } = useQuery<Decision[]>({
    queryKey: ['decisions'],
    queryFn: () => api.get('/decisions').then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/decisions', data),
    onSuccess: () => { qc.invalidateQueries({queryKey:['decisions']}); setShowForm(false); setForm({title:'',problem_statement:'',description:'',category:'',status:'open'}); toast.success('Decision created') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/decisions/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['decisions']}); toast.success('Decision deleted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const filtered = decisions.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.category?.toLowerCase().includes(search.toLowerCase()))

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Decisions</h1>
          <p className="text-sm text-slate-500 mt-0.5">{decisions.length} total decisions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Decision
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-slate-800 mb-4">Create New Decision</h2>
          <form onSubmit={e => { e.preventDefault(); createMut.mutate(form) }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input className="input" required value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Decision title" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Problem Statement</label>
              <textarea className="input" rows={2} value={form.problem_statement} onChange={e => setForm(f=>({...f,problem_statement:e.target.value}))} placeholder="What problem are we solving?" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Detailed description..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending} className="btn-primary">
                {createMut.isPending ? 'Creating…' : 'Create Decision'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search decisions…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? (
          <div className="animate-pulse space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-12 bg-slate-100 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="font-medium"><Link to={`/decisions/${d.id}`} className="text-indigo-600 hover:underline">{d.title}</Link></td>
                    <td>{d.category || '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>{format(new Date(d.created_at),'MMM dd, yyyy')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link to={`/decisions/${d.id}`} className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => { if(confirm('Delete this decision?')) deleteMut.mutate(d.id) }} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={5} className="text-center text-slate-500 py-8">No decisions found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
