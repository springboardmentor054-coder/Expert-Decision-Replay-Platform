import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const p = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await supabase.from("teams").select("id,name").order("name")).data ?? [],
  });

  const [full_name, setName] = useState("");
  const [job_title, setJob] = useState("");
  const [bio, setBio] = useState("");
  const [team_id, setTeam] = useState<string>("");

  useEffect(() => {
    if (p.data) {
      setName(p.data.full_name ?? "");
      setJob(p.data.job_title ?? "");
      setBio(p.data.bio ?? "");
      setTeam(p.data.team_id ?? "");
    }
  }, [p.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({
      full_name, job_title, bio, team_id: team_id || null,
    }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile", user?.id] });
  }

  return (
    <div className="p-8 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Your profile</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={save}>
            <div><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
            <div>
              <Label>Roles</Label>
              <div className="flex gap-1 mt-1">{roles.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}</div>
            </div>
            <div><Label>Full name</Label><Input value={full_name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Job title</Label><Input value={job_title} onChange={(e) => setJob(e.target.value)} /></div>
            <div>
              <Label>Team</Label>
              <Select value={team_id || "__none"} onValueChange={(v) => setTeam(v === "__none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None</SelectItem>
                  {teams.data?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Bio</Label><Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
            <Button type="submit">Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}