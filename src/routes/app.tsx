import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { GitBranch, LayoutDashboard, ListChecks, Users, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Workspace — Decision Replay" }] }),
  component: AppLayout,
});

function AppLayout() {
  const { session, loading, roles, signOut, user } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) nav({ to: "/auth" });
  }, [loading, session, nav]);

  if (loading || !session) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  const isAdmin = roles.includes("administrator");

  const links = [
    { to: "/app" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/app/decisions" as const, label: "Decisions", icon: ListChecks, exact: false },
    ...(isAdmin ? [{ to: "/app/admin" as const, label: "Admin", icon: Users, exact: false }] : []),
    { to: "/app/profile" as const, label: "Profile", icon: User, exact: false },
  ];

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-background">
      <aside className="border-r bg-card flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2 font-semibold">
          <GitBranch className="h-5 w-5 text-primary" />
          Decision Replay
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((l) => {
            const active = l.exact ? path === l.to : path.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground font-medium",
              )}>
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="text-xs text-muted-foreground truncate px-2">{user?.email}</div>
          <div className="text-xs px-2 text-muted-foreground">{roles.join(", ") || "employee"}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); nav({ to: "/auth" }); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}