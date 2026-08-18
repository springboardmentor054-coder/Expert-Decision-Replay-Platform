import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import type { Notification } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const qc = useQueryClient()
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  })

  const readMut = useMutation({
    mutationFn: (id: number) => api.put(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: e => toast.error(getErrorMessage(e)),
  })

  const readAllMut = useMutation({
    mutationFn: () => api.put('/notifications/read-all', {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: e => toast.error(getErrorMessage(e)),
  })

  const unread = notifications.filter(n => n.status === 'unread')

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{unread.length} unread of {notifications.length} total</p>
        </div>
        {unread.length > 0 && (
          <button onClick={() => readAllMut.mutate()} disabled={readAllMut.isPending} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_,i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`card transition-all ${n.status === 'unread' ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.status === 'unread' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-semibold text-sm ${n.status === 'unread' ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                    <span className="text-xs text-slate-400 shrink-0">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{format(new Date(n.created_at), 'MMM dd, yyyy · HH:mm')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {n.status === 'unread' && (
                    <button onClick={() => readMut.mutate(n.id)} className="text-indigo-600 hover:text-indigo-800" title="Mark read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteMut.mutate(n.id)} className="text-red-400 hover:text-red-600" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
