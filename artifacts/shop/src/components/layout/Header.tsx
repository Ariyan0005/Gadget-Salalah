import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useGetCart, useListCategories, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  ShoppingCart, Menu, Search, User, LogOut, Package,
  Home as HomeIcon, Navigation, ChevronRight, Grid3X3, Wrench,
  Puzzle, Settings, PhoneCall, LayoutDashboard, UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Desktop nav — no Contact (moved to Account)
const NAV_LINKS = [
  { href: "/",               label: "Home",           icon: HomeIcon, exact: true },
  { href: "/products",       label: "Products",       icon: Grid3X3  },
  { href: "/mobile-service", label: "Mobile Service", icon: Wrench   },
  { href: "/track",          label: "Track Order",    icon: Navigation },
];

// Sidebar-only extra nav item (Spare Parts under Mobile Service)
const SPARE_PARTS = { href: "/spare-parts", label: "Spare Parts", icon: Puzzle };

const ANNOUNCEMENTS = [
  "⚡ Free delivery on orders over 100 OMR · Gadget Salalah — Dhofar's #1 Tech Store ⚡",
  "🔧 Mobile Repair in Salalah · Screen, Battery & More · Same Day Service Available 🔧",
];

export function Header() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: cart } = useGetCart({ query: { enabled: !!user, queryKey: getGetCartQueryKey() } });
  const { data: categories } = useListCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [annIdx, setAnnIdx] = useState(0);
  const [annVisible, setAnnVisible] = useState(true);

  const cartCount = cart?.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnVisible(false);
      setTimeout(() => {
        setAnnIdx(i => (i + 1) % ANNOUNCEMENTS.length);
        setAnnVisible(true);
      }, 400);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMenuOpen(false);
    }
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="bg-[#1a2332] text-white text-center text-xs py-1.5 px-4 font-medium tracking-wide overflow-hidden">
        <span
          style={{
            display: "inline-block",
            transition: "opacity 0.4s ease, transform 0.4s ease",
            opacity: annVisible ? 1 : 0,
            transform: annVisible ? "translateY(0)" : "translateY(-8px)",
          }}
        >
          {ANNOUNCEMENTS[annIdx]}
        </span>
      </div>

      {/* Main Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">

            {/* ── MOBILE SIDEBAR ── */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] p-0 flex flex-col overflow-hidden">

                {/* Logo header */}
                <SheetHeader className="pl-4 pr-12 py-3 border-b shrink-0">
                  <SheetTitle className="text-left">
                    <Link href="/" onClick={close} className="flex items-center gap-2">
                      <img src="/logo.jpg" alt="Gadget Salalah" className="h-7 w-7 rounded object-cover shrink-0" />
                      <span>
                        <span className="font-black text-base text-[#1a2332]">Gadget</span>
                        <span className="font-black text-base text-accent">Salalah</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">

                  {/* ── NAVIGATION section ── */}
                  <div className="px-3 pt-3 pb-1">
                    <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Navigation
                    </p>

                    {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
                      const active = exact ? location === href : location.startsWith(href);
                      return (
                        <Link key={href} href={href} onClick={close}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                            active ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"
                          )}>
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                          {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40" />}
                        </Link>
                      );
                    })}

                    {/* Spare Parts — indented under Mobile Service */}
                    <Link href={SPARE_PARTS.href} onClick={close}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ml-6 mt-0.5",
                        location.startsWith(SPARE_PARTS.href)
                          ? "bg-accent/10 text-accent"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}>
                      <SPARE_PARTS.icon className="h-4 w-4 shrink-0" />
                      {SPARE_PARTS.label}
                      {location.startsWith(SPARE_PARTS.href) && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-40" />
                      )}
                    </Link>
                  </div>

                  {/* ── CATEGORIES section ── */}
                  {categories && categories.length > 0 && (
                    <div className="px-3 pt-2 pb-1">
                      <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Categories
                      </p>
                      {categories.slice(0, 8).map((cat: { id: number; name: string; slug: string }) => (
                        <Link key={cat.id} href={`/products?categoryId=${cat.id}`} onClick={close}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-muted text-foreground transition-colors">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent/60 shrink-0" />
                          {cat.name}
                        </Link>
                      ))}
                      <Link href="/products" onClick={close}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-accent hover:bg-accent/5 transition-colors">
                        View all →
                      </Link>
                    </div>
                  )}

                  {/* ── ACCOUNT section ── */}
                  <div className="px-3 pt-2 pb-3 border-t mt-2">
                    <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Account
                    </p>

                    {!user ? (
                      <>
                        <Link href="/login" onClick={close}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-colors">
                          <User className="h-4 w-4" /> Sign In
                        </Link>
                        <Link href="/register" onClick={close}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-muted text-foreground transition-colors mt-0.5">
                          <UserCircle className="h-4 w-4" /> Create Account
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* User info */}
                        <div className="px-2.5 py-2 mb-1 bg-muted/40 rounded-lg">
                          <p className="text-sm font-semibold leading-tight">{user.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>

                        {/* Admin Dashboard */}
                        {user.role === "admin" && (
                          <Link href="/admin" onClick={close}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold text-accent hover:bg-accent/5 transition-colors">
                            <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                          </Link>
                        )}

                        {/* My Account */}
                        <Link href="/account" onClick={close}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                            location.startsWith("/account") ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"
                          )}>
                          <UserCircle className="h-4 w-4" /> My Account
                        </Link>

                        {/* My Orders */}
                        <Link href="/orders" onClick={close}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                            location.startsWith("/orders") ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"
                          )}>
                          <Package className="h-4 w-4" /> My Orders
                        </Link>

                        {/* Settings */}
                        <Link href="/settings" onClick={close}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                            location.startsWith("/settings") ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"
                          )}>
                          <Settings className="h-4 w-4" /> Settings
                        </Link>

                        {/* Contact — moved from Navigation */}
                        <Link href="/contact" onClick={close}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                            location.startsWith("/contact") ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"
                          )}>
                          <PhoneCall className="h-4 w-4" /> Contact Us
                        </Link>

                        {/* Sign Out */}
                        <button onClick={() => { logout(); close(); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors mt-1">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.jpg" alt="Gadget Salalah" className="h-9 w-9 rounded-lg object-cover hidden sm:block" />
              <span className="font-black text-xl leading-none tracking-tight">
                <span className="text-[#1a2332]">Gadget</span><span className="text-accent">Salalah</span>
              </span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const active = exact ? location === href : location.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active ? "text-accent bg-accent/10" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}>
                  {label}
                </Link>
              );
            })}
            {/* Spare Parts in desktop nav too */}
            <Link href="/spare-parts"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.startsWith("/spare-parts") ? "text-accent bg-accent/10" : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}>
              Spare Parts
            </Link>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="relative hidden lg:flex flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gadgets..."
              className="pl-9 rounded-full h-9 bg-muted/60 border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Desktop Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="w-full cursor-pointer font-medium">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="w-full cursor-pointer">Register</Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full cursor-pointer font-bold text-accent">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="w-full cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" /> My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="w-full cursor-pointer">
                        <Package className="mr-2 h-4 w-4" /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/contact" className="w-full cursor-pointer">
                        <PhoneCall className="mr-2 h-4 w-4" /> Contact Us
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 cursor-pointer"
                      onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="px-4 pb-3 md:hidden border-t pt-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gadgets..."
              className="pl-9 rounded-full h-9 bg-muted/60 border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
}
