import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAddToCart, getGetCartQueryKey, getListProductVariantsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addGuestProduct } from "@/lib/guest-cart";
import { optimizeImageUrl } from "@/lib/image-url";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white border border-border/60 shadow-sm dark:bg-card">
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-muted animate-pulse" />
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div className="h-2.5 w-16 bg-slate-200 dark:bg-muted rounded animate-pulse" />
        <div className="h-4 w-full bg-slate-200 dark:bg-muted rounded animate-pulse" />
        <div className="h-3 w-20 bg-slate-200 dark:bg-muted rounded animate-pulse mt-1" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-muted rounded animate-pulse mt-auto pt-2" />
      </div>
    </div>
  );
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const addToCartMutation = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const prefetchProduct = () => {
    // 1. Seed TanStack Query cache with product data so navigation is instant (0ms)
    if (product.slug) {
      queryClient.setQueryData([`/api/products/${product.slug}`], product);
    }
    if (product.id) {
      queryClient.setQueryData([`/api/products/${product.id}`], product);
      // 2. Prefetch variants in background
      queryClient.prefetchQuery({
        queryKey: getListProductVariantsQueryKey(product.id),
        queryFn: async () => {
          const res = await fetch(`/api/products/${product.id}/variants`);
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
    }
    // 3. Preload the product detail page chunk
    import("@/pages/products/[id]");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      addGuestProduct(product);
      toast({ title: "✅ Added to cart", description: product.name });
      return;
    }

    addToCartMutation.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "✅ Added to cart", description: product.name });
        },
        onError: () => {
          toast({ title: "Failed to add", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const discountPct = product.discountPercent && product.discountPercent > 0 ? product.discountPercent : null;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug || product.id}`}
      onMouseEnter={prefetchProduct}
      onTouchStart={prefetchProduct}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-shadow duration-200 dark:bg-card"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-muted">
        {product.imageUrl ? (
          <img
            src={optimizeImageUrl(product.imageUrl, 480)}
            alt={product.name}
            width={480}
            height={480}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
            className="h-full w-full object-cover md:transition-transform md:duration-300 md:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
            <span className="text-4xl font-black text-primary/20 select-none">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct && (
            <Badge className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
              -{discountPct}%
            </Badge>
          )}
          {outOfStock && (
            <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0.5 rounded-md">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Add to Cart — always visible on mobile, slides up on desktop hover */}
        {!outOfStock && (
          <div className="absolute bottom-0 left-0 right-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-200">
            <Button
              className="w-full rounded-none rounded-b-none h-10 text-xs font-semibold bg-primary hover:bg-primary/90 gap-2"
              onClick={handleAddToCart} 
              disabled={user ? addToCartMutation.isPending : false}
              data-testid={`btn-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          {product.categoryName}
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`h-2.5 w-2.5 ${i <= 4 ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
