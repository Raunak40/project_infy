import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserDTO } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {

  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  loadingUser = false;
  errorMessage = '';
  currentUser: UserDTO | null = null;

  availableRoles = ['ADMIN', 'BILLING_MANAGER', 'VIEWER'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.userId = +idParam;
      this.loadUser();
      this.userForm = this.fb.group({
        role: ['', [Validators.required]]
      });
    } else {
      this.userForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
        ]],
        role: ['VIEWER', [Validators.required]]
      });
    }
  }

  get f() {
    return this.userForm.controls;
  }

  loadUser(): void {
    if (!this.userId) return;
    this.loadingUser = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.currentUser = user;
        const primaryRole = user.roles.length > 0 ? user.roles[0] : 'VIEWER';
        this.userForm.patchValue({ role: primaryRole });
        this.loadingUser = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load user details';
        this.loadingUser = false;
      }
    });
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.f).forEach(key => this.f[key].markAsTouched());
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    if (this.isEditMode && this.userId) {
      this.userService.updateUserRole(this.userId, this.userForm.value.role).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to update role';
        }
      });
    } else {
      // createUser expects roles as array, so wrap the single role
      const payload = {
        name: this.userForm.value.name,
        email: this.userForm.value.email,
        password: this.userForm.value.password,
        roles: [this.userForm.value.role]
      };
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Failed to create user';
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
