import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  currentUser: LoginResponse | null = null;
  isCollapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/dashboard', roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] },
    { label: 'Plans', icon: 'fas fa-box', route: '/plans', roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] },
    { label: 'Customers', icon: 'fas fa-users', route: '/customers', roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] },
    { label: 'Subscriptions', icon: 'fas fa-sync-alt', route: '/subscriptions', roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] },
    { label: 'Invoices', icon: 'fas fa-file-invoice', route: '/invoices', roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] },
    { label: 'Payments', icon: 'fas fa-credit-card', route: '/payments', roles: ['ADMIN', 'BILLING_MANAGER'] },
    { label: 'Discount Codes', icon: 'fas fa-tags', route: '/discounts', roles: ['ADMIN', 'BILLING_MANAGER'] },
    { label: 'Reports', icon: 'fas fa-chart-bar', route: '/reports', roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] },
    { label: 'Audit Logs', icon: 'fas fa-history', route: '/audit-logs', roles: ['ADMIN'] },
    { label: 'User Management', icon: 'fas fa-user-cog', route: '/users', roles: ['ADMIN'] },
    { label: 'Settings', icon: 'fas fa-cog', route: '/settings', roles: ['ADMIN'] }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item =>
      this.authService.hasAnyRole(item.roles)
    );
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
