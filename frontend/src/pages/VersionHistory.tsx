import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import type { Decision, DecisionVersion, User } from '@/lib/types'
import { format } from 'date-fns'
import { History, ChevronDown, ChevronRight } from 'lucide-react'

export default function VersionHistory() {
  const [expandedDecision, setExpandedDecision] = useState<number|null>(null)
  const [versions, setVersions] = useState<Record<number,DecisionVersion[]>>({})

  const { data: decisions = [], isLoading } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r=>r.data) })
  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r=>r.data) })

  async function loadVersions(decisionId: number) {
    if (expandedDecision === decisionId) { setExpandedDecision(null); return }
    setExpandedDecision(decisionId)
    if (!versions[decisionId]) {
      const { data } = await api.get(`/decisions/${decisionId}/versions`)
      setVersions(v => ({...v, [decisionId]: data}))
    }
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><History className="w-6 h-6 text-indigo-600" /> Version History</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track all changes made to decisions over time</p>
      </div>

      {isLoading ? <div className="animate-pulse h-32 bg-slate-100 rounded card" /> : (
        <div className="space-y-3">
          {decisions.map(d => (
            <div key={d.id} className="card">
              <button onClick={() => loadVersions(d.id)} className="w-full flex items-center justify-between text-left">
                <div>
                  <p className="font-semibold text-slate-800">{d.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{d.category && `${d.category} · `}Created {format(new Date(d.created_at),'MMM dd, yyyy')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.status} />
                  {expandedDecision === d.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expandedDecision === d.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {versions[d.id] === undefined ? (
                    <div className="animate-pulse h-16 bg-slate-100 rounded" />
                  ) : versions[d.id].length === 0 ? (
                    <p className="text-sm text-slate-500">No version history available.</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-slate-200" />
                      <div className="space-y-4">
                        {versions[d.id].map(v => {
                          const modifier = users.find(u=>u.id===v.modified_by)
                          return (
                            <div key={v.id} className="relative flex gap-4 pl-8">
                              <div className="absolute left-0 w-7 h-7 bg-indigo-100 border-2 border-indigo-200 rounded-full flex items-center justify-center">
                                <span className="text-indigo-700 text-xs font-bold">v{v.version_number}</span>
                              </div>
                              <div className="flex-1 pb-2">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-slate-800 text-sm">{v.title}</p>
                                  <StatusBadge status={v.status} />
                                </div>
                                {v.change_summary && (
                                  <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded px-2 py-1 border-l-2 border-indigo-300">{v.change_summary}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                                  <span>By {modifier?.full_name ?? `User #${v.modified_by}`}</span>
                                  <span>·</span>
                                  <span>{format(new Date(v.modified_at),'MMM dd, yyyy · HH:mm')}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {!decisions.length && (
            <div className="card text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No decisions to show history for.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}
