import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPwd.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setPwdLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast({ title: "Password updated successfully ✓" });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes("@")) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newEmail, password: emailPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast({ title: "Email updated successfully ✓" });
      setNewEmail(""); setEmailPwd("");
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setEmailLoading(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Please sign in to access settings.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-10 space-y-5">

        {/* Back */}
        <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        <h1 className="text-2xl font-black text-foreground">Settings</h1>

        {/* ── Change Password ── */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Lock className="h-4.5 w-4.5 text-accent h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Change Password</h2>
              <p className="text-xs text-muted-foreground">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            {/* Current password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPwd}
                  onChange={e => setCurrentPwd(e.target.value)}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={pwdLoading}>
              {pwdLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>

        {/* ── Change Email ── */}
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold">Update Email</h2>
              <p className="text-xs text-muted-foreground">Current: {user.email}</p>
            </div>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                New Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Confirm with Password
              </label>
              <Input
                type="password"
                placeholder="Your current password"
                value={emailPwd}
                onChange={e => setEmailPwd(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-xl" disabled={emailLoading}>
              {emailLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </div>

      </div>
    </AppLayout>
  );
}
