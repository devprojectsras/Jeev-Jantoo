import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';
import { FormsModule } from '@angular/forms';
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password = '';
  isLoading = false;
  errorMessage: string | null = null;
  showPassword: boolean = false;
  resetEmail: string = '';
  showResetPasswordForm: boolean = false;
  successMessage: string | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async signIn() {
    this.isLoading = true;

    try {
      const isAuthenticated = await this.firebaseService.signInAdmin(
        this.email,
        this.password
      );

      if (isAuthenticated) {
        const sessionExpiry = new Date().getTime() + 28800000; // 2-minute session expiry
        localStorage.setItem('userEmail', this.email);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('sessionExpiry', sessionExpiry.toString());
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';
    } finally {
      this.isLoading = false;
    }
  }
  async sendResetPasswordEmail() {
    if (!this.resetEmail) {
      this.errorMessage = 'Please enter your registered email.';
      return;
    }
    this.isLoading = true;
    try {
      await this.firebaseService.sendPasswordResetEmail(this.resetEmail);
      this.successMessage =
        'Password reset email sent. Please check your inbox.';
      this.showResetPasswordForm = false;
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while sending the reset email.';
    } finally {
      this.isLoading = false;
    }
  }
}
