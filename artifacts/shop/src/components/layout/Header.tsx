import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useGetCart, useListCategories, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  ShoppingCart, Menu, Search, User, LogOut, ArrowLeft, Check, X,
  Home as HomeIcon, Navigation, ChevronRight, Grid3X3, Wrench,
  Puzzle, Settings, PhoneCall, LayoutDashboard, UserCircle, Package, Tag,
} from "lucide-react";
import { useLang, LANGUAGES } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FormEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useGuestCart } from "@/lib/guest-cart";

// Desktop nav — no Contact (moved to Account)
const NAV_LINKS = [
  { href: "/",               label: "Home",           icon: HomeIcon, exact: true },
  { href: "/products",       label: "Products",       icon: Grid3X3  },
  { href: "/mobile-service", label: "Mobile Service", icon: Wrench   },
  { href: "/spare-parts",    label: "Spare Parts",    icon: Puzzle,  subOf: "/mobile-service" },
  { href: "/track",          label: "Track Order",    icon: Navigation },
];

const ANNOUNCEMENTS = [
  "⚡ Free delivery on orders over 100 OMR · Gadget Salalah — Dhofar's #1 Tech Store ⚡",
  "🔧 Mobile Repair in Salalah · Screen, Battery & More · Same Day Service Available 🔧",
];

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  children?: CategoryNode[];
  productCount?: number;
};

