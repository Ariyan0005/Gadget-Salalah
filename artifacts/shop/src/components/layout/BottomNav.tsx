import { Link, useLocation } from "wouter";
import { Home, Grid3X3, ShoppingCart, Package, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/products", label: "Shop", icon: Grid3X3 },
  { href: "/cart", label: "Cart", icon: ShoppingCart, isCart: true },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/account", label: "Account", icon: User, isAccount: true },
];

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { data: cart } = useGetCart({ query: { enabled: !!user, queryKey: getGetCartQueryKey() } });

  const cartCount = cart?.items?.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0) ?? 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch h-16">
        {items.map(({ href, label, icon: Icon, exact, isCart, isAccount }) => {
          const finalHref = isAccount ? (user ? "/orders" : "/login") : href;
          const isActive = exact ? location === finalHref : location.startsWith(finalHref);

          return (
            <Link
              key={href}
              href={finalHref}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 relative transition-colors",
                isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium leading-none", isActive && "font-semibold")}>{label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
