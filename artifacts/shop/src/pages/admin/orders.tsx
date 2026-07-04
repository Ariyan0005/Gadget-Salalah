import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { OrderStatusUpdateStatus } from "@workspace/api-client-react";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: ordersData, isLoading } = useListOrders({
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 50
  });

  const updateMutation = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateMutation.mutate({
      id,
      data: { status: newStatus as OrderStatusUpdateStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast({ title: "Order status updated" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID / Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : ordersData?.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">#{order.id}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{order.userName || 'Guest'}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                  </TableCell>
                  <TableCell className="font-bold">{formatPrice(order.total)}</TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{order.trackingId || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select defaultValue={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                      <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {ordersData?.orders.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
