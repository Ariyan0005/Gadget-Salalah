import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListProducts,
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListProductVariants,
  useCreateProductVariant,
  useUpdateProductVariant,
  useDeleteProductVariant,
  getListProductsQueryKey,
  getListProductVariantsQueryKey,
} from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Layers } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  images?: string | null;
  categoryId: number;
  isFeatured?: boolean | null;
  isActive?: boolean | null;
  brand?: string | null;
  sku?: string | null;
  categoryName?: string | null;
};

// ── Variant Manager ───────────────────────────────────────────────────────────
function VariantManager({ product }: { product: Product }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: variants = [], isLoading } = useListProductVariants(product.id, {
    query: { enabled: true, queryKey: getListProductVariantsQueryKey(product.id) },
  });
  const createVariant = useCreateProductVariant();
  const updateVariant = useUpdateProductVariant();
  const deleteVariant = useDeleteProductVariant();

  const [variantForm, setVariantForm] = useState({
    name: "", value: "", priceModifier: 0, stock: 0, sku: "", isDefault: false,
  });
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);

  const resetVariantForm = () => {
    setVariantForm({ name: "", value: "", priceModifier: 0, stock: 0, sku: "", isDefault: false });
    setEditingVariantId(null);
  };

  const handleVariantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: variantForm.name,
      value: variantForm.value,
      priceModifier: variantForm.priceModifier,
      stock: variantForm.stock,
      sku: variantForm.sku || undefined,
      isDefault: variantForm.isDefault,
    };
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: getListProductVariantsQueryKey(product.id) });
    };
    if (editingVariantId) {
      updateVariant.mutate(
        { id: product.id, variantId: editingVariantId, data },
        {
          onSuccess: () => { invalidate(); setIsVariantDialogOpen(false); resetVariantForm(); toast({ title: "Variant updated" }); },
          onError: () => toast({ title: "Error", description: "Could not update variant", variant: "destructive" }),
        }
      );
    } else {
      createVariant.mutate(
        { id: product.id, data },
        {
          onSuccess: () => { invalidate(); setIsVariantDialogOpen(false); resetVariantForm(); toast({ title: "Variant added" }); },
          onError: () => toast({ title: "Error", description: "Could not create variant", variant: "destructive" }),
        }
      );
    }
  };

  const handleEditVariant = (v: any) => {
    setEditingVariantId(v.id);
    setVariantForm({
      name: v.name, value: v.value, priceModifier: v.priceModifier ?? 0,
      stock: v.stock, sku: v.sku ?? "", isDefault: v.isDefault ?? false,
    });
    setIsVariantDialogOpen(true);
  };

  const handleDeleteVariant = (variantId: number) => {
    if (!confirm("Delete this variant?")) return;
    deleteVariant.mutate(
      { id: product.id, variantId },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListProductVariantsQueryKey(product.id) });
          toast({ title: "Variant deleted" });
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {variants.length === 0
            ? "No variants yet. Add variants like Color, Storage, Size."
            : `${variants.length} variant${variants.length !== 1 ? "s" : ""}`}
        </p>
        <Dialog
          open={isVariantDialogOpen}
          onOpenChange={(o) => { setIsVariantDialogOpen(o); if (!o) resetVariantForm(); }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetVariantForm}>
              <Plus className="h-4 w-4 mr-1" /> Add Variant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVariantId ? "Edit Variant" : "Add Variant"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVariantSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Option Name *</Label>
                  <Input
                    placeholder="e.g. Color, Storage, Size"
                    required
                    value={variantForm.name}
                    onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Option Value *</Label>
                  <Input
                    placeholder="e.g. Black, 128GB, XL"
                    required
                    value={variantForm.value}
                    onChange={(e) => setVariantForm({ ...variantForm, value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price Modifier (OMR)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    value={variantForm.priceModifier}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, priceModifier: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">Added to base price. Use negative to discount.</p>
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={variantForm.stock}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, stock: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>SKU (optional)</Label>
                <Input
                  placeholder="e.g. GS-IP16-BLK-128"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="variantDefault"
                  checked={variantForm.isDefault}
                  onCheckedChange={(c) => setVariantForm({ ...variantForm, isDefault: !!c })}
                />
                <Label htmlFor="variantDefault" className="cursor-pointer">
                  Default selection on product page
                </Label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createVariant.isPending || updateVariant.isPending}
                >
                  {editingVariantId ? "Update" : "Add Variant"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground py-4 text-center">Loading variants…</div>
      ) : variants.length > 0 ? (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Option</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Price Mod</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v: any) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>
                    {v.value}
                    {v.isDefault && (
                      <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {v.priceModifier === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={v.priceModifier > 0 ? "text-green-600" : "text-destructive"}>
                        {v.priceModifier > 0 ? "+" : ""}
                        {formatPrice(v.priceModifier)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.stock > 0 ? "outline" : "destructive"} className="text-xs">
                      {v.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{v.sku || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditVariant(v)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteVariant(v.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", price: 0, originalPrice: 0, stock: 0,
    imageUrl: "", categoryId: 0, isFeatured: false, isActive: true, brand: "", sku: "",
  });

  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
    limit: 100,
  });
  const { data: categories } = useListCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const products: Product[] = (productsData as any)?.products || productsData || [];

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name, slug: product.slug, description: product.description || "",
      price: product.price, originalPrice: product.originalPrice || 0, stock: product.stock,
      imageUrl: product.imageUrl || "", categoryId: product.categoryId,
      isFeatured: product.isFeatured || false, isActive: product.isActive !== false,
      brand: product.brand || "", sku: product.sku || "",
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: "", slug: "", description: "", price: 0, originalPrice: 0, stock: 0,
      imageUrl: "", categoryId: categories?.[0]?.id || 0,
      isFeatured: false, isActive: true, brand: "", sku: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, originalPrice: formData.originalPrice > 0 ? formData.originalPrice : undefined };
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Product updated" });
          },
        }
      );
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
            toast({ title: "Product created" });
          },
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this product and all its variants?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          toast({ title: "Product deleted" });
        },
      }
    );
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return (
    <AdminLayout>
      {/* Variant Manager Dialog */}
      <Dialog open={!!variantProduct} onOpenChange={(o) => { if (!o) setVariantProduct(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Variants — {variantProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {variantProduct && <VariantManager product={variantProduct} />}
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Product Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name, slug: !editingId ? autoSlug(name) : formData.slug });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Input
                  placeholder="e.g. Apple, Samsung"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={String(formData.categoryId)}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price (OMR) *</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  step="0.001"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Original Price (OMR)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.001"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock (base)</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(c) => setFormData({ ...formData, isActive: !!c })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active (visible on store)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(c) => setFormData({ ...formData, isFeatured: !!c })}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">Featured</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {Array.isArray(products) ? products.length : 0} products
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Loading products…
                </TableCell>
              </TableRow>
            ) : !Array.isArray(products) || products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{product.sku || "—"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.categoryName || "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{formatPrice(product.price)}</p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.stock > 5 ? "outline" : product.stock > 0 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {product.isActive !== false ? (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600 w-fit">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs w-fit">Inactive</Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-xs border-accent text-accent w-fit">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Manage variants"
                        onClick={() => setVariantProduct(product)}
                      >
                        <Layers className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
