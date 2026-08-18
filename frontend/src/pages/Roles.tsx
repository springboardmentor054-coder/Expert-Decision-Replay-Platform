import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/lib/types'
import toast from 'react-hot-toast'
import { Shield, Plus } from 'lucide-react'

export default function Roles() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const { data: roles = [], isLoading } = useQuery<Role[]>({ queryKey: ['roles'], queryFn: () => api.get('/roles').then(r=>r.data) })

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/roles', d),
    onSuccess: () => { qc.invalidateQueries({queryKey:['roles']}); setShowForm(false); setForm({name:'',description:''}); toast.success('Role created') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const ROLE_COLORS: Record<string,string> = {
    'Admin': 'bg-purple-100 text-purple-700',
    'Approver': 'bg-blue-100 text-blue-700',
    'Contributor': 'bg-green-100 text-green-700',
    'Viewer': 'bg-gray-100 text-gray-700',
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Shield className="w-6 h-6 text-indigo-600" /> Roles</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage user roles and permissions</p>
        </div>
        {user?.role?.name === 'Admin' ? (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Role</button>
        ) : (
          <div className="text-sm text-slate-500">Log in as an Admin to add roles</div>
        )}
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Create Role</h2>
          <form onSubmit={e => { e.preventDefault(); createMut.mutate(form) }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input required className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Role name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input className="input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Role description" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending} className="btn-primary">{createMut.isPending ? 'Creating…' : 'Create Role'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <div className="animate-pulse h-48 bg-slate-100 rounded card" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(r => (
            <div key={r.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <span className={`badge ${ROLE_COLORS[r.name] ?? 'bg-indigo-100 text-indigo-700'}`}>{r.name}</span>
              </div>
              <p className="text-sm text-slate-600">{r.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
