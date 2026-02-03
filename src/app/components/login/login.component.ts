import { Component, inject, OnDestroy } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginPayload, LoginResponse } from '../../helpers/model/authentication.model';
import { takeUntil, finalize } from 'rxjs/operators';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DividerModule, CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, FormsModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnDestroy {

  userForm: FormGroup;
  fb = inject(FormBuilder);
  private destroyer$ = new Subject<void>();
  
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthenticationService,

  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(1)]],
      password: ['', [Validators.required, Validators.minLength(2)]],
    })
  }

  onLogin(): void {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const match: LoginPayload = this.userForm.value;
    
    this.authService.login(match).pipe(
      takeUntil(this.destroyer$),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (data: LoginResponse) => {
        

        if (data.access) {
     
          localStorage.setItem('access_token', data.access);
          
          if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
           
          } 
          
          const user = {
            username: data.username, 
            id: data.username,       
            email: `${data.username}@example.com`
          };
          
          localStorage.setItem('user', JSON.stringify(user));
    
          const storedToken = localStorage.getItem('access_token');
          const storedUser = localStorage.getItem('user');
        
          if (storedToken && storedUser) {
            setTimeout(() => {
              this.router.navigateByUrl('/chat');
            }, 100);
          } else {
           
            this.errorMessage = 'Token storage failed. Please try again.';
          }
          
        } else {
          
          this.errorMessage = 'Login failed. No access token received.';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.message || 'Login failed. Please try again.';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyer$.next(); 
    this.destroyer$.complete();
  }
}
