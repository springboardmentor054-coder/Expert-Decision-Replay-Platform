import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { VoiceRecording, Decision, User } from '@/lib/types'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Mic, Upload, Trash2, Download, MessageCircle, Volume2 } from 'lucide-react'
import { useEffect } from 'react'

export default function VoiceRecordings() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ title: '', decision_id: '' })
  const [file, setFile] = useState<File|null>(null)
  const [uploading, setUploading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number|null>(null)
  const [replyText, setReplyText] = useState('')
  const [audioUrls, setAudioUrls] = useState<Record<number,string>>({})

  const { data: recordings = [], isLoading } = useQuery<VoiceRecording[]>({ queryKey: ['recordings'], queryFn: () => api.get('/voice-recordings').then(r=>r.data) })
  const { data: decisions = [] } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r=>r.data) })
  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r=>r.data) })

  const isAdmin = user?.role?.name === 'Admin'

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !form.title) { toast.error('Please provide title and audio file'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      if (form.decision_id) fd.append('decision_id', form.decision_id)
      fd.append('file', file)
      await api.post('/voice-recordings', fd, { headers: {'Content-Type':'multipart/form-data'} })
      qc.invalidateQueries({queryKey:['recordings']})
      setForm({title:'',decision_id:''})
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Recording uploaded! Admins have been notified.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const replyMut = useMutation({
    mutationFn: ({ id, reply }: {id:number,reply:string}) => api.put(`/voice-recordings/${id}/reply`, { reply }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['recordings']}); setReplyingTo(null); setReplyText(''); toast.success('Reply sent') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  const deleteMut = useMutation({
    mutationFn: (id:number) => api.delete(`/voice-recordings/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['recordings']}); toast.success('Deleted') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Mic className="w-6 h-6 text-indigo-600" /> Voice Recordings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload voice recordings – admins will reply with insights</p>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-indigo-600" /> Upload Recording</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input required className="input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Recording title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Decision (optional)</label>
            <select className="input" value={form.decision_id} onChange={e=>setForm(f=>({...f,decision_id:e.target.value}))}>
              <option value="">No decision</option>
              {decisions.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audio File * (MP3,WAV,OGG,WEBM,M4A)</label>
            <input ref={fileRef} type="file" accept=".mp3,.wav,.ogg,.webm,.m4a,.aac" required
              className="input py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700"
              onChange={e=>setFile(e.target.files?.[0]??null)} />
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Uploading…' : 'Upload Recording'}</button>
          </div>
        </form>
      </div>

      {isLoading ? <div className="animate-pulse h-32 bg-slate-100 rounded card" /> : (
        <div className="space-y-4">
          {recordings.map(rec => {
            const uploader = users.find(u=>u.id===rec.uploaded_by)
            const decision = decisions.find(d=>d.id===rec.decision_id)
            return (
              <div key={rec.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">{rec.title}</p>
                        {/* Inline audio player */}
                        <div className="mt-2">
                          <audio id={`audio-${rec.id}`} controls src={audioUrls[rec.id]} className="w-full" />
                          {!audioUrls[rec.id] && (
                            <div className="mt-2">
                              <button type="button" onClick={async () => {
                                try {
                                  const res = await api.get(`/voice-recordings/${rec.id}/download`, { responseType: 'blob' })
                                  const contentType = res.headers['content-type']

const blob = new Blob([res.data], {
  type: typeof contentType === 'string' ? contentType : undefined
})
                                  const url = URL.createObjectURL(blob)
                                  setAudioUrls(a => ({ ...a, [rec.id]: url }))
                                  // small delay then play
                                  setTimeout(() => {
                                    const el = document.getElementById(`audio-${rec.id}`) as HTMLAudioElement | null
                                    el?.play()
                                  }, 100)
                                } catch (err) {
                                  toast.error(getErrorMessage(err))
                                }
                              }} className="btn-secondary text-sm">Fetch & Play</button>
                            </div>
                          )}
                        </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>By {uploader?.full_name ?? `User #${rec.uploaded_by}`}</span>
                        {decision && <><span>·</span><span>{decision.title}</span></>}
                        <span>·</span>
                        <span>{format(new Date(rec.uploaded_at),'MMM dd, yyyy HH:mm')}</span>
                        {rec.file_size && <><span>·</span><span>{(rec.file_size/1024).toFixed(1)} KB</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/api/voice-recordings/${rec.id}/download`} className="text-indigo-600 hover:text-indigo-800" title="Download">
                      <Download className="w-4 h-4" />
                    </a>
                    {(isAdmin || rec.uploaded_by === user?.id) && (
                      <button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(rec.id) }} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Admin reply */}
                {rec.admin_reply && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> Admin Reply</p>
                    <p className="text-sm text-green-800">{rec.admin_reply}</p>
                    {rec.admin_replied_at && (
                      <p className="text-xs text-green-600 mt-1">{format(new Date(rec.admin_replied_at),'MMM dd, yyyy HH:mm')}</p>
                    )}
                  </div>
                )}

                {isAdmin && !rec.admin_reply && (
                  <div className="mt-4">
                    {replyingTo === rec.id ? (
                      <div className="flex gap-3">
                        <textarea className="input flex-1 text-sm" rows={2} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type your admin reply…" />
                        <div className="flex flex-col gap-2">
                          <button onClick={() => replyMut.mutate({id:rec.id,reply:replyText})} disabled={!replyText.trim()||replyMut.isPending} className="btn-primary text-sm">Send Reply</button>
                          <button onClick={() => setReplyingTo(null)} className="btn-secondary text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReplyingTo(rec.id)} className="btn-secondary text-sm flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" /> Reply as Admin
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {/* cleanup object URLs when recordings change/unmount */}
          {Object.keys(audioUrls).length > 0 && (
            <CleanupAudioUrls urls={audioUrls} onClear={() => setAudioUrls({})} />
          )}
          {!recordings.length && (
            <div className="card text-center py-12">
              <Mic className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No recordings yet. Upload the first one above!</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}

function CleanupAudioUrls({ urls, onClear }: { urls: Record<number,string>, onClear: () => void }) {
  useEffect(() => {
    return () => {
      Object.values(urls).forEach(u => { try { URL.revokeObjectURL(u) } catch {} })
      onClear()
    }
  }, [])
  return null
}
