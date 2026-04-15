import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {

  customerForm!: FormGroup;
  isEditMode = false;
  customerId: number | null = null;
  loading = false;
  loadingCustomer = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)]],
      billingAddress: [''],
      taxId: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.customerId = +idParam;
      this.loadCustomer();
    }
  }

  get f() { return this.customerForm.controls; }

  loadCustomer(): void {
    if (!this.customerId) return;
    this.loadingCustomer = true;
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          billingAddress: customer.billingAddress,
          taxId: customer.taxId
        });
        this.loadingCustomer = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load customer';
        this.loadingCustomer = false;
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      Object.keys(this.f).forEach(key => this.f[key].markAsTouched());
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.customerId) {
      this.customerService.updateCustomer(this.customerId, this.customerForm.value).subscribe({
        next: () => this.router.navigate(['/customers']),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to update customer';
        }
      });
    } else {
      this.customerService.createCustomer(this.customerForm.value).subscribe({
        next: () => this.router.navigate(['/customers']),
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to create customer';
        }
      });
    }
  }

  cancel(): void { this.router.navigate(['/customers']); }
}
