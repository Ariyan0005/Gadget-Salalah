import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  LayoutDashboard, UserCircle, Package, Settings, PhoneCall,
  LogOut, ChevronRight, Mail, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  adminOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    href: "/admin",
    label: "Admin Dashboard",
    description: "Manage products, orders & users",
    icon: LayoutDashboard,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    adminOnly: true,
  },
  {
    href: "/account/profile",
    label: "My Account",
    description: "Edit your name, email & password",
    icon: UserCircle,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    href: "/orders",
    label: "My Orders",
    description: "Track and view your orders",
    icon: Package,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Notifications and preferences",
    icon: Settings,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  {
    href: "/contact",
    label: "Contact Us",
    description: "Get help or reach our team",
    icon: PhoneCall,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
];

export default function AccountPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <UserCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Sign in to your account</h1>
          <p className="text-muted-foreground text-sm max-w-xs">
            Access your orders, profile and settings.
          </p>
          <Link href="/login"
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="text-sm text-accent font-medium">
            Don't have an account? Register
          </Link>
        </div>
      </AppLayout>
    );
  }

  const visibleItems = MENU_ITEMS.filter(item => !item.adminOnly || user.role === "admin");

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-5">

        {/* Profile card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1a2332] to-[#243144] text-white p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg leading-tight">{user.name}</p>
            <p className="text-white/60 text-sm truncate flex items-center gap-1 mt-0.5">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
            </p>
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-accent/30 text-accent text-[11px] font-semibold">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div className="rounded-2xl border bg-white overflow-hidden divide-y divide-border/60">
          {visibleItems.map(({ href, label, description, icon: Icon, iconBg, iconColor }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-muted/40 transition-colors">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-white py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </AppLayout>
  );
}
