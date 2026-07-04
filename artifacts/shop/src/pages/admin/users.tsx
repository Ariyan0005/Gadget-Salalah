import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListUsers, useUpdateUser, getListUsersQueryKey, UserUpdateRole } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const { data: usersData, isLoading } = useListUsers({ search: search || undefined, limit: 50 });
  const updateMutation = useUpdateUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRoleChange = (id: number, role: string) => {
    updateMutation.mutate({ id, data: { role: role as UserUpdateRole } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: "User role updated" });
      }
    });
  };

  const handleActiveToggle = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        toast({ title: isActive ? "User activated" : "User deactivated" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 bg-card"
          />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : usersData?.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.phone || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={user.isActive !== false} 
                      onCheckedChange={(c) => handleActiveToggle(user.id, c)} 
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Select defaultValue={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                      <SelectTrigger className="w-[110px] ml-auto h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
