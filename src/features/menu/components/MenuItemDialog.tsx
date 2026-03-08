import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuItem, Category } from '@/types';

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: MenuItem | null;
  categories: Category[];
  isPending: boolean;
  onSubmit: (fd: FormData) => void;
}

export function MenuItemDialog({ open, onOpenChange, editingItem, categories, isPending, onSubmit }: MenuItemDialogProps) {
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', isVeg: false, stock: '', spiceLevel: '0' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setForm({
          name: editingItem.name,
          description: editingItem.description || '',
          price: editingItem.price.toString(),
          categoryId: editingItem.categoryId.toString(),
          isVeg: editingItem.isVeg,
          stock: (editingItem.stock ?? 0).toString(),
          spiceLevel: (editingItem.spiceLevel ?? 0).toString(),
        });
      } else {
        setForm({ name: '', description: '', price: '', categoryId: '', isVeg: false, stock: '', spiceLevel: '0' });
      }
      setImageFile(null);
    }
  }, [open, editingItem]);

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('categoryId', form.categoryId);
    fd.append('isVeg', form.isVeg.toString());
    fd.append('stock', form.stock || '0');
    fd.append('spiceLevel', form.spiceLevel || '0');
    if (imageFile) fd.append('image', imageFile);
    onSubmit(fd);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.isVeg} onCheckedChange={v => setForm(f => ({ ...f, isVeg: v }))} />
              <Label>Vegetarian</Label>
            </div>
            <div className="space-y-2">
              <Label>Spice Level</Label>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, spiceLevel: level.toString() }))}
                    className={cn(
                      'h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium transition-colors border',
                      Number(form.spiceLevel) >= level && level > 0
                        ? 'bg-destructive/15 border-destructive/30 text-destructive'
                        : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                    )}
                    title={level === 0 ? 'No spice' : `Level ${level}`}
                  >
                    {level === 0 ? '0' : <Flame className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
