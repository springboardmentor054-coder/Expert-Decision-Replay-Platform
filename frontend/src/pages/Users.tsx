import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { User, Role } from '@/lib/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Users as UsersIcon, Trash2, UserCheck, UserX, Search } from 'lucide-react'

export default function Users() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const { data: users = [], isLoading } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r=>r.data) })
  const { data: roles = [] } = useQuery<Role[]>({ queryKey: ['roles'], queryFn: () => api.get('/roles').then(r=>r.data) })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/users/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({queryKey:['users']}); toast.success('User updated') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['users']}); toast.success('User deleted') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><UsersIcon className="w-6 h-6 text-indigo-600" /> Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? <div className="animate-pulse h-48 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{u.email}</td>
                    <td>
                      <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                        value={u.role_id}
                        onChange={e => updateMut.mutate({id:u.id, data:{role_id:Number(e.target.value)}})}>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{format(new Date(u.created_at), 'MMM dd, yyyy')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => updateMut.mutate({id:u.id, data:{is_active:!u.is_active}})}
                          className={u.is_active ? 'text-amber-500 hover:text-amber-700' : 'text-green-600 hover:text-green-800'}
                          title={u.is_active ? 'Deactivate' : 'Activate'}>
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { if(confirm('Delete user?')) deleteMut.mutate(u.id) }} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="text-center text-slate-500 py-8">No users found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
