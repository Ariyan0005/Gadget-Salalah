import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { Search, Package, CheckCircle, Truck, Clock } from "lucide-react";

export default function TrackOrder() {
  const [searchId, setSearchId] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const { data: order, isLoading, isError, error } = useTrackOrder(trackingId, {
    query: { queryKey: getTrackOrderQueryKey(trackingId), enabled: !!trackingId, retry: false }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setTrackingId(searchId.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="text-green-500 h-8 w-8" />;
      case 'shipped': return <Truck className="text-blue-500 h-8 w-8" />;
      case 'processing': return <Package className="text-accent h-8 w-8" />;
      default: return <Clock className="text-muted-foreground h-8 w-8" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Track Your Order</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Enter your tracking ID below to see the current status and estimated delivery time of your package.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-12">
          <Input
            placeholder="Enter Tracking ID (e.g., TRK-12345)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="h-12 text-lg"
            required
            data-testid="input-tracking-id"
          />
          <Button type="submit" size="lg" className="h-12 px-8" data-testid="btn-track">
            <Search className="mr-2 h-4 w-4" /> Track
          </Button>
        </form>

        {isLoading && <div className="text-center p-8">Searching for order...</div>}
        
        {isError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center font-medium">
            Order not found. Please check the tracking ID and try again.
          </div>
        )}

        {order && (
          <Card className="overflow-hidden shadow-md">
            <div className="bg-muted/50 border-b p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Tracking ID: {order.trackingId}</div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status}</span>
                </CardTitle>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Order Date</div>
                <div className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3 border-b pb-2">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {order.userName}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
                    <p className="flex gap-2"><span className="text-muted-foreground shrink-0">Address:</span> <span>{order.shippingAddress}</span></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 border-b pb-2">Order Summary</h3>
                  <div className="space-y-3">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="line-clamp-1 flex-1 pr-4">{item.quantity}x {item.productName}</span>
                        <span className="font-medium shrink-0">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
