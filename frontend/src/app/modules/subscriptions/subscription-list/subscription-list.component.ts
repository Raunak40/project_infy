import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionDTO } from '../../../core/models/subscription.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-list',
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.css']
})
export class SubscriptionListComponent implements OnInit {

  subscriptions: SubscriptionDTO[] = [];
  filteredSubscriptions: SubscriptionDTO[] = [];
  loading = true;
  statusFilter = '';
  searchTerm = '';
  successMessage = '';
  errorMessage = '';
  canEdit = false;

  // Suspend modal
  showSuspendModal = false;
  suspendTargetId: number | null = null;
  suspendReason = '';

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canEdit = this.authService.hasAnyRole(['ADMIN', 'BILLING_MANAGER']);
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionService.getAllSubscriptions().subscribe({
      next: (data) => { this.subscriptions = data; this.applyFilters(); this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load subscriptions'; this.loading = false; }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSubscriptions = this.subscriptions.filter(s => {
      const matchStatus = !this.statusFilter || s.status === this.statusFilter;
      const matchSearch = !term || s.customerName.toLowerCase().includes(term) ||
                          s.customerCode.toLowerCase().includes(term) || s.planNameSnapshot.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }

  activate(sub: SubscriptionDTO): void {
    this.subscriptionService.activate(sub.id).subscribe({
      next: (updated) => { this.updateInList(updated); this.showSuccess(`Subscription #${updated.id} activated`); },
      error: (err) => this.showError(err.error?.message || 'Failed to activate')
    });
  }

  openSuspendModal(id: number): void {
    this.suspendTargetId = id;
    this.suspendReason = '';
    this.showSuspendModal = true;
  }

  confirmSuspend(): void {
    if (!this.suspendTargetId || !this.suspendReason.trim()) return;
    this.subscriptionService.suspend(this.suspendTargetId, this.suspendReason).subscribe({
      next: (updated) => {
        this.updateInList(updated);
        this.showSuspendModal = false;
        this.showSuccess(`Subscription #${updated.id} suspended`);
      },
      error: (err) => this.showError(err.error?.message || 'Failed to suspend')
    });
  }

  reactivate(sub: SubscriptionDTO): void {
    this.subscriptionService.reactivate(sub.id).subscribe({
      next: (updated) => { this.updateInList(updated); this.showSuccess(`Subscription #${updated.id} reactivated`); },
      error: (err) => this.showError(err.error?.message || 'Failed to reactivate')
    });
  }

  cancel(sub: SubscriptionDTO): void {
    const reason = prompt('Cancellation reason (optional):');
    this.subscriptionService.cancel(sub.id, reason || undefined).subscribe({
      next: (updated) => { this.updateInList(updated); this.showSuccess(`Subscription #${updated.id} cancelled`); },
      error: (err) => this.showError(err.error?.message || 'Failed to cancel')
    });
  }

  navigateToCreate(): void { this.router.navigate(['/subscriptions/create']); }

  getStatusClass(status: string): string {
    const map: Record<string, string> = { PENDING: 'status-pending', ACTIVE: 'status-active', SUSPENDED: 'status-suspended', CANCELLED: 'status-cancelled' };
    return map[status] || '';
  }

  formatCurrency(amount: number, currency: string): string {
    if (!currency) currency = 'USD';
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
      return currency + ' ' + amount.toFixed(2);
    }
  }

  private updateInList(updated: SubscriptionDTO): void {
    const idx = this.subscriptions.findIndex(s => s.id === updated.id);
    if (idx > -1) this.subscriptions[idx] = updated;
    this.applyFilters();
  }

  private showSuccess(msg: string): void { this.successMessage = msg; setTimeout(() => this.successMessage = '', 3000); }
  private showError(msg: string): void { this.errorMessage = msg; setTimeout(() => this.errorMessage = '', 3000); }
}
