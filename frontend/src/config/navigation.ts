export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
}

export const mainNavigation: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' },
  { title: 'Leads', href: '/leads', iconName: 'UserPlus' },
  { title: 'Contacts', href: '/contacts', iconName: 'Users' },
  { title: 'Accounts', href: '/accounts', iconName: 'Building2' },
  { title: 'Deals / Pipeline', href: '/deals', iconName: 'Kanban' },
  { title: 'Activities', href: '/activities', iconName: 'Calendar' },
  { title: 'Products Catalog', href: '/products', iconName: 'Package' },
  { title: 'Quotations', href: '/quotes', iconName: 'FileText' },
  { title: 'Orders', href: '/orders', iconName: 'ShoppingBag' },
  { title: 'Invoices & Billing', href: '/invoices', iconName: 'Receipt' },
  { title: 'Payments Log', href: '/payments', iconName: 'CreditCard' },
  { title: 'Reports & Analytics', href: '/reports', iconName: 'BarChart3' },
  { title: 'Calendar', href: '/calendar', iconName: 'CalendarDays' },
  { title: 'Settings', href: '/settings', iconName: 'Settings' },
];
