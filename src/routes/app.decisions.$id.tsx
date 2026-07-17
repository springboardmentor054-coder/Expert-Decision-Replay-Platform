import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Trash2, Paperclip, Download, Star } from "lucide-react";

export const Route = createFileRoute("/app/decisions/$id")({
  component: DecisionDetail,
});

const STATUSES = ["draft", "under_review", "approved", "rejected", "archived"] as const;

function DecisionDetail() {
  const { id } = Route.useParams();
  const { user, roles } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  const dq = useQuery({
    queryKey: ["decision", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("decisions").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const d = dq.data;
  const canEdit = !!user && d && (d.created_by === user.id || roles.includes("manager") || roles.includes("administrator"));
  const canDelete = !!user && d && (d.created_by === user.id || roles.includes("administrator"));

  async function remove() {
    if (!confirm("Delete this decision?")) return;
    const { error } = await supabase.from("decisions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    nav({ to: "/app/decisions" });
  }

  if (dq.isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!d) return <div className="p-8 text-muted-foreground">Decision not found.</div>;

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link to="/app/decisions" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> All decisions</Link>
          <h1 className="text-2xl font-bold mt-2 truncate">{d.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{d.status.replace("_", " ")}</Badge>
            <span className="text-xs text-muted-foreground">v{d.version} • {d.category ?? "Uncategorized"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && <StatusChanger id={id} status={d.status} onChange={() => qc.invalidateQueries({ queryKey: ["decision", id] })} />}
          {canDelete && <Button variant="destructive" size="sm" onClick={remove}><Trash2 className="h-4 w-4" /> Delete</Button>}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewEdit id={id} canEdit={!!canEdit} initial={d} />
        </TabsContent>
        <TabsContent value="alternatives" className="mt-4">
          <AlternativesTab decisionId={id} canEdit={!!canEdit} />
        </TabsContent>
        <TabsContent value="discussion" className="mt-4">
          <DiscussionTab decisionId={id} />
        </TabsContent>
        <TabsContent value="attachments" className="mt-4">
          <AttachmentsTab decisionId={id} canEdit={!!canEdit} />
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <VersionsTab decisionId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusChanger({ id, status, onChange }: { id: string; status: string; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <Select value={status} onValueChange={async (v) => {
      setBusy(true);
      const { error } = await supabase.from("decisions").update({ status: v as never }).eq("id", id);
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Status updated");
      onChange();
    }}>
      <SelectTrigger className="w-44" disabled={busy}><SelectValue /></SelectTrigger>
      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}</SelectContent>
    </Select>
  );
}

function OverviewEdit({ id, canEdit, initial }: { id: string; canEdit: boolean; initial: any }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(initial.title);
  const [problem, setProblem] = useState(initial.problem_statement);
  const [category, setCategory] = useState(initial.category ?? "");
  const [criteria, setCriteria] = useState(initial.evaluation_criteria ?? "");
  const [risks, setRisks] = useState(initial.risks ?? "");
  const [finalDecision, setFinalDecision] = useState(initial.final_decision ?? "");
  const [outcome, setOutcome] = useState(initial.outcome ?? "");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("decisions").update({
      title, problem_statement: problem, category: category || null,
      evaluation_criteria: criteria || null, risks: risks || null,
      final_decision: finalDecision || null, outcome: outcome || null,
    }).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["decision", id] });
    qc.invalidateQueries({ queryKey: ["versions", id] });
  }

  if (!canEdit) {
    return (
      <div className="space-y-4">
        <Field label="Problem statement">{initial.problem_statement}</Field>
        <Field label="Evaluation criteria">{initial.evaluation_criteria || "—"}</Field>
        <Field label="Risks">{initial.risks || "—"}</Field>
        <Field label="Final decision">{initial.final_decision || "—"}</Field>
        <Field label="Outcome">{initial.outcome || "—"}</Field>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
      <div><Label>Problem statement</Label><Textarea rows={4} value={problem} onChange={(e) => setProblem(e.target.value)} /></div>
      <div><Label>Evaluation criteria</Label><Textarea rows={3} value={criteria} onChange={(e) => setCriteria(e.target.value)} /></div>
      <div><Label>Risks</Label><Textarea rows={3} value={risks} onChange={(e) => setRisks(e.target.value)} /></div>
      <div><Label>Final decision</Label><Textarea rows={3} value={finalDecision} onChange={(e) => setFinalDecision(e.target.value)} /></div>
      <div><Label>Outcome</Label><Textarea rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} /></div>
      <Button type="submit" disabled={busy}>Save changes</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm">{children}</div>
    </div>
  );
}

function AlternativesTab({ decisionId, canEdit }: { decisionId: string; canEdit: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["alternatives", decisionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("alternatives").select("*").eq("decision_id", decisionId).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const [open, setOpen] = useState(false);

  async function selectOne(altId: string) {
    await supabase.from("alternatives").update({ is_selected: false }).eq("decision_id", decisionId);
    await supabase.from("alternatives").update({ is_selected: true }).eq("id", altId);
    qc.invalidateQueries({ queryKey: ["alternatives", decisionId] });
  }

  async function del(altId: string) {
    await supabase.from("alternatives").delete().eq("id", altId);
    qc.invalidateQueries({ queryKey: ["alternatives", decisionId] });
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div>
          {open ? <AlternativeForm decisionId={decisionId} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["alternatives", decisionId] }); }} onCancel={() => setOpen(false)} />
            : <Button onClick={() => setOpen(true)}>Add alternative</Button>}
        </div>
      )}
      {q.data?.length ? q.data.map((a) => (
        <Card key={a.id}>
          <CardHeader className="flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {a.title}
                {a.is_selected && <Badge className="ml-1"><Star className="h-3 w-3" /> Selected</Badge>}
              </CardTitle>
              {a.description && <div className="text-sm text-muted-foreground mt-1">{a.description}</div>}
            </div>
            {canEdit && (
              <div className="flex gap-1">
                {!a.is_selected && <Button size="sm" variant="outline" onClick={() => selectOne(a.id)}>Mark selected</Button>}
                <Button size="sm" variant="ghost" onClick={() => del(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Pros">{a.pros || "—"}</Field>
            <Field label="Cons">{a.cons || "—"}</Field>
            <Field label="Estimated cost">{a.estimated_cost ?? "—"}</Field>
            <Field label="Feasibility">{a.feasibility || "—"}</Field>
            <Field label="Risk level">{a.risk_level || "—"}</Field>
          </CardContent>
        </Card>
      )) : <div className="text-sm text-muted-foreground">No alternatives recorded yet.</div>}
    </div>
  );
}

function AlternativeForm({ decisionId, onDone, onCancel }: { decisionId: string; onDone: () => void; onCancel: () => void }) {
  const [f, setF] = useState({ title: "", description: "", pros: "", cons: "", estimated_cost: "", feasibility: "", risk_level: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("alternatives").insert({
      decision_id: decisionId,
      title: f.title, description: f.description || null,
      pros: f.pros || null, cons: f.cons || null,
      estimated_cost: f.estimated_cost ? Number(f.estimated_cost) : null,
      feasibility: f.feasibility || null, risk_level: f.risk_level || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    onDone();
  }
  return (
    <Card><CardContent className="pt-6">
      <form className="space-y-3" onSubmit={submit}>
        <div><Label>Title</Label><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></div>
        <div><Label>Description</Label><Textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Pros</Label><Textarea rows={2} value={f.pros} onChange={(e) => setF({ ...f, pros: e.target.value })} /></div>
          <div><Label>Cons</Label><Textarea rows={2} value={f.cons} onChange={(e) => setF({ ...f, cons: e.target.value })} /></div>
          <div><Label>Estimated cost</Label><Input type="number" value={f.estimated_cost} onChange={(e) => setF({ ...f, estimated_cost: e.target.value })} /></div>
          <div><Label>Feasibility</Label><Input value={f.feasibility} onChange={(e) => setF({ ...f, feasibility: e.target.value })} placeholder="High / Medium / Low" /></div>
          <div><Label>Risk level</Label><Input value={f.risk_level} onChange={(e) => setF({ ...f, risk_level: e.target.value })} placeholder="High / Medium / Low" /></div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>Save alternative</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </CardContent></Card>
  );
}

function DiscussionTab({ decisionId }: { decisionId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const q = useQuery({
    queryKey: ["comments", decisionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("comments")
        .select("*, profile:profiles!comments_user_id_fkey(full_name,email,avatar_url)")
        .eq("decision_id", decisionId).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  async function add() {
    if (!body.trim() || !user) return;
    const { error } = await supabase.from("comments").insert({ decision_id: decisionId, user_id: user.id, body });
    if (error) return toast.error(error.message);
    setBody("");
    qc.invalidateQueries({ queryKey: ["comments", decisionId] });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {q.data?.length ? q.data.map((c: any) => (
          <div key={c.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{c.profile?.full_name || c.profile?.email || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</div>
            </div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{c.body}</div>
          </div>
        )) : <div className="text-sm text-muted-foreground">No discussion yet.</div>}
      </div>
      <div className="space-y-2">
        <Textarea rows={3} placeholder="Write a comment or meeting note" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button onClick={add} disabled={!body.trim()}>Post comment</Button>
      </div>
    </div>
  );
}

function AttachmentsTab({ decisionId, canEdit }: { decisionId: string; canEdit: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const q = useQuery({
    queryKey: ["attachments", decisionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("attachments").select("*").eq("decision_id", decisionId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy(true);
    const path = `${decisionId}/${crypto.randomUUID()}-${file.name}`;
    const up = await supabase.storage.from("decision-docs").upload(path, file);
    if (up.error) { setBusy(false); return toast.error(up.error.message); }
    const { error } = await supabase.from("attachments").insert({
      decision_id: decisionId, uploaded_by: user.id,
      file_name: file.name, file_path: path, file_size: file.size, mime_type: file.type,
    });
    setBusy(false);
    e.target.value = "";
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    qc.invalidateQueries({ queryKey: ["attachments", decisionId] });
  }

  async function download(path: string, name: string) {
    const { data, error } = await supabase.storage.from("decision-docs").createSignedUrl(path, 60);
    if (error || !data) return toast.error(error?.message ?? "Failed");
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = name; a.click();
  }

  async function del(id: string, path: string) {
    await supabase.storage.from("decision-docs").remove([path]);
    await supabase.from("attachments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["attachments", decisionId] });
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <label className="inline-flex">
          <input type="file" className="hidden" onChange={upload} disabled={busy} />
          <Button asChild disabled={busy}><span><Paperclip className="h-4 w-4" /> {busy ? "Uploading…" : "Attach document"}</span></Button>
        </label>
      )}
      {q.data?.length ? (
        <div className="divide-y border rounded-md">
          {q.data.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{a.file_name}</div>
                <div className="text-xs text-muted-foreground">{a.mime_type || "file"} • {a.file_size ? Math.round(a.file_size / 1024) + " KB" : ""}</div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => download(a.file_path, a.file_name)}><Download className="h-4 w-4" /></Button>
                {canEdit && <Button size="sm" variant="ghost" onClick={() => del(a.id, a.file_path)}><Trash2 className="h-4 w-4" /></Button>}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-sm text-muted-foreground">No documents attached.</div>}
    </div>
  );
}

function VersionsTab({ decisionId }: { decisionId: string }) {
  const q = useQuery({
    queryKey: ["versions", decisionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("decision_versions").select("*").eq("decision_id", decisionId).order("version", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-3">
      {q.data?.length ? q.data.map((v) => {
        const s = v.snapshot as any;
        return (
          <Card key={v.id}>
            <CardHeader><CardTitle className="text-base">Version {v.version} — {format(new Date(v.created_at), "PPp")}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="Title">{s?.title}</Field>
              <Field label="Status">{s?.status}</Field>
              <Field label="Problem">{s?.problem_statement}</Field>
              <Field label="Final decision">{s?.final_decision || "—"}</Field>
            </CardContent>
          </Card>
        );
      }) : <div className="text-sm text-muted-foreground">No prior versions — this is the first revision.</div>}
    </div>
  );
}