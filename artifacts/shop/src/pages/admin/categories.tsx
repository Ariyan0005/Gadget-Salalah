import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", imageUrl: "" });

  const { data: categories, isLoading } = useListCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name, slug: category.slug, description: category.description || "", imageUrl: category.imageUrl || ""
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "", imageUrl: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Category updated" });
        }
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Category created" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this category? Products might be orphaned.")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          toast({ title: "Category deleted" });
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <Button onClick={handleNew}><Plus className="h-4 w-4 mr-2" /> Add Category</Button>
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : categories?.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                      {cat.imageUrl ? <img src={cat.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="font-bold text-muted-foreground">{cat.name[0]}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell>{cat.productCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={e => {
                  setFormData({...formData, name: e.target.value, slug: editingId ? formData.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')});
                }} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
