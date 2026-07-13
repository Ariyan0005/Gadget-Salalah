import { Link, useLocation } from "wouter";
import { Home, Grid3X3, Package, User, Wrench } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/",               label: "Home",           icon: Home,    exact: true },
  { href: "/products",       label: "Shop",           icon: Grid3X3 },
  { href: "/mobile-service", label: "Service",        icon: Wrench  },
  { href: "/orders",         label: "Orders",         icon: Package, authRequired: true },
  { href: "/account",        label: "Account",        icon: User,    isAccount: true, authHref: "/login" },
];

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-border/60 shadow-[0_-2px_16px_rgba(0,0,0,0.07)]">
      <div className="flex items-stretch h-[60px] px-1">
        {ITEMS.map(({ href, label, icon: Icon, exact, isAccount, authRequired }) => {
          const finalHref = isAccount
            ? (user ? "/account" : "/login")
            : authRequired && !user
            ? "/login"
            : href;

          const isActive = exact
            ? location === finalHref || location === href
            : location.startsWith(href);

          return (
            <Link
              key={href}
              href={finalHref}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 relative transition-colors group"
            >
              {/* Pill background for active */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-14 py-1.5 rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-accent/12"
                    : "group-hover:bg-muted/60"
                )}
              >
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-200",
                    isActive
                      ? "text-accent stroke-[2.2px]"
                      : "text-muted-foreground stroke-[1.7px]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] leading-none transition-all duration-200",
                    isActive
                      ? "text-accent font-bold"
                      : "text-muted-foreground font-medium"
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Active dot indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
