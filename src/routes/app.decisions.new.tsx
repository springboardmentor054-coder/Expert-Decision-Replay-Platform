import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/app/decisions/new")({
  component: NewDecision,
});

function NewDecision() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [criteria, setCriteria] = useState("");
  const [risks, setRisks] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase.from("decisions").insert({
      title, problem_statement: problem, category: category || null,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      evaluation_criteria: criteria || null, risks: risks || null,
      created_by: user.id,
    }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Decision created");
    nav({ to: "/app/decisions/$id", params: { id: data.id } });
  }

  return (
    <div className="p-8 max-w-3xl">
      <Card>
        <CardHeader><CardTitle>New decision</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div><Label>Problem statement</Label><Textarea rows={4} value={problem} onChange={(e) => setProblem(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Engineering" /></div>
              <div><Label>Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
            </div>
            <div><Label>Evaluation criteria</Label><Textarea rows={3} value={criteria} onChange={(e) => setCriteria(e.target.value)} /></div>
            <div><Label>Known risks</Label><Textarea rows={3} value={risks} onChange={(e) => setRisks(e.target.value)} /></div>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>Create draft</Button>
              <Button type="button" variant="outline" onClick={() => nav({ to: "/app/decisions" })}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}