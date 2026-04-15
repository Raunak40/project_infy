import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { LoginComponent } from './modules/auth/login/login.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';
import { UserFormComponent } from './modules/users/user-form/user-form.component';
import { AccessDeniedComponent } from './modules/access-denied/access-denied.component';
import { SettingsComponent } from './modules/settings/settings.component';
import { PlanListComponent } from './modules/plans/plan-list/plan-list.component';
import { PlanFormComponent } from './modules/plans/plan-form/plan-form.component';
import { CustomerListComponent } from './modules/customers/customer-list/customer-list.component';
import { CustomerFormComponent } from './modules/customers/customer-form/customer-form.component';
import { SubscriptionListComponent } from './modules/subscriptions/subscription-list/subscription-list.component';
import { SubscriptionFormComponent } from './modules/subscriptions/subscription-form/subscription-form.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'users/create', component: UserFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'users/:id/roles', component: UserFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'plans', component: PlanListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] } },
  { path: 'plans/create', component: PlanFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER'] } },
  { path: 'plans/:id/edit', component: PlanFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER'] } },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] } },
  { path: 'customers/create', component: CustomerFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER'] } },
  { path: 'customers/:id/edit', component: CustomerFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER'] } },
  { path: 'subscriptions', component: SubscriptionListComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER', 'VIEWER'] } },
  { path: 'subscriptions/create', component: SubscriptionFormComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'BILLING_MANAGER'] } },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
