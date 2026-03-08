import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/menu.service';
import { categoriesService } from '@/services/categories.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
import { Plus, Search, UtensilsCrossed, Edit, Trash2, Image } from 'lucide-react';
import type { MenuItem, Category } from '@/types';

export default function MenuPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', categoryId: '', isVeg: false });
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
      setItemForm({ name: item.name, description: item.description || '', price: item.price.toString(), categoryId: item.categoryId.toString(), isVeg: item.isVeg });
    } else {
      setEditingItem(null);
      setItemForm({ name: '', description: '', price: '', categoryId: '', isVeg: false });
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
    if (imageFile) fd.append('image', imageFile);
    createItemMutation.mutate(fd);
  };

  const filteredItems = menuItems?.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  if (menuLoading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Menu Management</h1>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="filter-bar flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {categories?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => openItemDialog()}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="glass-card overflow-hidden">
                  {item.image && (
                    <div className="h-36 bg-muted flex items-center justify-center overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                      {item.isVeg && <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success font-medium">VEG</span>}
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">${item.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">{item.category?.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleMutation.mutate(item.id)}
                        />
                        <span className="text-xs text-muted-foreground">{item.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openItemDialog(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteItemMutation.mutate(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(cat => (
                <div key={cat.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{cat.name}</h4>
                    {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                    <span className="text-xs text-muted-foreground">{cat.itemCount || 0} items</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                      setEditingCategory(cat);
                      setCategoryForm({ name: cat.name, description: cat.description || '' });
                      setShowCategoryDialog(true);
                    }}><Edit className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCategoryMutation.mutate(cat.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="flex items-center gap-2">
              <Switch checked={itemForm.isVeg} onCheckedChange={v => setItemForm(f => ({ ...f, isVeg: v }))} />
              <Label>Vegetarian</Label>
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
