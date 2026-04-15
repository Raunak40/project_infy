import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { CustomerService } from '../../../core/services/customer.service';
import { PlanService } from '../../../core/services/plan.service';
import { CustomerDTO } from '../../../core/models/customer.model';
import { PlanDTO } from '../../../core/models/plan.model';

@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.css']
})
export class SubscriptionFormComponent implements OnInit {

  subscriptionForm!: FormGroup;
  loading = false;
  errorMessage = '';
  customers: CustomerDTO[] = [];
  plans: PlanDTO[] = [];
  selectedPlan: PlanDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private customerService: CustomerService,
    private planService: PlanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptionForm = this.fb.group({
      customerId: ['', [Validators.required]],
      planId: ['', [Validators.required]],
      startDate: [new Date().toISOString().split('T')[0], [Validators.required]]
    });

    this.customerService.getAllCustomers().subscribe(data => this.customers = data);
    this.planService.getAllPlans().subscribe(data => this.plans = data.filter((p: PlanDTO) => p.status === 'ACTIVE'));

    this.subscriptionForm.get('planId')?.valueChanges.subscribe(planId => {
      this.selectedPlan = this.plans.find(p => p.id === +planId) || null;
    });
  }

  get f() { return this.subscriptionForm.controls; }

  onSubmit(): void {
    if (this.subscriptionForm.invalid) {
      Object.keys(this.f).forEach(key => this.f[key].markAsTouched());
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const val = this.subscriptionForm.value;
    this.subscriptionService.createSubscription({
      customerId: +val.customerId,
      planId: +val.planId,
      startDate: val.startDate
    }).subscribe({
      next: () => this.router.navigate(['/subscriptions']),
      error: (err) => { this.loading = false; this.errorMessage = err.error?.message || 'Failed to create subscription'; }
    });
  }

  cancel(): void { this.router.navigate(['/subscriptions']); }

  formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    } catch {
      return currency + ' ' + amount.toFixed(2);
    }
  }

  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return symbols[currency] || currency;
  }
}
