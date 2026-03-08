import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tablesService } from '@/services/tables.service';
import { TableCard } from '@/components/common/TableCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Plus, Table2 } from 'lucide-react';
import type { RestaurantTable, TableStatus, CreateTableRequest } from '@/types';
import { TABLE_STATUS_LABELS } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

export default function TablesPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTableRequest>({ number: '1', capacity: 4 });

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tablesService.list(),
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTableRequest) => tablesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowCreateDialog(false);
      toast.success('Table created');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TableStatus }) => tablesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table status updated');
    },
  });

  const filteredTables = tables?.filter(t => filter === 'ALL' || t.status === filter) || [];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading tables..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tables</h1>
          <p className="page-subtitle">{tables?.length || 0} tables total</p>
        </div>
        {hasRole('ADMIN') && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Table
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        {['ALL', 'FREE', 'OCCUPIED', 'RESERVED'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'ALL' ? 'All' : TABLE_STATUS_LABELS[status as TableStatus]}
          </Button>
        ))}
      </div>

      {/* Table grid */}
      {filteredTables.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} onClick={setSelectedTable} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Table2} title="No tables found" description="No tables match the current filter" />
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table Number</Label>
              <Input type="number" value={createForm.number} onChange={e => setCreateForm(f => ({ ...f, number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" value={createForm.capacity} onChange={e => setCreateForm(f => ({ ...f, capacity: parseInt(e.target.value) || 2 }))} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g. Rooftop, Ground Floor" value={createForm.location || ''} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(createForm)} disabled={createMutation.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Detail Sheet */}
      <Sheet open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Table {selectedTable?.number}</SheetTitle>
          </SheetHeader>
          {selectedTable && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={selectedTable.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Capacity:</span>
                <span className="text-sm font-medium text-foreground">{selectedTable.capacity} seats</span>
              </div>
              {selectedTable.location && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium text-foreground">{selectedTable.location}</span>
                </div>
              )}

              {/* Status actions */}
              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {(['FREE', 'OCCUPIED', 'RESERVED'] as TableStatus[]).map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedTable.status === status ? 'default' : 'outline'}
                      onClick={() => statusMutation.mutate({ id: selectedTable.id, status })}
                      disabled={selectedTable.status === status}
                    >
                      {TABLE_STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Active orders */}
              {selectedTable.activeOrders && selectedTable.activeOrders.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Active Orders</p>
                  {selectedTable.activeOrders.map(order => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-accent"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <span className="text-sm font-medium">Order #{order.id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  ))}
                </div>
              )}

              {/* New order */}
              <Button
                className="w-full"
                onClick={() => navigate(`/orders/new?tableId=${selectedTable.id}`)}
              >
                New Order for Table {selectedTable.number}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
