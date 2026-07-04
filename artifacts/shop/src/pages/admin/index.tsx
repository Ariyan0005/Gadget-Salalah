import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats, useGetRecentOrders, useGetLowStockProducts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { Users, ShoppingBag, Package, DollarSign, AlertCircle, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = ['#00BFFF', '#f97316', '#047857', '#eab308', '#dc2626'];

export default function AdminDashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetAdminStats();
  const { data: recentOrders } = useGetRecentOrders();
  const { data: lowStock } = useGetLowStockProducts({ threshold: 10 });
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg("");
    try {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/admin/seed", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      setSeedMsg(data.ok
        ? `✅ Added: ${data.categories} categories, ${data.products} products, ${data.banners} banners`
        : `❌ ${data.error}`);
      queryClient.invalidateQueries();
    } catch (e: any) { setSeedMsg("❌ " + e.message); }
    setSeeding(false);
  };

  if (isStatsLoading) return <AdminLayout><div className="p-8">Loading stats...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <Button onClick={handleSeed} disabled={seeding} variant="outline" size="sm" className="gap-2 text-accent border-accent/30 hover:bg-accent/5 shrink-0">
              <Sparkles className="h-4 w-4" />
              {seeding ? "Adding demo data…" : "Add Demo Data"}
            </Button>
            {seedMsg && <p className="text-xs text-muted-foreground max-w-xs text-right">{seedMsg}</p>}
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatPrice(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1 text-green-600">
                +{formatPrice(stats?.todayRevenue || 0)} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{stats?.todayOrders || 0} today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {stats?.lowStockCount || 0} low stock
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.ordersByStatus || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="status" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.revenueByCategory || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="categoryName"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(stats?.revenueByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatPrice(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders?.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd, HH:mm')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                      <p className={`text-xs capitalize ${order.status === 'delivered' ? 'text-green-600' : 'text-orange-500'}`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStock?.map(product => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden shrink-0">
                        {product.imageUrl && <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku || 'No SKU'}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="inline-flex items-center justify-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))}
                {lowStock?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No low stock items! All products are well stocked.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
