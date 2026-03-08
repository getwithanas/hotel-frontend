import {
  LayoutDashboard, Table2, ShoppingCart, ChefHat, UtensilsCrossed,
  Receipt, Truck, BarChart3, Users, Settings, LogOut
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/auth-store';
import { ROLE_ROUTES } from '@/lib/constants';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CASHIER'] },
  { title: 'Tables', url: '/tables', icon: Table2, roles: ['ADMIN', 'WAITER'] },
  { title: 'Orders', url: '/orders', icon: ShoppingCart, roles: ['ADMIN', 'WAITER', 'CASHIER'] },
  { title: 'Kitchen', url: '/kitchen', icon: ChefHat, roles: ['ADMIN', 'KITCHEN'] },
  { title: 'Menu', url: '/menu', icon: UtensilsCrossed, roles: ['ADMIN'] },
  { title: 'Billing', url: '/billing', icon: Receipt, roles: ['ADMIN', 'CASHIER'] },
  { title: 'Deliveries', url: '/deliveries', icon: Truck, roles: ['ADMIN', 'WAITER', 'CASHIER'] },
  { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['ADMIN', 'CASHIER'] },
  { title: 'Staff', url: '/staff', icon: Users, roles: ['ADMIN'] },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = navItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            H
          </div>
          {!collapsed && <span className="sidebar-logo">HotelPOS</span>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url || location.pathname.startsWith(item.url + '/')}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        {user && !collapsed && (
          <div className="mb-2 px-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={handleLogout}
          className="w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent justify-start"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
