import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { StatCard } from '@/components/common/StatCard';
import { OrderCard } from '@/components/common/OrderCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ShoppingCart, DollarSign, Table2, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = [
  'hsl(220, 70%, 50%)', 'hsl(152, 69%, 41%)', 'hsl(38, 92%, 50%)',
  'hsl(262, 52%, 56%)', 'hsl(0, 72%, 51%)',
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsService.dashboard,
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  if (!dashboard) return <EmptyState title="Unable to load dashboard" />;

  const occupancyRate = dashboard.totalTables > 0
    ? Math.round((dashboard.occupiedTables / dashboard.totalTables) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Today's overview at a glance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders" value={dashboard.totalOrders} icon={ShoppingCart} />
        <StatCard title="Revenue" value={`$${dashboard.totalRevenue.toFixed(2)}`} icon={DollarSign} />
        <StatCard
          title="Occupied Tables"
          value={`${dashboard.occupiedTables}/${dashboard.totalTables}`}
          icon={Table2}
        />
        <StatCard title="Occupancy Rate" value={`${occupancyRate}%`} icon={TrendingUp} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Items */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Top Selling Items
          </h3>
          {dashboard.topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard.topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data yet" className="py-8" />
          )}
        </div>

        {/* Occupancy Pie */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Table Occupancy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Occupied', value: dashboard.occupiedTables },
                  { name: 'Free', value: dashboard.totalTables - dashboard.occupiedTables },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="hsl(var(--status-occupied))" />
                <Cell fill="hsl(var(--status-free))" />
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Queue */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Live Order Queue</h3>
        {dashboard.liveQueue.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dashboard.liveQueue.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No active orders" description="Orders will appear here in real-time" className="py-8" />
        )}
      </div>
    </div>
  );
}
