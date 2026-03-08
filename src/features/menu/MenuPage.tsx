import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/menu.service';
import { categoriesService } from '@/services/categories.service';
import { settingsService } from '@/services/settings.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Search, UtensilsCrossed, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MenuItem, Category } from '@/types';

import { MenuItemCard } from './components/MenuItemCard';
import { MenuItemDialog } from './components/MenuItemDialog';
import { CategoryDialog } from './components/CategoryDialog';
import { LowStockBanner } from './components/LowStockBanner';

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

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

  // ── Queries ──
  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => menuService.list(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.list(),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  });

  const LOW_STOCK_THRESHOLD = Number(settings?.lowStockThreshold) || DEFAULT_LOW_STOCK_THRESHOLD;

  // ── Mutations ──
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

  // ── Derived data ──
  const filteredItems = menuItems?.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId.toString() === categoryFilter;
    const matchesStock = stockFilter === 'ALL' || (stockFilter === 'LOW' && (item.stock ?? 0) > 0 && (item.stock ?? 0) <= LOW_STOCK_THRESHOLD) || (stockFilter === 'OUT' && (item.stock ?? 0) === 0);
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const lowStockItems = menuItems?.filter(i => (i.stock ?? 0) > 0 && (i.stock ?? 0) <= LOW_STOCK_THRESHOLD) || [];
  const outOfStockItems = menuItems?.filter(i => (i.stock ?? 0) === 0) || [];

  const openItemDialog = (item?: MenuItem) => {
    setEditingItem(item ?? null);
    setShowItemDialog(true);
  };

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
          <LowStockBanner lowStockItems={lowStockItems} outOfStockItems={outOfStockItems} threshold={LOW_STOCK_THRESHOLD} />

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
                <MenuItemCard
                  key={item.id}
                  item={item}
                  lowStockThreshold={LOW_STOCK_THRESHOLD}
                  onEdit={openItemDialog}
                  onDelete={id => deleteItemMutation.mutate(id)}
                  onToggle={id => toggleMutation.mutate(id)}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState icon={UtensilsCrossed} title="No menu items" action={{ label: 'Add Item', onClick: () => openItemDialog() }} />
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingCategory(null); setShowCategoryDialog(true); }}>
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

      {/* Dialogs */}
      <MenuItemDialog
        open={showItemDialog}
        onOpenChange={setShowItemDialog}
        editingItem={editingItem}
        categories={categories || []}
        isPending={createItemMutation.isPending}
        onSubmit={fd => createItemMutation.mutate(fd)}
      />

      <CategoryDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        editingCategory={editingCategory}
        isPending={createCategoryMutation.isPending}
        onSubmit={data => createCategoryMutation.mutate(data)}
      />
    </div>
  );
}
