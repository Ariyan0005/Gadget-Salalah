import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useGetProduct,
  useAddToCart,
  useListProductVariants,
  getGetCartQueryKey,
  getGetProductQueryKey,
  getListProductVariantsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingCart, ShieldCheck, Truck, RefreshCcw, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = Number(params?.id);

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });
  const { data: variants = [] } = useListProductVariants(id, {
    query: { enabled: !!id, queryKey: getListProductVariantsQueryKey(id) },
  });

  const [quantity, setQuantity] = useState(1);
  // Track one selected variant ID per option group name
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const addToCartMutation = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Group variants by option name (e.g. "Color" → [Black, White], "Storage" → [64GB, 128GB])
  const variantGroups = useMemo(() => {
    const map = new Map<string, typeof variants>();
    for (const v of variants) {
      const existing = map.get(v.name) ?? [];
      map.set(v.name, [...existing, v]);
    }
    return map;
  }, [variants]);

  const allGroupNames = useMemo(() => Array.from(variantGroups.keys()), [variantGroups]);
  const allGroupsSelected = allGroupNames.every((name) => selectedOptions[name] !== undefined);

  // Collect all selected variant objects
  const selectedVariants = useMemo(() => {
    return Object.values(selectedOptions)
      .map((id) => variants.find((v) => v.id === id))
      .filter(Boolean) as typeof variants;
  }, [selectedOptions, variants]);

  // Effective price = base price + sum of all selected variant price modifiers
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    const totalMod = selectedVariants.reduce((sum, v) => sum + Number(v.priceModifier), 0);
    return Number(product.price) + totalMod;
  }, [product, selectedVariants]);

  // Effective stock: when variants exist, take minimum stock across selected variants
  const effectiveStock = useMemo(() => {
    if (variants.length === 0) return product?.stock ?? 0;
    if (!allGroupsSelected) return null; // null = "not yet determinable"
    if (selectedVariants.length === 0) return 0;
    return Math.min(...selectedVariants.map((v) => v.stock));
  }, [product, variants, selectedVariants, allGroupsSelected]);

  const isOutOfStock = effectiveStock === 0;
  const stockUnknown = effectiveStock === null;

  const handleSelectOption = (groupName: string, variantId: number) => {
    setSelectedOptions((prev) => {
      if (prev[groupName] === variantId) {
        // Deselect
        const next = { ...prev };
        delete next[groupName];
        return next;
      }
      return { ...prev, [groupName]: variantId };
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-6 w-1/4 bg-muted rounded animate-pulse" />
              <div className="h-24 w-full bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product)
    return (
      <AppLayout>
        <div className="p-12 text-center">Product not found</div>
      </AppLayout>
    );

  const handleAddToCart = () => {
    if (allGroupNames.length > 0 && !allGroupsSelected) {
      toast({
        title: "Select all options",
        description: "Please choose one option from each group before adding to cart.",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate(
      { data: { productId: product.id, quantity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          const variantLabel = selectedVariants.map((v) => v.value).join(", ");
          toast({
            title: "Added to cart",
            description: `${quantity}× ${product.name}${variantLabel ? ` (${variantLabel})` : ""} added.`,
          });
        },
      }
    );
  };

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted lg:sticky lg:top-24">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                <span className="text-4xl font-bold opacity-30">{product.categoryName || "Gadget"}</span>
              </div>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 text-lg" variant="destructive">
                -{product.discountPercent}%
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {product.brand && <span className="text-sm font-semibold text-accent">{product.brand}</span>}
              {product.brand && product.categoryName && <span className="text-sm text-muted-foreground">•</span>}
              {product.categoryName && <span className="text-sm text-muted-foreground">{product.categoryName}</span>}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4">{product.name}</h1>

            {/* Price */}
            <div className="flex items-end gap-4 mb-6 pb-6 border-b">
              <span className="text-4xl font-extrabold text-primary">{formatPrice(effectivePrice)}</span>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {selectedVariants.length > 0 && selectedVariants.some((v) => v.priceModifier !== 0) && (
                <Badge variant="outline" className="mb-1 text-sm">
                  {selectedVariants.map((v) =>
                    v.priceModifier !== 0
                      ? `${v.name}: ${v.priceModifier > 0 ? "+" : ""}${formatPrice(v.priceModifier)}`
                      : null
                  ).filter(Boolean).join(", ")}
                </Badge>
              )}
            </div>

            {/* Variant Selectors — one group per option name */}
            {variantGroups.size > 0 && (
              <div className="mb-6 space-y-5">
                {Array.from(variantGroups.entries()).map(([groupName, groupVariants]) => {
                  const selectedInGroup = selectedOptions[groupName];
                  return (
                    <div key={groupName}>
                      <p className="text-sm font-semibold mb-2 text-foreground">
                        {groupName}
                        {selectedInGroup && (
                          <span className="font-normal text-muted-foreground ml-2">
                            {groupVariants.find((v) => v.id === selectedInGroup)?.value}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {groupVariants.map((v) => {
                          const isSelected = selectedInGroup === v.id;
                          const isUnavailable = v.stock === 0;
                          return (
                            <button
                              key={v.id}
                              onClick={() => !isUnavailable && handleSelectOption(groupName, v.id)}
                              disabled={isUnavailable}
                              className={cn(
                                "relative px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                                  : "border-border bg-card hover:border-primary/60 text-foreground",
                                isUnavailable && "opacity-40 cursor-not-allowed line-through"
                              )}
                            >
                              {v.value}
                              {v.priceModifier !== 0 && (
                                <span className="text-xs ml-1 opacity-70">
                                  {v.priceModifier > 0 ? "+" : ""}
                                  {formatPrice(v.priceModifier)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!allGroupsSelected && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    ⚠ Please select one option from each group
                  </p>
                )}
              </div>
            )}

            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              {product.description || "No description available for this product."}
            </p>

            {/* Stock & SKU */}
            <div className="mb-8 space-y-3 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">Availability</div>
                <div className="flex-1">
                  {stockUnknown ? (
                    <Badge variant="secondary">Select options to check stock</Badge>
                  ) : isOutOfStock ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10">
                      In Stock ({effectiveStock} available)
                    </Badge>
                  )}
                </div>
              </div>
              {product.sku && (
                <div className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">SKU</div>
                  <div className="flex-1 text-sm font-medium font-mono">{product.sku}</div>
                </div>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex items-center rounded-lg border bg-card p-1">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock || stockUnknown}>
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="w-12 text-center font-medium">{quantity}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(effectiveStock ?? 99, quantity + 1))}
                  disabled={isOutOfStock || stockUnknown || quantity >= (effectiveStock ?? 99)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 h-12 text-base font-bold"
                disabled={isOutOfStock || stockUnknown || addToCartMutation.isPending}
                onClick={handleAddToCart}
                data-testid="btn-add-to-cart-detail"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {stockUnknown ? "Select Options" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-semibold">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-semibold">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50">
                <RefreshCcw className="h-6 w-6 text-primary mb-2" />
                <span className="text-xs font-semibold">7 Days Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
