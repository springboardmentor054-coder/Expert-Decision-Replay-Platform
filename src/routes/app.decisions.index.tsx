import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/decisions/")({
  component: DecisionsList,
});

const STATUSES = ["all", "draft", "under_review", "approved", "rejected", "archived"] as const;

function DecisionsList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["decisions", q, status, category],
    queryFn: async () => {
      let query = supabase.from("decisions").select("*").order("updated_at", { ascending: false });
      if (status !== "all") query = query.eq("status", status as never);
      if (category) query = query.ilike("category", `%${category}%`);
      if (q) query = query.or(`title.ilike.%${q}%,problem_statement.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Decisions</h1>
        <Link to="/app/decisions/new"><Button><Plus className="h-4 w-4" /> New decision</Button></Link>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search decisions" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-48" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card className="p-0 overflow-hidden">
        {isLoading ? <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          : !data?.length ? <div className="p-6 text-sm text-muted-foreground">No decisions match your filters.</div>
          : <div className="divide-y">
            {data.map((d) => (
              <Link key={d.id} to="/app/decisions/$id" params={{ id: d.id }} className="flex items-center justify-between p-4 hover:bg-accent">
                <div className="min-w-0">
                  <div className="font-medium truncate">{d.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.category ?? "Uncategorized"} • v{d.version} • updated {formatDistanceToNow(new Date(d.updated_at), { addSuffix: true })}</div>
                </div>
                <Badge variant="secondary">{d.status.replace("_", " ")}</Badge>
              </Link>
            ))}
          </div>}
      </Card>
    </div>
  );
}