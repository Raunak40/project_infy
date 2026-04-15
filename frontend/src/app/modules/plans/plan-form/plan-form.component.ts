import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../../../core/services/plan.service';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.css']
})
export class PlanFormComponent implements OnInit {

  planForm!: FormGroup;
  isEditMode = false;
  planId: number | null = null;
  loading = false;
  loadingPlan = false;
  errorMessage = '';

  frequencies = ['MONTHLY', 'QUARTERLY', 'YEARLY'];
  currencies = ['USD', 'EUR', 'GBP', 'INR'];

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      billingFrequency: ['MONTHLY', [Validators.required]],
      currency: ['USD', [Validators.required]],
      setupFee: [0],
      trialPeriodDays: [0, [Validators.min(0)]],
      taxApplicable: [true]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.planId = +idParam;
      this.loadPlan();
    }
  }

  get f() { return this.planForm.controls; }

  loadPlan(): void {
    if (!this.planId) return;
    this.loadingPlan = true;
    this.planService.getPlanById(this.planId).subscribe({
      next: (plan) => {
        this.planForm.patchValue({
          name: plan.name,
          price: plan.price,
          billingFrequency: plan.billingFrequency,
          currency: plan.currency,
          setupFee: plan.setupFee,
          trialPeriodDays: plan.trialPeriodDays,
          taxApplicable: plan.taxApplicable
        });
        this.loadingPlan = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load plan';
        this.loadingPlan = false;
      }
    });
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      Object.keys(this.f).forEach(key => this.f[key].markAsTouched());
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const formValue = this.planForm.value;

    if (this.isEditMode && this.planId) {
      this.planService.updatePlan(this.planId, formValue).subscribe({
        next: () => this.router.navigate(['/plans']),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to update plan';
        }
      });
    } else {
      this.planService.createPlan(formValue).subscribe({
        next: () => this.router.navigate(['/plans']),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to create plan';
        }
      });
    }
  }

  cancel(): void { this.router.navigate(['/plans']); }
}
