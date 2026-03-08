import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsService } from '@/services/bills.service';
import { ordersService } from '@/services/orders.service';
import { settingsService } from '@/services/settings.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Receipt, Plus, Printer } from 'lucide-react';
import { PAYMENT_METHODS } from '@/lib/constants';
import { printBill } from '@/lib/print-utils';
import { motion } from 'framer-motion';
import type { Bill, PaymentMethod } from '@/types';

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

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
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

  const handlePrintBill = async (bill: Bill) => {
    try {
      const fullBill = await billsService.getById(bill.id);
      const order = fullBill.order;
      printBill({
        billId: fullBill.id,
        orderId: fullBill.orderId,
        hotelName: settings?.hotelName,
        items: order?.items?.map(i => ({
          name: i.menuItem?.name || `Item #${i.menuItemId}`,
          qty: i.quantity,
          price: i.price,
          total: i.price * i.quantity,
        })) || [],
        subtotal: fullBill.subtotal,
        taxRate: fullBill.taxRate,
        taxAmount: fullBill.taxAmount,
        discount: fullBill.discount,
        total: fullBill.total,
        paymentMethod: fullBill.paymentMethod,
        date: fullBill.createdAt,
      });
    } catch {
      printBill({
        billId: bill.id,
        orderId: bill.orderId,
        hotelName: settings?.hotelName,
        items: [],
        subtotal: bill.subtotal,
        taxRate: bill.taxRate,
        taxAmount: bill.taxAmount,
        discount: bill.discount,
        total: bill.total,
        paymentMethod: bill.paymentMethod,
        date: bill.createdAt,
      });
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-success/15">
            <Receipt className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="page-title">Billing</h1>
            <p className="page-subtitle">{bills?.length || 0} bills</p>
          </div>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)} disabled={!servedOrders?.length}>
          <Plus className="h-4 w-4 mr-1" /> Generate Bill
        </Button>
      </div>

      <div className="filter-bar">
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-[160px]" />
        </div>
      </div>

      {bills && bills.length > 0 ? (
        <motion.div
          className="space-y-2"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        >
          {bills.map(bill => (
            <motion.div
              key={bill.id}
              className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ x: 2 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-success/10">
                  <Receipt className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bill #{bill.id}</p>
                  <p className="text-xs text-muted-foreground">Order #{bill.orderId} • {new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">Subtotal: ${bill.subtotal.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Tax: ${bill.taxAmount.toFixed(2)} ({bill.taxRate}%)</p>
                  {bill.discount > 0 && <p className="text-xs text-success">Discount: -${bill.discount.toFixed(2)}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">${bill.total.toFixed(2)}</p>
                  <StatusBadge status={bill.paymentMethod} label={bill.paymentMethod} />
                </div>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => handlePrintBill(bill)} title="Print Bill">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState icon={Receipt} title="No bills found" />
      )}

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
