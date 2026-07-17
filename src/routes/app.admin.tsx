import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/admin")({ component: Admin });

const ROLES = ["employee", "reviewer", "manager", "administrator"] as const;

function Admin() {
  const { roles, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !roles.includes("administrator")) nav({ to: "/app" });
  }, [loading, roles, nav]);

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-bold">Administration</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4"><UsersPanel /></TabsContent>
        <TabsContent value="teams" className="mt-4"><TeamsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function UsersPanel() {
  const qc = useQueryClient();
  const users = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: profs } = await supabase.from("profiles").select("id,email,full_name,team_id");
      const { data: rls } = await supabase.from("user_roles").select("user_id,role");
      const byUser = new Map<string, string[]>();
      (rls ?? []).forEach((r) => {
        const arr = byUser.get(r.user_id) ?? [];
        arr.push(r.role);
        byUser.set(r.user_id, arr);
      });
      return (profs ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
    },
  });

  async function toggleRole(userId: string, role: string, has: boolean) {
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as never);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as never });
      if (error) return toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["all-users"] });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Users</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {users.data?.map((u) => (
          <div key={u.id} className="rounded-md border p-3 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div>
              <div className="font-medium">{u.full_name || u.email}</div>
              <div className="text-xs text-muted-foreground">{u.email}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => {
                const has = u.roles.includes(r);
                return (
                  <button key={r} onClick={() => toggleRole(u.id, r, has)}>
                    <Badge variant={has ? "default" : "outline"} className="cursor-pointer">{r}</Badge>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TeamsPanel() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const teams = useQuery({
    queryKey: ["teams-admin"],
    queryFn: async () => (await supabase.from("teams").select("*").order("name")).data ?? [],
  });
  const members = useQuery({
    queryKey: ["all-profiles-teams"],
    queryFn: async () => (await supabase.from("profiles").select("id,email,full_name,team_id")).data ?? [],
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("teams").insert({ name, description: desc || null });
    if (error) return toast.error(error.message);
    setName(""); setDesc("");
    qc.invalidateQueries({ queryKey: ["teams-admin"] });
  }

  async function delTeam(id: string) {
    if (!confirm("Delete team?")) return;
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["teams-admin"] });
    qc.invalidateQueries({ queryKey: ["all-profiles-teams"] });
  }

  async function assign(userId: string, teamId: string) {
    const { error } = await supabase.from("profiles").update({ team_id: teamId || null }).eq("id", userId);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["all-profiles-teams"] });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Create team</CardTitle></CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2 items-end" onSubmit={create}>
            <div className="flex-1 min-w-[200px]"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="flex-1 min-w-[200px]"><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Teams</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {teams.data?.map((t) => (
            <div key={t.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.description || "—"}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => delTeam(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {!teams.data?.length && <div className="text-sm text-muted-foreground">No teams yet.</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Assign team members</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {members.data?.map((u) => (
            <div key={u.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{u.full_name || u.email}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <Select value={u.team_id ?? "__none"} onValueChange={(v) => assign(u.id, v === "__none" ? "" : v)}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">No team</SelectItem>
                  {teams.data?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}