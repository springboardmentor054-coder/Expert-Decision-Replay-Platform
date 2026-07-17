import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GitBranch } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Decision Replay" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) nav({ to: "/app" });
  }, [session, loading, nav]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    nav({ to: "/app" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/app` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    nav({ to: "/app" });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error(result.error.message);
    if (result.redirected) return;
    nav({ to: "/app" });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <GitBranch className="h-5 w-5 text-primary" />
          Decision Replay
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Access your workspace</CardTitle>
            <CardDescription>Sign in or create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="in">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="in">Sign in</TabsTrigger>
                <TabsTrigger value="up">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="in">
                <form className="space-y-3" onSubmit={handleSignIn}>
                  <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={busy}>Sign in</Button>
                </form>
              </TabsContent>
              <TabsContent value="up">
                <form className="space-y-3" onSubmit={handleSignUp}>
                  <div><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                  <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div><Label>Password</Label><Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <Button type="submit" className="w-full" disabled={busy}>Create account</Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="my-4 text-center text-xs text-muted-foreground">or</div>
            <Button variant="outline" className="w-full" onClick={handleGoogle}>Continue with Google</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}