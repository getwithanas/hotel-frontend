import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsService } from '@/services/bills.service';
import { ordersService } from '@/services/orders.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Receipt, Plus } from 'lucide-react';
import { PAYMENT_METHODS, ORDER_STATUS_LABELS } from '@/lib/constants';
import type { Bill, PaymentMethod, Order } from '@/types';

export default function BillingPage() {
  const queryClient = useQueryClient();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [discount, setDiscount] = useState('0');
  const [dateFilter, setDateFilter] = useState('');

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills', dateFilter],
    queryFn: () => billsService.list({ date: dateFilter || undefined }),
  });

  const { data: servedOrders } = useQuery({
    queryKey: ['orders', 'SERVED'],
    queryFn: () => ordersService.list({ status: 'SERVED' }),
  });

  const generateMutation = useMutation({
    mutationFn: () => billsService.generate({
      orderId: parseInt(selectedOrderId),
      paymentMethod,
      discount: parseFloat(discount) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowGenerateDialog(false);
      toast.success('Bill generated');
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">{bills?.length || 0} bills</p>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)} disabled={!servedOrders?.length}>
          <Plus className="h-4 w-4 mr-1" /> Generate Bill
        </Button>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-[160px]" />
        </div>
      </div>

      {/* Bills list */}
      {bills && bills.length > 0 ? (
        <div className="space-y-3">
          {bills.map(bill => (
            <div key={bill.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bill #{bill.id}</p>
                  <p className="text-xs text-muted-foreground">Order #{bill.orderId} • {new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Subtotal: ${bill.subtotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Tax: ${bill.taxAmount.toFixed(2)} ({bill.taxRate}%)</p>
                  {bill.discount > 0 && <p className="text-xs text-success">Discount: -${bill.discount.toFixed(2)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">${bill.total.toFixed(2)}</p>
                  <StatusBadge status={bill.paymentMethod} label={bill.paymentMethod} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Receipt} title="No bills found" />
      )}

      {/* Generate Bill Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Served Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger><SelectValue placeholder="Choose order" /></SelectTrigger>
                <SelectContent>
                  {servedOrders?.map(o => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      Order #{o.id} {o.table ? `- Table ${o.table.number}` : ''} (${o.totalAmount?.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount ($)</Label>
              <Input type="number" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
            <Button onClick={() => generateMutation.mutate()} disabled={!selectedOrderId || generateMutation.isPending}>
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
