import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserDTO } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  successMessage = '';
  errorMessage = '';

  currentUserId: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser ? currentUser.userId : null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.roles.some(r => r.toLowerCase().includes(term));
      const matchStatus = !this.statusFilter ||
        (this.statusFilter === 'ACTIVE' && u.isActive) ||
        (this.statusFilter === 'INACTIVE' && !u.isActive);
      return matchSearch && matchStatus;
    });
  }

  activateUser(user: UserDTO): void {
    this.userService.updateUserStatus(user.id, true).subscribe({
      next: (updated) => {
        this.updateInList(updated);
        this.showSuccess(`${updated.name} has been activated`);
      },
      error: (err) => this.showError(err.error?.message || 'Failed to activate user')
    });
  }

  deactivateUser(user: UserDTO): void {
    if (!confirm(`Are you sure you want to deactivate ${user.name}? They will not be able to log in.`)) return;

    this.userService.updateUserStatus(user.id, false).subscribe({
      next: (updated) => {
        this.updateInList(updated);
        this.showSuccess(`${updated.name} has been deactivated`);
      },
      error: (err) => this.showError(err.error?.message || 'Failed to deactivate user')
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/users/create']);
  }

  getUserPrimaryRole(user: UserDTO): string {
    return user.roles.length > 0 ? user.roles[0] : 'VIEWER';
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'BILLING_MANAGER': return 'badge-billing';
      case 'VIEWER': return 'badge-viewer';
      default: return '';
    }
  }

  isSelf(user: UserDTO): boolean {
    return user.id === this.currentUserId;
  }

  get activeCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter(u => !u.isActive).length;
  }

  private updateInList(updated: UserDTO): void {
    const idx = this.users.findIndex(u => u.id === updated.id);
    if (idx > -1) this.users[idx] = updated;
    this.applyFilters();
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 4000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 4000);
  }
}
