import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/menu.service';
import { categoriesService } from '@/services/categories.service';
import { settingsService } from '@/services/settings.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MenuItemImage } from '@/components/common/MenuItemImage';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, UtensilsCrossed, Edit, Trash2, Leaf, ImageIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, fmt, imgUrl } from '@/lib/utils';
import type { MenuItem, Category } from '@/types';

const LOW_STOCK_THRESHOLD = 5;

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function MenuPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', categoryId: '', isVeg: false, stock: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuService.list(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
  });

  const createItemMutation = useMutation({
    mutationFn: (data: FormData) => editingItem ? menuService.update(editingItem.id, data) : menuService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setShowItemDialog(false);
      setEditingItem(null);
      toast.success(editingItem ? 'Item updated' : 'Item created');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => menuService.toggleAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Availability updated');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => menuService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Item deleted');
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      editingCategory ? categoriesService.update(editingCategory.id, data) : categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      toast.success(editingCategory ? 'Category updated' : 'Category created');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
  });

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({ name: item.name, description: item.description || '', price: item.price.toString(), categoryId: item.categoryId.toString(), isVeg: item.isVeg, stock: (item.stock ?? 0).toString() });
    } else {
      setEditingItem(null);
      setItemForm({ name: '', description: '', price: '', categoryId: '', isVeg: false, stock: '' });
    }
    setImageFile(null);
    setShowItemDialog(true);
  };

  const handleItemSubmit = () => {
    const fd = new FormData();
    fd.append('name', itemForm.name);
    fd.append('description', itemForm.description);
    fd.append('price', itemForm.price);
    fd.append('categoryId', itemForm.categoryId);
    fd.append('isVeg', itemForm.isVeg.toString());
    fd.append('stock', itemForm.stock || '0');
    if (imageFile) fd.append('image', imageFile);
    createItemMutation.mutate(fd);
  };

  const filteredItems = menuItems?.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId.toString() === categoryFilter;
    const matchesStock = stockFilter === 'ALL' || (stockFilter === 'LOW' && (item.stock ?? 0) > 0 && (item.stock ?? 0) <= LOW_STOCK_THRESHOLD) || (stockFilter === 'OUT' && (item.stock ?? 0) === 0);
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const lowStockItems = menuItems?.filter(i => (i.stock ?? 0) > 0 && (i.stock ?? 0) <= LOW_STOCK_THRESHOLD) || [];
  const outOfStockItems = menuItems?.filter(i => (i.stock ?? 0) === 0) || [];

  if (menuLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Menu Management</h1>
            <p className="page-subtitle">{menuItems?.length || 0} items across {categories?.length || 0} categories</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-4">
          {/* Low stock warning banner */}
          {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                {outOfStockItems.length > 0 && (
                  <p className="text-destructive font-medium">
                    {outOfStockItems.length} item{outOfStockItems.length > 1 ? 's' : ''} out of stock
                  </p>
                )}
                {lowStockItems.length > 0 && (
                  <p className="text-warning-foreground">
                    {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low (≤{LOW_STOCK_THRESHOLD}):{' '}
                    <span className="font-medium">{lowStockItems.map(i => `${i.name} (${i.stock})`).join(', ')}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stock" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stock</SelectItem>
                  <SelectItem value="LOW">Low Stock</SelectItem>
                  <SelectItem value="OUT">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => openItemDialog()}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          {filteredItems.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  className="bg-card border border-border rounded-xl overflow-hidden group"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                  variants={cardVariants}
                  whileHover={{ y: -3, boxShadow: '0 8px 20px -8px hsl(var(--primary) / 0.1)' }}
                >
                  {/* Image */}
                  <div className="h-36 bg-muted/50 flex items-center justify-center overflow-hidden relative">
                    {item.image ? (
                      <MenuItemImage src={item.image} alt={item.name} className="w-full h-full" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    )}
                    {/* Veg badge overlay */}
                    {item.isVeg && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-success/90 text-success-foreground font-medium">
                        <Leaf className="h-2.5 w-2.5" /> VEG
                      </span>
                    )}
                    {/* Availability overlay */}
                    {!item.available && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full">Unavailable</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
                      <span className="font-bold text-primary text-sm whitespace-nowrap">${fmt(item.price)}</span>
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.category?.name}</span>
                      {(item.stock ?? 0) === 0 ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-destructive/10 text-destructive animate-pulse">
                          Out of Stock
                        </span>
                      ) : (item.stock ?? 0) <= LOW_STOCK_THRESHOLD ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-warning/15 text-warning-foreground">
                          ⚠ Low: {item.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-success/10 text-success">
                          Stock: {item.stock}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleMutation.mutate(item.id)}
                        />
                        <span className={cn('text-xs', item.available ? 'text-success' : 'text-muted-foreground')}>
                          {item.available ? 'Available' : 'Off'}
                        </span>
                      </div>
                      <div className="flex gap-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openItemDialog(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteItemMutation.mutate(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState icon={UtensilsCrossed} title="No menu items" action={{ label: 'Add Item', onClick: () => openItemDialog() }} />
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); setShowCategoryDialog(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </div>
          {categories && categories.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
              {categories.map(cat => (
                <motion.div
                  key={cat.id}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                  style={{ boxShadow: 'var(--shadow-sm)' }}
                  variants={cardVariants}
                  whileHover={{ y: -2 }}
                >
                  <div>
                    <h4 className="font-semibold text-foreground">{cat.name}</h4>
                    {cat.description && <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>}
                    <span className="text-xs text-muted-foreground mt-1 inline-block">{cat.itemCount || 0} items</span>
                  </div>
                  <div className="flex gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                      setEditingCategory(cat);
                      setCategoryForm({ name: cat.name, description: cat.description || '' });
                      setShowCategoryDialog(true);
                    }}><Edit className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteCategoryMutation.mutate(cat.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState title="No categories" action={{ label: 'Add Category', onClick: () => setShowCategoryDialog(true) }} />
          )}
        </TabsContent>
      </Tabs>

      {/* Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={itemForm.categoryId} onValueChange={v => setItemForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={itemForm.isVeg} onCheckedChange={v => setItemForm(f => ({ ...f, isVeg: v }))} />
                <Label>Vegetarian</Label>
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" min="0" value={itemForm.stock} onChange={e => setItemForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Cancel</Button>
            <Button onClick={handleItemSubmit} disabled={createItemMutation.isPending}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={categoryForm.name} onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={categoryForm.description} onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={() => createCategoryMutation.mutate(categoryForm)} disabled={createCategoryMutation.isPending}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
