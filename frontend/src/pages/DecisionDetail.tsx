import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import type { Decision, Alternative, Approval, Comment, DocumentMeta, DecisionVersion } from '@/lib/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, History, CheckCircle, MessageSquare, Files } from 'lucide-react'

export default function DecisionDetail() {
  const { id } = useParams<{id: string}>()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'alternatives'|'approvals'|'comments'|'documents'|'versions'>('alternatives')
  const [commentText, setCommentText] = useState('')

  const { data: decision } = useQuery<Decision>({ queryKey: ['decision', id], queryFn: () => api.get(`/decisions/${id}`).then(r=>r.data) })
  const { data: alts = [] } = useQuery<Alternative[]>({ queryKey: ['alternatives', id], queryFn: () => api.get(`/alternatives?decision_id=${id}`).then(r=>r.data) })
  const { data: approvals = [] } = useQuery<Approval[]>({ queryKey: ['approvals', id], queryFn: () => api.get(`/approvals?decision_id=${id}`).then(r=>r.data) })
  const { data: comments = [] } = useQuery<Comment[]>({ queryKey: ['comments', id], queryFn: () => api.get(`/comments?decision_id=${id}`).then(r=>r.data) })
  const { data: documents = [] } = useQuery<DocumentMeta[]>({ queryKey: ['docs', id], queryFn: () => api.get(`/decisions/${id}/documents`).then(r=>r.data) })
  const { data: versions = [] } = useQuery<DecisionVersion[]>({ queryKey: ['versions', id], queryFn: () => api.get(`/decisions/${id}/versions`).then(r=>r.data) })

  const commentMut = useMutation({
    mutationFn: (content: string) => api.post('/comments', { decision_id: Number(id), content }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['comments',id]}); setCommentText('') ; toast.success('Comment added') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const snapMut = useMutation({
    mutationFn: () => api.post(`/decisions/${id}/versions`, { change_summary: 'Manual snapshot' }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['versions',id]}); toast.success('Version snapshot saved') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  if (!decision) return <AppLayout><div className="animate-pulse h-8 bg-slate-200 rounded w-64 mb-4" /></AppLayout>

  const TABS = [
    { key: 'alternatives', label: 'Alternatives', count: alts.length },
    { key: 'approvals', label: 'Approvals', count: approvals.length },
    { key: 'comments', label: 'Comments', count: comments.length },
    { key: 'documents', label: 'Documents', count: documents.length },
    { key: 'versions', label: 'Version History', count: versions.length },
  ]

  return (
    <AppLayout>
      <div className="mb-6">
        <Link to="/decisions" className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Decisions
        </Link>
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{decision.title}</h1>
              {decision.category && <p className="text-sm text-indigo-600 font-medium mt-1">{decision.category}</p>}
            </div>
            <StatusBadge status={decision.status} />
          </div>
          {decision.problem_statement && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-800 mb-1">Problem Statement</p>
              <p className="text-sm text-amber-700">{decision.problem_statement}</p>
            </div>
          )}
          {decision.description && <p className="text-slate-600 mt-3 text-sm">{decision.description}</p>}
          <div className="flex gap-4 mt-4 text-xs text-slate-500">
            <span>Created: {format(new Date(decision.created_at), 'MMM dd, yyyy HH:mm')}</span>
            <span>Updated: {format(new Date(decision.updated_at), 'MMM dd, yyyy HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab===t.key ? 'bg-white text-indigo-600 border border-b-white border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label} <span className="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'alternatives' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Alternatives</h2>
            </div>
            {!alts.length ? <p className="text-slate-500 text-sm">No alternatives added yet.</p> : (
              <div className="space-y-3">
                {alts.map(a => (
                  <div key={a.id} className={`p-4 border rounded-lg ${a.is_selected ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-800">{a.title}</h3>
                      {a.is_selected && <span className="badge bg-green-100 text-green-700">Selected</span>}
                    </div>
                    {a.description && <p className="text-sm text-slate-600 mt-1">{a.description}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      {a.cost != null && <span>Cost: ${a.cost.toLocaleString()}</span>}
                      {a.risk_level && <span>Risk: {a.risk_level}</span>}
                      {a.feasibility && <span>Feasibility: {a.feasibility}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'approvals' && (
          <div>
            <h2 className="font-semibold mb-4">Approvals</h2>
            {!approvals.length ? <p className="text-slate-500 text-sm">No approvals yet.</p> : (
              <table className="w-full table-auto">
                <thead><tr><th>Reviewer</th><th>Status</th><th>Remarks</th><th>Date</th></tr></thead>
                <tbody>
                  {approvals.map(a => (
                    <tr key={a.id}>
                      <td>User #{a.approver_id}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>{a.remarks || '—'}</td>
                      <td>{format(new Date(a.created_at), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'comments' && (
          <div>
            <h2 className="font-semibold mb-4">Discussion</h2>
            <div className="space-y-3 mb-6">
              {comments.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>User #{c.user_id}</span>
                    <span>{format(new Date(c.created_at), 'MMM dd, HH:mm')}</span>
                  </div>
                  <p className="text-sm text-slate-700">{c.content}</p>
                </div>
              ))}
              {!comments.length && <p className="text-slate-500 text-sm">No comments yet. Start the discussion!</p>}
            </div>
            <div className="flex gap-3">
              <textarea className="input flex-1" rows={2} placeholder="Add a comment…" value={commentText} onChange={e=>setCommentText(e.target.value)} />
              <button onClick={() => commentMut.mutate(commentText)} disabled={!commentText.trim() || commentMut.isPending} className="btn-primary self-end">Post</button>
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div>
            <h2 className="font-semibold mb-4">Documents</h2>
            {!documents.length ? <p className="text-slate-500 text-sm">No documents uploaded yet.</p> : (
              <table className="w-full table-auto">
                <thead><tr><th>File Name</th><th>Type</th><th>Size</th><th>Date</th><th>Download</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.id}>
                      <td>{d.file_name}</td>
                      <td className="uppercase">{d.file_type}</td>
                      <td>{(d.file_size/1024).toFixed(1)} KB</td>
                      <td>{format(new Date(d.uploaded_at), 'MMM dd')}</td>
                      <td><a href={`/api/documents/${d.id}/download`} className="text-indigo-600 hover:underline text-xs">Download</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'versions' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">Version History</h2>
              <button onClick={() => snapMut.mutate()} disabled={snapMut.isPending} className="btn-secondary text-sm flex items-center gap-1">
                <History className="w-4 h-4" /> Snapshot Now
              </button>
            </div>
            {!versions.length ? <p className="text-slate-500 text-sm">No version history yet.</p> : (
              <div className="space-y-3">
                {versions.map(v => (
                  <div key={v.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-indigo-700 text-xs font-bold">v{v.version_number}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800 text-sm">{v.title}</p>
                        <StatusBadge status={v.status} />
                      </div>
                      {v.change_summary && <p className="text-sm text-slate-600 mt-1">{v.change_summary}</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        Modified by User #{v.modified_by} · {format(new Date(v.modified_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
