import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { menuService } from '@/services/menu.service';
import { tablesService } from '@/services/tables.service';
import { categoriesService } from '@/services/categories.service';
import { ordersService } from '@/services/orders.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, Search } from 'lucide-react';
import type { MenuItem, OrderType, CreateOrderRequest } from '@/types';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note: string;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preselectedTableId = searchParams.get('tableId');

  const [orderType, setOrderType] = useState<OrderType>(preselectedTableId ? 'DINE_IN' : 'DINE_IN');
  const [tableId, setTableId] = useState<string>(preselectedTableId || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [deliveryInfo, setDeliveryInfo] = useState({ customerName: '', phone: '', address: '' });

  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuService.list({ available: true }),
  });

  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tablesService.list(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersService.create(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success(`Order #${order.id} created!`);
      navigate('/orders');
    },
  });

  const filteredMenu = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(item => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || item.categoryId.toString() === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, search, categoryFilter]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menuItem: item, quantity: 1, note: '' }];
    });
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev
      .map(c => c.menuItem.id === itemId ? { ...c, quantity: c.quantity + delta } : c)
      .filter(c => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  const handleSubmit = () => {
    if (cart.length === 0) { toast.error('Add items to the order'); return; }
    if (orderType === 'DINE_IN' && !tableId) { toast.error('Select a table'); return; }
    if (orderType === 'DELIVERY' && (!deliveryInfo.customerName || !deliveryInfo.phone || !deliveryInfo.address)) {
      toast.error('Fill in delivery details'); return;
    }

    const data: CreateOrderRequest = {
      type: orderType,
      tableId: orderType === 'DINE_IN' ? parseInt(tableId) : undefined,
      items: cart.map(c => ({ menuItemId: c.menuItem.id, quantity: c.quantity, note: c.note || undefined })),
      delivery: orderType === 'DELIVERY' ? deliveryInfo : undefined,
    };

    createMutation.mutate(data);
  };

  if (menuLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="page-title">New Order</h1>
            <p className="page-subtitle">Select items and place order</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order config */}
          <div className="filter-bar">
            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DINE_IN">Dine In</SelectItem>
                <SelectItem value="TAKEAWAY">Takeaway</SelectItem>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
              </SelectContent>
            </Select>
            {orderType === 'DINE_IN' && (
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Select table" /></SelectTrigger>
                <SelectContent>
                  {tables?.filter(t => t.status === 'FREE' || t.id.toString() === tableId).map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>Table {t.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Delivery info */}
          {orderType === 'DELIVERY' && (
            <div className="glass-card p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Delivery Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Customer Name" value={deliveryInfo.customerName} onChange={e => setDeliveryInfo(d => ({ ...d, customerName: e.target.value }))} />
                <Input placeholder="Phone" value={deliveryInfo.phone} onChange={e => setDeliveryInfo(d => ({ ...d, phone: e.target.value }))} />
              </div>
              <Textarea placeholder="Delivery Address" value={deliveryInfo.address} onChange={e => setDeliveryInfo(d => ({ ...d, address: e.target.value }))} />
            </div>
          )}

          {/* Menu search/filter */}
          <div className="filter-bar">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories?.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Menu grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.menuItem.id === item.id);
              return (
                <div key={item.id} className="glass-card p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground text-sm">{item.name}</span>
                      {item.isVeg && <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success font-medium">VEG</span>}
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-5 text-center">{inCart.quantity}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 sticky top-4">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Cart ({cart.length} items)
            </h3>

            {cart.length > 0 ? (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.menuItem.name}</p>
                      <p className="text-xs text-muted-foreground">${item.menuItem.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-sm font-semibold">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => updateQuantity(item.menuItem.id, -item.quantity)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending}>
                  Place Order
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No items added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
