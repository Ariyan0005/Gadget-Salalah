import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const queryClient = useQueryClient();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemMutation.mutate({
      itemId,
      data: { quantity: newQuantity }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate({ itemId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() })
    });
  };

  if (isLoading) {
    return <AppLayout><div className="p-12 text-center">Loading cart...</div></AppLayout>;
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Shopping Cart</h1>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-24 text-center shadow-sm">
            <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary">
              <ShoppingBag className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Your cart is empty</h2>
            <p className="mb-8 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary text-xs font-bold text-center p-2">
                        {item.productName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-2">
                      <Link href={`/products/${item.productId}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2">
                        {item.productName}
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive shrink-0 -mt-2 -mr-2"
                        onClick={() => handleRemoveItem(item.id)}
                        data-testid={`btn-remove-item-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-center rounded-md border bg-background">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updateItemMutation.isPending || item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="w-8 text-center text-sm font-medium">{item.quantity}</div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateItemMutation.isPending}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-bold text-primary">{formatPrice(item.subtotal || (item.price * item.quantity))}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({cart.itemCount} items)</span>
                    <span className="font-medium">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="my-4 border-t pt-4 flex justify-between">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(cart.total)}</span>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full mt-6 text-base font-bold h-12" data-testid="btn-checkout">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
