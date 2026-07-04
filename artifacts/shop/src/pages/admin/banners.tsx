import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, getListBannersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function AdminBanners() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", subtitle: "", imageUrl: "", linkUrl: "", sortOrder: 0, isActive: true });

  const { data: banners, isLoading } = useListBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEdit = (banner: any) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title, subtitle: banner.subtitle || "", imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "", sortOrder: banner.sortOrder || 0, isActive: banner.isActive
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ title: "", subtitle: "", imageUrl: "", linkUrl: "", sortOrder: 0, isActive: true });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Banner updated" });
        }
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          setIsDialogOpen(false);
          toast({ title: "Banner created" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this banner?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          toast({ title: "Banner deleted" });
        }
      });
    }
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !currentActive } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() })
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Hero Banners</h1>
          <Button onClick={handleNew}><Plus className="h-4 w-4 mr-2" /> Add Banner</Button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners?.sort((a,b) => (a.sortOrder||0) - (b.sortOrder||0)).map(banner => (
              <div key={banner.id} className={`rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col ${!banner.isActive ? 'opacity-60' : ''}`}>
                <div className="aspect-[16/9] w-full bg-muted relative">
                  <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-4 text-white">
                    <h3 className="font-bold text-lg leading-tight">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm opacity-90 mt-1">{banner.subtitle}</p>}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between border-t bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Switch checked={banner.isActive} onCheckedChange={() => toggleActive(banner.id, banner.isActive)} />
                    <span className="text-xs font-medium">{banner.isActive ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(banner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Banner" : "Add Banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle (Optional)</Label>
                <Input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link URL (Optional)</Label>
                  <Input value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" required value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="active" checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
                <Label htmlFor="active">Active</Label>
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
