import { useRoute } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle, Package, Truck, Clock } from "lucide-react";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const id = Number(params?.id);

  const { data: order, isLoading } = useGetOrder(id, {
    query: { queryKey: getGetOrderQueryKey(id), enabled: !!id }
  });

  if (isLoading) return <AppLayout><div className="p-12 text-center">Loading order details...</div></AppLayout>;
  if (!order) return <AppLayout><div className="p-12 text-center">Order not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
            <p className="text-muted-foreground">Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
          </div>
          <Badge className="w-fit text-lg px-4 py-1 capitalize" variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
            {order.status}
          </Badge>
        </div>

        <div className="grid gap-8 md:grid-cols-3 mb-8">
          <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Items</h2>
            <div className="space-y-4">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="h-16 w-16 shrink-0 rounded bg-muted overflow-hidden">
                    {item.productImage && <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-2">{item.productName}</h3>
                    <div className="flex justify-between mt-1 text-sm">
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-bold">{formatPrice(item.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Delivery Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Tracking ID</span>
                  <span className="font-medium">{order.trackingId || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Address</span>
                  <span className="font-medium">{order.shippingAddress}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Phone</span>
                  <span className="font-medium">{order.phone}</span>
                </div>
                {order.notes && (
                  <div>
                    <span className="text-muted-foreground block">Notes</span>
                    <span className="font-medium">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
