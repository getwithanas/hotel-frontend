import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import TablesPage from "@/features/tables/TablesPage";
import OrdersPage from "@/features/orders/OrdersPage";
import CreateOrderPage from "@/features/orders/CreateOrderPage";
import OrderDetailPage from "@/features/orders/OrderDetailPage";
import KitchenDisplayPage from "@/features/kitchen/KitchenDisplayPage";
import MenuPage from "@/features/menu/MenuPage";
import BillingPage from "@/features/billing/BillingPage";
import DeliveriesPage from "@/features/deliveries/DeliveriesPage";
import ReportsPage from "@/features/reports/ReportsPage";
import StaffPage from "@/features/staff/StaffPage";
import SettingsPage from "@/features/settings/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10000, retry: 1, refetchOnWindowFocus: true },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/tables" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER']}><TablesPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER', 'CASHIER']}><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/new" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER', 'CASHIER']}><CreateOrderPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER', 'CASHIER']}><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['ADMIN', 'KITCHEN']}><KitchenDisplayPage /></ProtectedRoute>} />
            <Route path="/menu" element={<ProtectedRoute allowedRoles={['ADMIN']}><MenuPage /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}><BillingPage /></ProtectedRoute>} />
            <Route path="/deliveries" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAITER', 'CASHIER']}><DeliveriesPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'CASHIER']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['ADMIN']}><StaffPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
