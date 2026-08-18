import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '@/lib/api'
import { AppLayout } from '@/components/AppLayout'
import type { DocumentMeta, Decision } from '@/lib/types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Upload, Trash2, Download, FileText, Search } from 'lucide-react'

export default function Documents() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [decisionId, setDecisionId] = useState(0)
  const [file, setFile] = useState<File|null>(null)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  const { data: docs = [], isLoading } = useQuery<DocumentMeta[]>({ queryKey: ['documents'], queryFn: () => api.get('/documents').then(r=>r.data) })
  const { data: decisions = [] } = useQuery<Decision[]>({ queryKey: ['decisions'], queryFn: () => api.get('/decisions').then(r=>r.data) })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/documents/${id}`),
    onSuccess: () => { qc.invalidateQueries({queryKey:['documents']}); toast.success('Document deleted') },
    onError: e => toast.error(getErrorMessage(e)),
  })

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !decisionId) { toast.error('Select a decision and file'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('decision_id', String(decisionId))
      fd.append('file', file)
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      qc.invalidateQueries({queryKey:['documents']})
      setFile(null)
      setDecisionId(0)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Document uploaded')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const filtered = docs.filter(d => d.file_name.toLowerCase().includes(search.toLowerCase()))
  const ICONS: Record<string,string> = { pdf:'🗎',docx:'📝',xlsx:'📊',png:'🖼',jpg:'🖼',jpeg:'🖼' }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload and manage decision evidence files</p>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-indigo-600" /> Upload Document</h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Decision *</label>
            <select required className="input" value={decisionId} onChange={e=>setDecisionId(Number(e.target.value))}>
              <option value={0}>Select decision</option>
              {decisions.map(d=><option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File * (PDF,DOCX,XLSX,PNG,JPG – max 20MB)</label>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" required className="input py-1.5 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700" onChange={e=>setFile(e.target.files?.[0]??null)} />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Uploading…' : 'Upload'}</button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-semibold text-slate-800 flex-1">Uploaded Files</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9 w-48" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? <div className="animate-pulse h-32 bg-slate-100 rounded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead><tr><th>File Name</th><th>Decision</th><th>Type</th><th>Size</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <span className="mr-2">{ICONS[d.file_type] || '📄'}</span>
                      {d.file_name}
                    </td>
                    <td className="text-xs">{decisions.find(dec=>dec.id===d.decision_id)?.title ?? `#${d.decision_id}`}</td>
                    <td className="uppercase text-xs">{d.file_type}</td>
                    <td>{(d.file_size/1024).toFixed(1)} KB</td>
                    <td>{format(new Date(d.uploaded_at),'MMM dd, yyyy')}</td>
                    <td>
                      <div className="flex gap-2">
                        <a href={`/api/documents/${d.id}/download`} className="text-indigo-600 hover:text-indigo-800"><Download className="w-4 h-4" /></a>
                        <button onClick={() => { if(confirm('Delete?')) deleteMut.mutate(d.id) }} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="text-center text-slate-500 py-8">No documents found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
