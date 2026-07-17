import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user, roles } = useAuth();
  const isManager = roles.includes("manager") || roles.includes("administrator");

  const stats = useQuery({
    queryKey: ["dash-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [mine, pending, total, drafts] = await Promise.all([
        supabase.from("decisions").select("id", { count: "exact", head: true }).eq("created_by", user!.id),
        supabase.from("decisions").select("id", { count: "exact", head: true }).eq("status", "under_review"),
        supabase.from("decisions").select("id", { count: "exact", head: true }),
        supabase.from("decisions").select("id", { count: "exact", head: true }).eq("created_by", user!.id).eq("status", "draft"),
      ]);
      return { mine: mine.count ?? 0, pending: pending.count ?? 0, total: total.count ?? 0, drafts: drafts.count ?? 0 };
    },
  });

  const recent = useQuery({
    queryKey: ["dash-recent"],
    queryFn: async () => {
      const { data } = await supabase.from("decisions")
        .select("id,title,status,category,updated_at")
        .order("updated_at", { ascending: false }).limit(6);
      return data ?? [];
    },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{isManager ? "Manager view" : "Employee view"}</p>
        </div>
        <Link to="/app/decisions/new"><Button><Plus className="h-4 w-4" /> New decision</Button></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "My decisions", value: stats.data?.mine },
          { label: "My drafts", value: stats.data?.drafts },
          { label: "Under review", value: stats.data?.pending },
          { label: "Total decisions", value: stats.data?.total },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader><CardTitle className="text-sm text-muted-foreground font-normal">{s.label}</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{s.value ?? "—"}</CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recent.data?.length ? recent.data.map((d) => (
            <Link key={d.id} to="/app/decisions/$id" params={{ id: d.id }}
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent">
              <div>
                <div className="font-medium">{d.title}</div>
                <div className="text-xs text-muted-foreground">{d.category ?? "Uncategorized"} • updated {formatDistanceToNow(new Date(d.updated_at), { addSuffix: true })}</div>
              </div>
              <Badge variant="secondary">{d.status.replace("_", " ")}</Badge>
            </Link>
          )) : <div className="text-sm text-muted-foreground">No decisions yet. Create your first one.</div>}
        </CardContent>
      </Card>
    </div>
  );
}