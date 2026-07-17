import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { BookOpen, GitBranch, MessageSquare, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && session) navigate({ to: "/app" });
  }, [loading, session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <GitBranch className="h-5 w-5 text-primary" />
            Decision Replay
          </div>
          <Link to="/auth"><Button size="sm">Sign in</Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="text-5xl font-bold tracking-tight text-foreground max-w-3xl">
          Institutional memory for every important decision.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Record problems, alternatives, risks, approvals, and outcomes. Replay how choices were made,
          so your organization stops repeating the same mistakes.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/auth"><Button size="lg">Get started</Button></Link>
        </div>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, title: "Structured decisions", body: "Problem, criteria, risks, outcomes." },
            { icon: GitBranch, title: "Alternatives", body: "Weigh cost, feasibility, and risk." },
            { icon: MessageSquare, title: "Discussion", body: "Threaded comments and rationale." },
            { icon: ShieldCheck, title: "Roles & audit", body: "Employee, Reviewer, Manager, Admin." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border bg-card p-5">
              <f.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-medium">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.body}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
