import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Lock } from "lucide-react";

export default function AdminSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [alreadySetup, setAlreadySetup] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    fetch("/api/setup/status")
      .then(r => r.json())
      .then(data => {
        setAlreadySetup(data.adminExists);
        setIsChecking(false);
      })
      .catch(() => setIsChecking(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");
      toast({ title: "✅ Admin created!", description: "You can now log in." });
      setTimeout(() => setLocation("/login"), 1500);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Checking setup status...</div>
      </div>
    );
  }

  if (alreadySetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Setup Complete</h2>
            <p className="text-muted-foreground">An admin account already exists. This page is disabled.</p>
            <Button className="mt-4" onClick={() => setLocation("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">First-Time Setup</CardTitle>
          <CardDescription>
            Create the admin account for <strong>Gadget Salalah</strong>.<br />
            This page will be disabled after setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Admin Name" required
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@gadgetsalalah.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 6 characters" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="Repeat password" required
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <Button type="submit" className="w-full font-bold" size="lg" disabled={isLoading}>
              {isLoading ? "Creating Admin..." : "Create Admin Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
