  import { Component } from '@angular/core';
  import { FirebaseService } from '../../services/firebase.service';
  import { ActivatedRoute, Router } from '@angular/router';
  import { FormsModule } from '@angular/forms';

  @Component({
    selector: 'app-reset-password',
    standalone: true,
    imports : [FormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
  })
  export class ResetPasswordComponent {
    newPassword: string = '';
    isLoading: boolean = false;
    resetCode: string | null = null;

    constructor(
      private firebaseService: FirebaseService,
      private route: ActivatedRoute,
      private router: Router
    ) {}

    ngOnInit(): void {
      this.resetCode = this.route.snapshot.queryParamMap.get('oobCode');
      console.log('oobCode Retrieved:', this.resetCode); // Log the reset code for debugging
    
      if (!this.resetCode) {
        alert('Invalid or missing reset code.');
        this.router.navigate(['/']); // Redirect user if the code is not present
      }
    }
    

    async resetPassword(event: Event): Promise<void> {
      event.preventDefault();
      if (!this.resetCode) {
        alert('No reset code found.');
        return;
      }

      this.isLoading = true;
      try {
        // Use FirebaseService to confirm password reset
        await this.firebaseService.confirmPasswordReset(this.resetCode, this.newPassword);
        alert('Password reset successful!');
        this.router.navigate(['/login']); // Redirect to login after success
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(`Error resetting password: ${error.message}`);
        } else {
          alert('An unknown error occurred.');
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
