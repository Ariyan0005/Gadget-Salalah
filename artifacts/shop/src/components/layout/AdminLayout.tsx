import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, ShoppingBag, ListOrdered, Users, Image as ImageIcon,
  LogOut, Package, ArrowLeft, Menu, ChevronRight, MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/admin/products",   label: "Products",   icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: ListOrdered },
  { href: "/admin/orders",     label: "Orders",     icon: Package },
  { href: "/admin/users",      label: "Users",      icon: Users },
  { href: "/admin/banners",    label: "Banners",    icon: ImageIcon },
];

const bottomNavItems = [
  { href: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products",  icon: ShoppingBag },
  { href: "/admin/orders",   label: "Orders",    icon: Package },
  { href: "/admin/users",    label: "Users",     icon: Users },
];

function SideNavLink({ href, label, icon: Icon, exact, location, onClick }: {
  href: string; label: string; icon: React.ElementType;
  exact?: boolean; location: string; onClick?: () => void;
}) {
  const isActive = exact ? location === href : location.startsWith(href);
  return (
    <Link href={href} onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
        isActive
          ? "bg-accent text-white shadow-lg shadow-accent/30"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}>
      <Icon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
    </Link>
  );
}

function SidebarInner({ location, onNav, onLogout }: {
  location: string; onNav?: () => void; onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <img src="/logo.jpg" alt="Gadget Salalah" className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-accent/30" />
        <div>
          <p className="text-sm font-bold text-white leading-none">GadgetSalalah</p>
          <p className="text-xs text-slate-500 mt-0.5">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Menu</p>
        {navItems.map(item => (
          <SideNavLink key={item.href} {...item} location={location} onClick={onNav} />
        ))}
      </nav>

      <div className="px-4 pb-6 pt-4 border-t border-white/5 space-y-1">
        <Link href="/" onClick={onNav}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" /> Back to Store
        </Link>
        <button onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      </div>
    </>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const currentPage = navItems.find(n => n.exact ? location === n.href : location.startsWith(n.href))?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0f172a] fixed inset-y-0 left-0 z-40">
        <SidebarInner location={location} onLogout={logout} />
      </aside>

      {/* Mobile sidebar Sheet (left) */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[#0f172a] border-none flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Menu</SheetTitle>
          </SheetHeader>
          <SidebarInner
            location={location}
            onNav={() => setSheetOpen(false)}
            onLogout={() => { logout(); setSheetOpen(false); }}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-white/90 backdrop-blur px-4 md:px-6 shadow-sm">
          <button
            className="md:hidden text-slate-500 hover:text-slate-900"
            onClick={() => setSheetOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <span>Admin</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-900">{currentPage}</span>
          </div>
          <Link href="/" className="ml-auto text-xs text-slate-400 hover:text-accent transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> View Store
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav (admin) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0f172a] border-t border-white/5 shadow-2xl">
        <div className="flex items-stretch h-16">
          {bottomNavItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? location === href : location.startsWith(href);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 transition-colors relative",
                  isActive ? "text-accent" : "text-slate-500 hover:text-slate-300"
                )}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{label}</span>
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent" />}
              </Link>
            );
          })}
          <Link href="/admin/banners"
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors relative",
              location.startsWith("/admin/banners") || location.startsWith("/admin/categories")
                ? "text-accent" : "text-slate-500 hover:text-slate-300"
            )}>
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
