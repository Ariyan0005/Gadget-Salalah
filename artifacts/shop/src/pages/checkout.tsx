import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useGetCart,
  useCreateOrder,
  useListDeliveryAreas,
  getGetCartQueryKey,
  getListOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Truck,
  CreditCard,
  Banknote,
  AlertTriangle,
  MapPin,
  ChevronDown,
} from "lucide-react";

function formatOmr(amount: number) {
  return `OMR ${amount.toFixed(3)}`;
}

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const { data: deliveryAreas = [] } = useListDeliveryAreas();
  const createOrderMutation = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [selectedWilayat, setSelectedWilayat] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    id: number;
    trackingId: string;
    deliveryCharge: number;
    paymentMethod: string;
    deliveryArea: string;
  } | null>(null);

  const selectedArea = deliveryAreas.find((a) => a.wilayat === selectedWilayat);
  const deliveryCharge = selectedArea?.deliveryChargeOmr ?? 0;
  const productTotal = cart?.total ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    if (!selectedWilayat) {
      toast({ title: "Select Delivery Area", description: "Please select your wilayat in Dhofar Governorate.", variant: "destructive" });
      return;
    }

    createOrderMutation.mutate(
      {
        data: {
          shippingAddress: address,
          phone,
          deliveryArea: selectedWilayat,
          paymentMethod,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: (order) => {
          setIsSuccess(true);
          setPlacedOrder({
            id: order.id,
            trackingId: order.trackingId ?? "",
            deliveryCharge: order.deliveryCharge ?? deliveryCharge,
            paymentMethod: order.paymentMethod ?? paymentMethod,
            deliveryArea: order.deliveryArea ?? selectedWilayat,
          });
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        },
        onError: (err: any) => {
          toast({
            title: "Order Failed",
            description: err.data?.error || err.message || "Failed to place order. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // --- Success Screen ---
  if (isSuccess && placedOrder) {
    const isCod = placedOrder.paymentMethod === "cod";
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="max-w-lg w-full space-y-6 bg-card p-8 rounded-2xl border shadow-sm text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. It will be delivered to{" "}
              <span className="font-semibold text-foreground">{placedOrder.deliveryArea}</span>,
              Dhofar Governorate, Oman.
            </p>

            <div className="rounded-xl border bg-muted/50 p-4 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-bold">#{placedOrder.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tracking ID</span>
                <span className="font-mono font-bold text-primary">{placedOrder.trackingId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-semibold">{isCod ? "Cash on Delivery" : "Online Payment"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Charge</span>
                <span className="font-semibold">{formatOmr(placedOrder.deliveryCharge)}</span>
              </div>
            </div>

            {isCod && (
              <div className="rounded-xl border border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4 text-left">
                <div className="flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm">COD — Delivery Charge Must Be Paid First</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                      Before your order is dispatched, you must pay the delivery charge of{" "}
                      <strong>{formatOmr(placedOrder.deliveryCharge)}</strong> in advance.
                      Our team will contact you with payment details. The product amount is paid upon delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href={`/orders/${placedOrder.id}`}>View Order Status</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isCartLoading)
    return <AppLayout><div className="p-12 text-center">Loading...</div></AppLayout>;

  if (!cart || cart.items.length === 0) {
    return (
      <AppLayout>
        <div className="p-12 text-center space-y-4">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Button asChild><Link href="/">Go to Homepage</Link></Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Form ── */}
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Delivery Area */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Delivery Area</h2>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">
                Delivery available only within <span className="font-medium text-foreground">Dhofar Governorate, Oman</span>.
              </p>

              <div className="space-y-2">
                <Label htmlFor="wilayat">Select Your Wilayat</Label>
                <div className="relative">
                  <select
                    id="wilayat"
                    required
                    value={selectedWilayat}
                    onChange={(e) => setSelectedWilayat(e.target.value)}
                    className="w-full appearance-none rounded-md border bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    data-testid="select-wilayat"
                  >
                    <option value="">-- Select Wilayat --</option>
                    {deliveryAreas.map((area) => (
                      <option key={area.wilayat} value={area.wilayat}>
                        {area.wilayat} ({area.wilayatAr}) — {formatOmr(area.deliveryChargeOmr)} · {area.estimatedDays} days
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {selectedArea && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Est. delivery in <strong className="text-foreground">{selectedArea.estimatedDays} working days</strong></span>
                  </div>
                  <span className="font-bold text-primary">{formatOmr(selectedArea.deliveryChargeOmr)}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="address">Full Delivery Address</Label>
                <Textarea
                  id="address"
                  required
                  placeholder={`Street / Building / Area, ${selectedWilayat || "Dhofar"}`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  data-testid="input-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone (Oman)</Label>
                <Input
                  id="phone"
                  required
                  placeholder="+968 XXXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions for delivery"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  data-testid="input-notes"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Payment Method</h2>
              </div>

              {/* COD Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
                data-testid="btn-cod"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "cod" ? "border-primary" : "border-muted-foreground"}`}>
                    {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-orange-500" />
                      <span className="font-semibold">Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Product amount paid on delivery. However, the{" "}
                      <span className="font-medium text-foreground">delivery charge must be paid in advance</span>{" "}
                      before dispatch.
                    </p>
                    {paymentMethod === "cod" && selectedArea && (
                      <div className="mt-3 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-700 px-3 py-2">
                        <div className="flex gap-2 items-start">
                          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-orange-700 dark:text-orange-300">
                            Delivery charge of <strong>{formatOmr(deliveryCharge)}</strong> for{" "}
                            <strong>{selectedWilayat}</strong> must be paid before your order ships.
                            Our team will contact you with payment instructions.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Online Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  paymentMethod === "online"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
                data-testid="btn-online"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === "online" ? "border-primary" : "border-muted-foreground"}`}>
                    {paymentMethod === "online" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">Online Payment</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay everything upfront — products + delivery charge included in total.
                    </p>
                    {paymentMethod === "online" && selectedArea && (
                      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 px-3 py-2">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Delivery charge of <strong>{formatOmr(deliveryCharge)}</strong> added to your total.
                          Full amount: <strong>{formatPrice(productTotal)} + {formatOmr(deliveryCharge)}</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </form>

          {/* ── Order Summary ── */}
          <div>
            <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>

              <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted border">
                      {item.productImage && (
                        <img src={item.productImage} alt={item.productName} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <span className="font-medium text-sm line-clamp-1">{item.productName}</span>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-bold">
                          {formatPrice(item.subtotal || item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Products Subtotal</span>
                  <span className="font-medium">{formatPrice(productTotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Delivery Charge
                    {selectedArea && (
                      <span className="ml-1 text-xs">({selectedArea.wilayat})</span>
                    )}
                  </span>
                  {selectedArea ? (
                    <span className={`font-semibold ${paymentMethod === "online" ? "text-foreground" : "text-orange-600"}`}>
                      {formatOmr(deliveryCharge)}
                      {paymentMethod === "cod" && (
                        <span className="ml-1 text-xs text-orange-500">(pre-pay)</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Select wilayat</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium capitalize">
                    {paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                  </span>
                </div>

                <div className="my-4 border-t pt-4">
                  {paymentMethod === "cod" ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-orange-600">Pay Now (Delivery Charge)</span>
                        <span className="font-bold text-orange-600">
                          {selectedArea ? formatOmr(deliveryCharge) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-foreground">Pay on Delivery</span>
                        <span className="text-xl font-extrabold text-primary">{formatPrice(productTotal)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-end">
                      <span className="text-base font-bold">Total to Pay</span>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-primary">{formatPrice(productTotal)}</div>
                        <div className="text-sm text-muted-foreground">
                          + {selectedArea ? formatOmr(deliveryCharge) : "delivery"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full mt-4 h-12 text-base font-bold shadow-md"
                disabled={createOrderMutation.isPending || !selectedWilayat}
                data-testid="btn-place-order"
              >
                {createOrderMutation.isPending
                  ? "Processing..."
                  : paymentMethod === "cod"
                  ? "Place Order (COD)"
                  : "Place Order (Online)"}
              </Button>

              {!selectedWilayat && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Please select your delivery wilayat to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
