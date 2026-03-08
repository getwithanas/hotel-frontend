import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';
import type { User, UserRole, CreateUserRequest } from '@/types';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [form, setForm] = useState<CreateUserRequest & { active?: boolean }>({
    name: '', email: '', password: '', phone: '', role: 'WAITER',
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => usersService.list(roleFilter !== 'ALL' ? { role: roleFilter } : undefined),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => editing
      ? usersService.update(editing.id, { name: data.name, email: data.email, phone: data.phone, role: data.role, active: form.active })
      : usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowDialog(false);
      setEditing(null);
      toast.success(editing ? 'Staff updated' : 'Staff created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Staff deactivated');
    },
  });

  const openDialog = (user?: User) => {
    if (user) {
      setEditing(user);
      setForm({ name: user.name, email: user.email, password: '', phone: user.phone || '', role: user.role, active: user.active });
    } else {
      setEditing(null);
      setForm({ name: '', email: '', password: '', phone: '', role: 'WAITER' });
    }
    setShowDialog(true);
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">{users?.length || 0} staff members</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-1" /> Add Staff
        </Button>
      </div>

      <div className="filter-bar">
        {['ALL', 'ADMIN', 'WAITER', 'KITCHEN', 'CASHIER'].map(r => (
          <Button key={r} variant={roleFilter === r ? 'default' : 'outline'} size="sm" onClick={() => setRoleFilter(r)}>
            {r === 'ALL' ? 'All Roles' : ROLE_LABELS[r as UserRole]}
          </Button>
        ))}
      </div>

      {users && users.length > 0 ? (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={user.role} label={ROLE_LABELS[user.role]} />
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openDialog(user)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteMutation.mutate(user.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No staff found" action={{ label: 'Add Staff', onClick: () => openDialog() }} />
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editing && (
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
                <Label>Active</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
