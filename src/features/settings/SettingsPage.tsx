import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  });

  useEffect(() => {
    if (settings) {
      const flat: Record<string, string> = {};
      Object.entries(settings).forEach(([k, v]) => { flat[k] = String(v ?? ''); });
      setForm(flat);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Settings>) => settingsService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" />;

  const fields = [
    { key: 'hotelName', label: 'Hotel Name', type: 'text' },
    { key: 'taxRate', label: 'Tax Rate (%)', type: 'number' },
    { key: 'currency', label: 'Currency', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Configure your hotel</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">
        {fields.map(field => (
          <div key={field.key} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type={field.type}
              value={form[field.key] || ''}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
            />
          </div>
        ))}

        <Button onClick={() => mutation.mutate(form as any)} disabled={mutation.isPending}>
          <Save className="h-4 w-4 mr-1" /> Save Settings
        </Button>
      </div>
    </div>
  );
}
