import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerDTO } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {

  customers: CustomerDTO[] = [];
  filteredCustomers: CustomerDTO[] = [];
  loading = true;
  searchTerm = '';
  successMessage = '';
  errorMessage = '';
  canEdit = false;

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.canEdit = this.authService.hasAnyRole(['ADMIN', 'BILLING_MANAGER']);
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load customers';
        this.loading = false;
      }
    });
  }

  filterCustomers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.customerCode.toLowerCase().includes(term)
    );
  }

  softDelete(customer: CustomerDTO): void {
    if (confirm(`Are you sure you want to delete "${customer.name}" (${customer.customerCode})? This is a soft delete.`)) {
      this.customerService.softDeleteCustomer(customer.id).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== customer.id);
          this.filterCustomers();
          this.successMessage = `Customer "${customer.name}" has been deleted`;
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: () => {
          this.errorMessage = 'Failed to delete customer';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  exportCsv(): void {
    this.customerService.exportCsv().subscribe({
      next: (csv) => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.errorMessage = 'Failed to export CSV';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/customers/create']);
  }
}
