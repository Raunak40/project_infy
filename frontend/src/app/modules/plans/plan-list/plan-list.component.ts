import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlanService } from '../../../core/services/plan.service';
import { AuthService } from '../../../core/services/auth.service';
import { PlanDTO } from '../../../core/models/plan.model';

@Component({
  selector: 'app-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.css']
})
export class PlanListComponent implements OnInit {

  plans: PlanDTO[] = [];
  filteredPlans: PlanDTO[] = [];
  loading = true;
  searchTerm = '';
  statusFilter = '';
  successMessage = '';
  errorMessage = '';
  canEdit = false;

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canEdit = this.authService.hasAnyRole(['ADMIN', 'BILLING_MANAGER']);
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.planService.getAllPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load plans';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPlans = this.plans.filter(p => {
      const matchName = p.name.toLowerCase().includes(term);
      const matchStatus = !this.statusFilter || p.status === this.statusFilter;
      return matchName && matchStatus;
    });
  }

  toggleStatus(plan: PlanDTO): void {
    const action = plan.status === 'ACTIVE' ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} plan "${plan.name}"?`)) {
      this.planService.togglePlanStatus(plan.id).subscribe({
        next: (updated) => {
          const idx = this.plans.findIndex(p => p.id === updated.id);
          if (idx > -1) this.plans[idx] = updated;
          this.applyFilters();
          this.successMessage = `Plan "${updated.name}" has been ${updated.status === 'ACTIVE' ? 'activated' : 'deactivated'}`;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to update plan status';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/plans/create']);
  }

  formatCurrency(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  }

  formatFrequency(freq: string): string {
    return freq.charAt(0) + freq.slice(1).toLowerCase();
  }
}
