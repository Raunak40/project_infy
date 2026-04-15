import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

// Layout
import { SidebarComponent } from './modules/layout/sidebar/sidebar.component';
import { HeaderComponent } from './modules/layout/header/header.component';

// Feature Components
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

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    LoginComponent,
    DashboardComponent,
    UserListComponent,
    UserFormComponent,
    AccessDeniedComponent,
    SettingsComponent,
    PlanListComponent,
    PlanFormComponent,
    CustomerListComponent,
    CustomerFormComponent,
    SubscriptionListComponent,
    SubscriptionFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
