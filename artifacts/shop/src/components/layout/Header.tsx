import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useGetCart, useListCategories, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  ShoppingCart, Menu, Search, User, LogOut, Package,
  Home as HomeIcon, PhoneCall, Navigation, ChevronRight, Grid3X3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: HomeIcon, exact: true },
  { href: "/products", label: "Products", icon: Grid3X3 },
  { href: "/track", label: "Track Order", icon: Navigation },
  { href: "/contact", label: "Contact", icon: PhoneCall },
];

export function Header() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: cart } = useGetCart({ query: { enabled: !!user, queryKey: getGetCartQueryKey() } });
  const { data: categories } = useListCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const cartCount = cart?.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement Bar */}
      <div className="bg-[#1a2332] text-white text-center text-xs py-1.5 px-4 font-medium tracking-wide">
        <span className="text-accent font-semibold">⚡</span>
        {" "}Free delivery on orders over 10 OMR · Gadget Salalah — Dhofar's #1 Tech Store{" "}
        <span className="text-accent font-semibold">⚡</span>
      </div>

      {/* Main Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">

          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            {/* Mobile menu — LEFT Sheet */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 flex flex-col">
                <SheetHeader className="pl-6 pr-12 py-5 border-b">
                  <SheetTitle className="text-left">
                    <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                      <img src="/logo.jpg" alt="Gadget Salalah" className="h-8 w-8 rounded object-cover shrink-0" />
                      <span className="truncate">
                        <span className="font-black text-lg text-[#1a2332]">Gadget</span>
                        <span className="font-black text-lg text-accent">Salalah</span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
                  {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => {
                    const active = exact ? location === href : location.startsWith(href);
                    return (
                      <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                          active ? "bg-accent/10 text-accent" : "hover:bg-muted text-foreground"
                        )}>
                        <Icon className="h-5 w-5" /> {label}
                        {active && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                      </Link>
                    );
                  })}

                  {/* Categories */}
                  {categories && categories.length > 0 && (
                    <>
                      <p className="px-3 mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
                      {categories.slice(0, 6).map((cat: { id: number; name: string; slug: string }) => (
                        <Link key={cat.id} href={`/products?categoryId=${cat.id}`} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted text-foreground transition-colors">
                          <span className="h-2 w-2 rounded-full bg-accent/60" />
                          {cat.name}
                        </Link>
                      ))}
                      <Link href="/products" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent/5 transition-colors">
                        View all categories →
                      </Link>
                    </>
                  )}
                </div>

                {/* Account section */}
                <div className="border-t px-3 py-4 space-y-1 bg-muted/30">
                  {!user ? (
                    <>
                      <Link href="/login" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition-colors">
                        <User className="h-5 w-5" /> Sign In
                      </Link>
                      <Link href="/register" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors">
                        <User className="h-5 w-5" /> Create Account
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      {user.role === "admin" && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-accent hover:bg-accent/5 transition-colors">
                          ⚡ Admin Dashboard
                        </Link>
                      )}
                      <Link href="/orders" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted text-foreground transition-colors">
                        <Package className="h-5 w-5" /> My Orders
                      </Link>
                      <button onClick={() => { logout(); setMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
                        <LogOut className="h-5 w-5" /> Sign Out
                      </button>
                    </>
                  )}
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
                          <Link href="/admin" className="w-full cursor-pointer font-bold text-accent">⚡ Admin Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="w-full cursor-pointer">
                        <Package className="mr-2 h-4 w-4" /> My Orders
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
