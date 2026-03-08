import {
  LayoutDashboard, Table2, ShoppingCart, ChefHat, UtensilsCrossed,
  Receipt, Truck, BarChart3, Users, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuthStore } from '@/store/auth-store';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
  group: 'operations' | 'management' | 'system';
}

const navItems: NavItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CASHIER'], group: 'operations' },
  { title: 'Tables', url: '/tables', icon: Table2, roles: ['ADMIN', 'WAITER'], group: 'operations' },
  { title: 'Orders', url: '/orders', icon: ShoppingCart, roles: ['ADMIN', 'WAITER', 'CASHIER'], group: 'operations' },
  { title: 'Kitchen', url: '/kitchen', icon: ChefHat, roles: ['ADMIN', 'KITCHEN'], group: 'operations' },
  { title: 'Menu', url: '/menu', icon: UtensilsCrossed, roles: ['ADMIN'], group: 'management' },
  { title: 'Billing', url: '/billing', icon: Receipt, roles: ['ADMIN', 'CASHIER'], group: 'management' },
  { title: 'Deliveries', url: '/deliveries', icon: Truck, roles: ['ADMIN', 'WAITER', 'CASHIER'], group: 'management' },
  { title: 'Reports', url: '/reports', icon: BarChart3, roles: ['ADMIN', 'CASHIER'], group: 'management' },
  { title: 'Staff', url: '/staff', icon: Users, roles: ['ADMIN'], group: 'system' },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['ADMIN'], group: 'system' },
];

const groupLabels: Record<string, string> = {
  operations: 'Operations',
  management: 'Management',
  system: 'System',
};

function isItemActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(url + '/');
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = navItems.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const groups = ['operations', 'management', 'system'].filter(g =>
    filteredItems.some(i => i.group === g)
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
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm shrink-0">
            H
          </div>
          {!collapsed && <span className="sidebar-logo">HotelPOS</span>}
        </div>

        {groups.map((group) => {
          const items = filteredItems.filter(i => i.group === group);
          const hasActive = items.some(i => isItemActive(location.pathname, i.url));

          if (collapsed) {
            return (
              <SidebarGroup key={group}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => {
                      const active = isItemActive(location.pathname, item.url);
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild isActive={active}>
                            <NavLink
                              to={item.url}
                              end={item.url === '/dashboard'}
                              className={cn(
                                'text-sidebar-foreground hover:bg-sidebar-accent',
                                active && 'bg-sidebar-primary/15 text-sidebar-primary'
                              )}
                              activeClassName=""
                            >
                              <item.icon className="h-4 w-4" />
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <Collapsible key={group} defaultOpen={hasActive || group === 'operations'} className="group/collapsible">
              <SidebarGroup>
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="text-sidebar-foreground/50 cursor-pointer hover:text-sidebar-foreground/70 flex items-center justify-between pr-2">
                    {groupLabels[group]}
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => {
                        const active = isItemActive(location.pathname, item.url);
                        return (
                          <SidebarMenuItem key={item.url}>
                            <SidebarMenuButton asChild isActive={active}>
                              <NavLink
                                to={item.url}
                                end={item.url === '/dashboard'}
                                className={cn(
                                  'text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150',
                                  active && 'bg-sidebar-primary/15 text-sidebar-primary font-medium border-l-2 border-sidebar-primary'
                                )}
                                activeClassName=""
                              >
                                <item.icon className={cn('mr-2 h-4 w-4', active && 'text-sidebar-primary')} />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
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