export function Header() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: userCart } = useGetCart({ query: { enabled: !!user, queryKey: getGetCartQueryKey() } });
  const guestCart = useGuestCart();
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useListCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<"categories" | "navigation">("categories");
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [annIdx, setAnnIdx] = useState(0);
  const [annVisible, setAnnVisible] = useState(true);

  const cart = user ? userCart : guestCart;
  const cartCount = cart?.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0;
  const { lang, setLang } = useLang();
  const categoryList = (categories ?? []) as CategoryNode[];

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

  useEffect(() => {
    if (!menuOpen) {
      setSelectedCategory(null);
      setMenuTab("categories");
    }
  }, [menuOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMenuOpen(false);
    }
  };

  const close = () => setMenuOpen(false);
  const goToCategory = (categoryId: number) => {
    setLocation(`/products?categoryId=${categoryId}`);
    close();
  };
  const openCategory = (category: CategoryNode) => {
    // Always open the second level. This keeps the interaction consistent
    // for flat API responses today and nested categories added later.
    setSelectedCategory(category);
  };

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
                <Button
                  variant="ghost"
                  size="icon"
                  className="-ml-2 rounded-xl"
                  aria-label="Open menu"
                  data-testid="button-open-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[min(88vw,354px)] max-w-none gap-0 p-0 flex flex-col overflow-hidden bg-background [&>button]:hidden"
              >
                <SheetHeader className="shrink-0 border-b px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Link href="/" onClick={close} className="flex min-w-0 flex-1 items-center">
                      <img
                        src="/gadget-salalah-logo.webp"
                        alt="Gadget Salalah"
                        width="150"
                        height="70"
                        className="h-9 w-[150px] object-contain object-left"
                      />
                    </Link>
                    <SheetTitle className="shrink-0 text-base font-bold">Menu</SheetTitle>
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close menu"
                      data-testid="button-close-menu"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </SheetHeader>

                <div className="shrink-0 border-b bg-background">
                  <div className="grid grid-cols-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory(null); setMenuTab("categories"); }}
                      data-testid="tab-menu-categories"
                      className={cn(
                        "flex h-12 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition-colors",
                        menuTab === "categories"
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Grid3X3 className="h-4 w-4" aria-hidden="true" />
                      Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory(null); setMenuTab("navigation"); }}
                      data-testid="tab-menu-navigation"
                      className={cn(
                        "flex h-12 items-center justify-center gap-2 border-b-2 text-sm font-semibold transition-colors",
                        menuTab === "navigation"
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Navigation className="h-4 w-4" aria-hidden="true" />
                      Navigation
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 overflow-y-auto overscroll-contain">
                  {selectedCategory ? (
                    <div key={`submenu-${selectedCategory.id}`} className="animate-in slide-in-from-right-3 duration-200">
                      <div className="sticky top-0 z-10 border-b bg-background px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(null)}
                          data-testid="button-back-to-categories"
                          className="flex min-h-10 w-full items-center gap-2 rounded-md px-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          Back to categories
                        </button>
                      </div>
                      <div className="px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Category</p>
                        <h2 className="mt-1 text-xl font-bold">{selectedCategory.name}</h2>
                        <Link
                          href={`/products?categoryId=${selectedCategory.id}`}
                          onClick={close}
                          data-testid={`link-category-${selectedCategory.id}`}
                          className="mt-4 flex min-h-11 items-center justify-between rounded-md bg-muted px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Browse {selectedCategory.name}
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        {selectedCategory.children?.length ? (
                          <div className="mt-5 space-y-1">
                            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                              Subcategories
                            </p>
                            {selectedCategory.children.map((child) => (
                              <Link
                                key={child.id}
                                href={`/products?categoryId=${child.id}`}
                                onClick={close}
                                data-testid={`link-category-child-${child.id}`}
                                className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <Tag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <span className="flex-1">{child.name}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-5 text-sm text-muted-foreground">
                            Browse the products in this category.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : menuTab === "categories" ? (
                    <div className="px-3 py-3">
                      {categoriesLoading ? (
                        <div className="space-y-2 px-2 py-2" aria-label="Loading categories" role="status">
                          {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="h-11 animate-pulse rounded-md bg-muted" />
                          ))}
                        </div>
                      ) : categoriesError ? (
                        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-3">
                          <p className="text-sm font-medium text-destructive">Categories are unavailable.</p>
                          <button
                            type="button"
                            onClick={() => void refetchCategories()}
                            data-testid="button-retry-categories"
                            className="mt-2 text-xs font-semibold text-destructive underline underline-offset-2"
                          >
                            Try again
                          </button>
                        </div>
                      ) : categoryList.length === 0 ? (
                        <div className="px-2 py-8 text-center">
                          <p className="text-sm font-medium text-foreground">No categories yet</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {categoryList.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => openCategory(category)}
                              data-testid={`button-category-${category.id}`}
                              className="group flex min-h-14 w-full items-center gap-3 rounded-md px-3 text-left text-base font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Tag className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                              <span className="flex-1 truncate">{category.name}</span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="px-3 py-3">
                      {NAV_LINKS.map(({ href, label, icon: Icon, exact, subOf }) => {
                        const active = exact ? location === href : location.startsWith(href);
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={close}
                            data-testid={`link-menu-${label.toLowerCase().replace(/\s+/g, "-")}`}
                            className={cn(
                              "flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              subOf && "ml-5 min-h-10",
                              active ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted",
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{label}</span>
                            {active && <ChevronRight className="ml-auto h-4 w-4 opacity-50" aria-hidden="true" />}
                          </Link>
                        );
                      })}
                      <div className="mt-4 border-t pt-4">
                        {!user ? (
                          <>
                            <Link href="/login" onClick={close} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted">
                              <User className="h-4 w-4" aria-hidden="true" /> Sign In
                            </Link>
                            <Link href="/register" onClick={close} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted">
                              <UserCircle className="h-4 w-4" aria-hidden="true" /> Create Account
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link href="/account" onClick={close} className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted">
                              <User className="h-4 w-4" aria-hidden="true" /> Account
                            </Link>
                            <button type="button" onClick={() => { logout(); close(); }} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive/10">
                              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign Out
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" data-testid="link-header-logo" className="flex items-center shrink-0 rounded-md bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <img
                  src="/gadget-salalah-logo.webp"
                  alt="Gadget Salalah"
                  width="190"
                  height="95"
                  className="h-10 w-[190px] max-w-[42vw] object-contain object-left"
                />
              </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const active = exact ? location === href : location.startsWith(href);
              return (
                <Link key={href} href={href} data-testid={`link-desktop-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active ? "text-accent bg-accent/10" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}>
                  {label}
                </Link>
              );
            })}
            {/* Spare Parts in desktop nav too */}
            <Link href="/spare-parts" data-testid="link-desktop-spare-parts"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                location.startsWith("/spare-parts") ? "text-accent bg-accent/10" : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}>
              Spare Parts
            </Link>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="relative hidden lg:flex flex-1 max-w-xs" data-testid="form-desktop-search">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gadgets..."
              className="pl-9 rounded-full h-9 bg-muted/60 border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              data-testid="input-desktop-search"
            />
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            {/* Language switcher — pill style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button data-testid="button-language-menu" className="flex items-center gap-1.5 rounded-full border border-border bg-muted/60 hover:bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {LANGUAGES.find(l => l.code === lang)?.nativeLabel}
                  <ChevronRight className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {LANGUAGES.map(l => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    data-testid={`menu-language-${l.code}`}
                    className={lang === l.code ? "bg-accent/10 text-accent font-semibold" : ""}
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[10px] font-bold uppercase text-muted-foreground">{l.code}</span>
                    {l.nativeLabel}
                    {lang === l.code && <Check className="ml-auto h-4 w-4 text-accent" aria-hidden="true" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart — bigger, accent coloured */}
            <Link href="/cart" data-testid="link-cart" className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <ShoppingCart className="h-[26px] w-[26px] text-accent stroke-[1.8px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
            </Link>

            {/* Desktop Account dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex" data-testid="button-account-menu" aria-label="Open account menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" data-testid="link-account-sign-in" className="w-full cursor-pointer font-medium">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" data-testid="link-account-register" className="w-full cursor-pointer">Register</Link>
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
                          <Link href="/admin" data-testid="link-account-admin" className="w-full cursor-pointer font-bold text-accent">
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" data-testid="link-account-profile" className="w-full cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" /> My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" data-testid="link-account-orders" className="w-full cursor-pointer">
                        <Package className="mr-2 h-4 w-4" /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" data-testid="link-account-settings" className="w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/contact" data-testid="link-account-contact" className="w-full cursor-pointer">
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
           <form onSubmit={handleSearch} className="relative" data-testid="form-mobile-search">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gadgets..."
              className="pl-9 rounded-full h-9 bg-muted/60 border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              data-testid="input-mobile-search"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
