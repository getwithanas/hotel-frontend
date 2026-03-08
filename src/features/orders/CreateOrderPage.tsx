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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, Search, Leaf, ImageIcon, MapPin, Phone, User, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, fmt, imgUrl } from '@/lib/utils';
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

  const { data: menuItems, isLoading: menuLoading, isError: menuError } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuService.list({ available: true }),
    retry: 2,
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

  const updateNote = (itemId: number, note: string) => {
    setCart(prev => prev.map(c => c.menuItem.id === itemId ? { ...c, note } : c));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

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

  if (menuLoading) return <LoadingSpinner size="lg" text="Loading menu..." />;

  if (menuError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Failed to load menu. Check your connection.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="page-title">New Order</h1>
            <p className="page-subtitle">Select items and place order</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order type selector */}
          <div className="bg-card border border-border rounded-xl p-3 flex flex-wrap items-center gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex rounded-lg bg-muted p-0.5">
              {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as OrderType[]).map(type => (
                <button
                  key={type}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                    orderType === type
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setOrderType(type)}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
            {orderType === 'DINE_IN' && (
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger className="w-[140px] h-8"><SelectValue placeholder="Select table" /></SelectTrigger>
                <SelectContent>
                  {tables?.filter(t => t.status === 'FREE' || t.id.toString() === tableId).map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>Table {t.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Delivery info */}
          <AnimatePresence>
            {orderType === 'DELIVERY' && (
              <motion.div
                className="bg-card border border-border rounded-xl p-4 space-y-3"
                style={{ boxShadow: 'var(--shadow-sm)' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Delivery Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Customer Name" value={deliveryInfo.customerName} onChange={e => setDeliveryInfo(d => ({ ...d, customerName: e.target.value }))} />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Phone" value={deliveryInfo.phone} onChange={e => setDeliveryInfo(d => ({ ...d, phone: e.target.value }))} />
                  </div>
                </div>
                <Textarea placeholder="Delivery Address" value={deliveryInfo.address} onChange={e => setDeliveryInfo(d => ({ ...d, address: e.target.value }))} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and category filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
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
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.03 } } }}
          >
            {filteredMenu.map(item => {
              const inCart = cart.find(c => c.menuItem.id === item.id);
              return (
                <motion.div
                  key={item.id}
                  className={cn(
                    'bg-card border rounded-xl overflow-hidden transition-colors',
                    inCart ? 'border-primary/40 ring-1 ring-primary/10' : 'border-border'
                  )}
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2 }}
                >
                  {/* Image area */}
                  {item.image ? (
                    <div className="h-28 bg-muted overflow-hidden">
                      <img
                        src={imgUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center'); const svg = document.createElement('div'); svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/30"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'; e.currentTarget.parentElement!.appendChild(svg.firstChild!); }}
                      />
                    </div>
                  ) : null}

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-sm">{item.name}</span>
                        {item.isVeg && (
                          <Leaf className="h-3 w-3 text-success shrink-0" />
                        )}
                      </div>
                      <span className="font-bold text-primary text-sm whitespace-nowrap">${fmt(item.price)}</span>
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{item.description}</p>}

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.category?.name}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1.5">
                          <Button size="icon" variant="outline" className="h-6 w-6 rounded-md" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-2.5 w-2.5" />
                          </Button>
                          <motion.span
                            key={inCart.quantity}
                            className="text-sm font-bold w-5 text-center text-primary"
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                          >
                            {inCart.quantity}
                          </motion.span>
                          <Button size="icon" variant="outline" className="h-6 w-6 rounded-md" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addToCart(item)}>
                          <Plus className="h-3 w-3 mr-0.5" /> Add
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Cart sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl sticky top-4 overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
            {/* Cart header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                    {cartItemCount}
                  </span>
                )}
              </h3>
            </div>

            <div className="p-4">
              {cart.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div
                        key={item.menuItem.id}
                        className="rounded-lg bg-muted/50 border border-border p-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        layout
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.menuItem.name}</p>
                            <p className="text-xs text-muted-foreground">${fmt(item.menuItem.price)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.menuItem.id, -1)}>
                              <Minus className="h-2.5 w-2.5" />
                            </Button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.menuItem.id, 1)}>
                              <Plus className="h-2.5 w-2.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => updateQuantity(item.menuItem.id, -item.quantity)}>
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          placeholder="Add note..."
                          value={item.note}
                          onChange={e => updateNote(item.menuItem.id, e.target.value)}
                          className="mt-2 h-7 text-xs bg-background"
                        />
                        <div className="text-right mt-1">
                          <span className="text-sm font-semibold text-foreground">${fmt(Number(item.menuItem.price) * item.quantity)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <motion.span key={cartTotal} initial={{ scale: 1.1 }} animate={{ scale: 1 }}>
                        ${fmt(cartTotal)}
                      </motion.span>
                    </div>
                  </div>

                  <Button className="w-full mt-3" size="lg" onClick={handleSubmit} disabled={createMutation.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    Place Order
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Browse the menu and add items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
