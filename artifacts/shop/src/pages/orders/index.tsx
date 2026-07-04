import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListOrders } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersList() {
  const { data: ordersData, isLoading } = useListOrders();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-xl border bg-muted animate-pulse" />
            ))}
          </div>
        ) : !ordersData?.orders || ordersData.orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-24 text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-6 text-primary">
              <Package className="h-12 w-12" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">No orders yet</h2>
            <p className="mb-8 text-muted-foreground">You haven't placed any orders.</p>
            <Button asChild size="lg">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersData.orders.map(order => (
              <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                    <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground border-t pt-4">
                  {order.items?.length} items • Tracking ID: <span className="font-medium text-foreground">{order.trackingId || 'N/A'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
