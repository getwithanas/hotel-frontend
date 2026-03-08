import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatCard } from '@/components/common/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingCart, BarChart3, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['hsl(220, 70%, 50%)', 'hsl(152, 69%, 41%)', 'hsl(38, 92%, 50%)', 'hsl(262, 52%, 56%)', 'hsl(0, 72%, 51%)'];

export default function ReportsPage() {
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthYear, setMonthYear] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [range, setRange] = useState({ from: '', to: '' });

  const { data: daily, isLoading: dailyLoading } = useQuery({
    queryKey: ['reports', 'daily', dailyDate],
    queryFn: () => reportsService.daily(dailyDate),
  });

  const { data: monthly, isLoading: monthlyLoading } = useQuery({
    queryKey: ['reports', 'monthly', monthYear],
    queryFn: () => reportsService.monthly(monthYear.year, monthYear.month),
  });

  const { data: rangeData, isLoading: rangeLoading, refetch: fetchRange } = useQuery({
    queryKey: ['reports', 'range', range],
    queryFn: () => reportsService.range(range.from, range.to),
    enabled: !!(range.from && range.to),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom Range</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4 mt-4">
          <div className="filter-bar">
            <Label>Date</Label>
            <Input type="date" value={dailyDate} onChange={e => setDailyDate(e.target.value)} className="w-[160px]" />
          </div>

          {dailyLoading ? <LoadingSpinner /> : daily && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Bills" value={daily.totalBills} icon={ShoppingCart} />
                <StatCard title="Revenue" value={`$${daily.totalRevenue.toFixed(2)}`} icon={DollarSign} />
                <StatCard title="Avg/Bill" value={`$${daily.totalBills > 0 ? (daily.totalRevenue / daily.totalBills).toFixed(2) : '0'}`} icon={TrendingUp} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Hourly Orders</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={daily.hourlyOrders}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={h => `${h}:00`} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Payment</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={Object.entries(daily.revenueByPayment).map(([key, value]) => ({ name: key, value }))}
                        cx="50%" cy="50%" outerRadius={80} dataKey="value" label
                      >
                        {Object.keys(daily.revenueByPayment).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4 mt-4">
          <div className="filter-bar">
            <Label>Year</Label>
            <Input type="number" value={monthYear.year} onChange={e => setMonthYear(m => ({ ...m, year: parseInt(e.target.value) }))} className="w-[100px]" />
            <Label>Month</Label>
            <Input type="number" min={1} max={12} value={monthYear.month} onChange={e => setMonthYear(m => ({ ...m, month: parseInt(e.target.value) }))} className="w-[80px]" />
          </div>

          {monthlyLoading ? <LoadingSpinner /> : monthly && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Monthly Revenue" value={`$${monthly.totalRevenue.toFixed(2)}`} icon={DollarSign} />
                <StatCard title="Total Orders" value={monthly.totalOrders} icon={ShoppingCart} />
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Daily Sales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthly.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 mt-4">
          <div className="filter-bar">
            <Label>From</Label>
            <Input type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} className="w-[160px]" />
            <Label>To</Label>
            <Input type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} className="w-[160px]" />
            <Button onClick={() => fetchRange()} disabled={!range.from || !range.to}>Apply</Button>
          </div>

          {rangeLoading ? <LoadingSpinner /> : rangeData && (
            <>
              <StatCard title="Total Revenue" value={`$${rangeData.totalRevenue.toFixed(2)}`} icon={DollarSign} className="max-w-sm" />
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rangeData.revenueByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
