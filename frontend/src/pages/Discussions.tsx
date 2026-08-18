import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { Comment, Decision, User } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'

export default function Discussions() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [decisionId, setDecisionId] = useState(0)
  const [content, setContent] = useState('')

  const { data: comments = [], isLoading } = useQuery<Comment[]>({ queryKey: ['comments'], queryFn: () => api.get('/comments').then(r=>r.data) })
  const { data: decisions = [] } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r=>r.data) })
  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r=>r.data) })

  const createMut = useMutation({
    mutationFn: (d: any) => api.post('/comments', d),
    onSuccess: () => { qc.invalidateQueries({queryKey:['comments']}); setContent(''); toast.success('Comment posted') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/comments/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['comments']}); toast.success('Deleted') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const groupedByDecision = decisions.reduce((acc, d) => {
    const dc = comments.filter(c => c.decision_id === d.id)
    if (dc.length > 0) acc[d.id] = { decision: d, comments: dc }
    return acc
  }, {} as Record<number, { decision: Decision; comments: Comment[] }>)

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Discussions</h1>
        <p className="text-sm text-slate-500 mt-0.5">All decision discussions and meeting notes</p>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-600" /> Add Comment</h2>
        <form onSubmit={e => { e.preventDefault(); createMut.mutate({ decision_id: Number(decisionId), content }) }} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Decision *</label>
            <select required className="input max-w-sm" value={decisionId} onChange={e=>setDecisionId(Number(e.target.value))}>
              <option value={0}>Select decision</option>
              {decisions.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Comment *</label>
            <textarea required className="input" rows={3} value={content} onChange={e=>setContent(e.target.value)} placeholder="Share your thoughts, meeting notes, or discussion points…" />
          </div>
          <button type="submit" disabled={createMut.isPending} className="btn-primary">{createMut.isPending ? 'Posting…' : 'Post Comment'}</button>
        </form>
      </div>

      {isLoading ? <div className="animate-pulse h-32 bg-slate-100 rounded card" /> : (
        <div className="space-y-6">
          {Object.values(groupedByDecision).map(({ decision, comments: dComments }) => (
            <div key={decision.id} className="card">
              <h2 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">{decision.title}</h2>
              <div className="space-y-3">
                {dComments.map(c => {
                  const author = users.find(u=>u.id===c.user_id)
                  return (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 text-indigo-700 text-xs font-bold">
                        {author?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">{author?.full_name ?? `User #${c.user_id}`}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{format(new Date(c.created_at), 'MMM dd, HH:mm')}</span>
                            {user?.id === c.user_id && (
                              <button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(c.id) }} className="text-red-400 hover:text-red-600">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{c.content}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          {!Object.keys(groupedByDecision).length && (
            <div className="card text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No discussions yet. Start the conversation!</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
