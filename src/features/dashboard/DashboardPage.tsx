import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { StatCard } from '@/components/common/StatCard';
import { OrderCard } from '@/components/common/OrderCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ShoppingCart, DollarSign, Table2, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = [
  'hsl(220, 70%, 50%)', 'hsl(152, 69%, 41%)', 'hsl(38, 92%, 50%)',
  'hsl(262, 52%, 56%)', 'hsl(0, 72%, 51%)',
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsService.dashboard,
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  if (!dashboard) return <EmptyState title="Unable to load dashboard" />;

  const totalQueueCount = dashboard.liveQueue.pending + dashboard.liveQueue.preparing + dashboard.liveQueue.ready;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Today's overview at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="animate-pulse-dot h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <StatCard title="Total Orders" value={dashboard.today.totalOrders} icon={ShoppingCart} accentColor="hsl(var(--primary))" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Revenue" value={`$${dashboard.today.revenue}`} icon={DollarSign} accentColor="hsl(var(--success))" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Occupied Tables" value={dashboard.today.occupiedTables} icon={Table2} accentColor="hsl(var(--warning))" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard title="Live Queue" value={totalQueueCount} icon={TrendingUp} accentColor="hsl(var(--info))" />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {/* Top Selling Items */}
        <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Top Selling Items
          </h3>
          {dashboard.popularItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard.popularItems} layout="vertical">
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
                    borderRadius: '10px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Bar dataKey="totalSold" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data yet" className="py-8" />
          )}
        </div>

        {/* Live Queue Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Live Queue
          </h3>
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: dashboard.liveQueue.pending },
                    { name: 'Preparing', value: dashboard.liveQueue.preparing },
                    { name: 'Ready', value: dashboard.liveQueue.ready },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={3}
                >
                  <Cell fill="hsl(var(--status-pending))" />
                  <Cell fill="hsl(var(--status-preparing))" />
                  <Cell fill="hsl(var(--status-ready))" />
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Pending', value: dashboard.liveQueue.pending, color: 'bg-status-pending' },
                { label: 'Preparing', value: dashboard.liveQueue.preparing, color: 'bg-status-preparing' },
                { label: 'Ready', value: dashboard.liveQueue.ready, color: 'bg-status-ready' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold text-foreground leading-tight">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        className="bg-card border border-border rounded-xl p-5"
        style={{ boxShadow: 'var(--shadow-sm)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Recent Orders
        </h3>
        {dashboard.recentOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {dashboard.recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => navigate(`/orders/${order.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No orders today" description="Orders will appear here in real-time" className="py-8" />
        )}
      </motion.div>
    </div>
  );
}
