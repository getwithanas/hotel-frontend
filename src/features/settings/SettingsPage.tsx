import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
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

      {/* Appearance */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="flex gap-2">
            {([
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ] as const).map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={theme === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme(value)}
                className="flex items-center gap-1.5"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
