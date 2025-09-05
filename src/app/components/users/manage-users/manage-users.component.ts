// File: src/app/components/users/manage-users/manage-users.component.ts

declare var bootstrap: any;

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { collection, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent {
  users: any[] = [];
  editeventsForm: FormGroup;
  selectedevents: any = null;
  eventsToDelete: any;
  paginatedeventss: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 0;

  rowsPerPageOptions = [5, 10, 15, 20];

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editeventsForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      gender: [''],
      phone: ['', Validators.required],
      Adhar: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  // ------------------- Toast -------------------
  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title}  ${currentTime}`;

    switch (type) {
      case 'Success':
        this.toastService.success(fullTitle, message);
        break;
      case 'Error':
        this.toastService.error(fullTitle, message);
        break;
      case 'Info':
        this.toastService.info(fullTitle, message);
        break;
      case 'Warning':
        this.toastService.warning(fullTitle, message);
        break;
    }
  }

  // ------------------- Lifecycle -------------------
  async ngOnInit(): Promise<void> {
    await this.getInformation();
    this.updatePagination();
  }

  // ------------------- Get Users -------------------
  async getInformation(): Promise<void> {
    // Using service method to fetch users
    this.users = await this.firebaseService.getInformation('user');
    this.updatePagination();
  }

  // ------------------- Pagination -------------------
  updatePagination(): void {
    this.totalPages = Math.ceil(this.users.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedeventss = this.users.slice(startIndex, endIndex);
  }

  changeRowsPerPage(rows: number): void {
    this.rowsPerPage = rows;
    this.currentPage = 1;
    this.updatePagination();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  // ------------------- Delete User -------------------
  openDeleteModal(users: any): void {
    this.eventsToDelete = users;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }

  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.eventsToDelete = null;
  }

  confirmDelete(): void {
    if (this.eventsToDelete) {
      this.deleteInformation(this.eventsToDelete.id);
      this.closeDeleteModal();
    }
  }

  async deleteInformation(eventsId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('user', eventsId);
      this.showToast('Success', 'User deleted successfully!', 'Success');
      await this.getInformation(); // Refresh user list after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      this.showToast('Error', 'Failed to delete user. Please try again.', 'Error');
    }
  }

  // ------------------- Edit User -------------------
  async openEditForm(users: any): Promise<void> {
    this.selectedevents = { ...users };
    this.editeventsForm.patchValue(users);
  }

  closeEditForm(): void {
    this.selectedevents = null;
    this.editeventsForm.reset();
  }

  async saveevents(): Promise<void> {
    if (this.editeventsForm.valid && this.selectedevents) {
      try {
        const updatedData: any = { updatedAt: Date.now() };

        for (const controlName in this.editeventsForm.value) {
          if (this.editeventsForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editeventsForm.value[controlName];
            const currentValue = this.selectedevents[controlName];
            if (formValue !== currentValue) {
              updatedData[controlName] = formValue;
            }
          }
        }

        await this.firebaseService.editInformation('user', this.selectedevents.id, updatedData);

        this.showToast('Success', 'User updated successfully!', 'Success');
        this.closeEditForm();
        await this.getInformation(); // Refresh user list after edit
      } catch (error) {
        console.error('Error updating user:', error);
        this.showToast('Error', 'Failed to update user. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }

  // ------------------- Status Toggle -------------------
  onStatusToggle(users: any): void {
    const newStatus = users.status === 'Active' ? 'Inactive' : 'Active';
    users.status = newStatus;
    this.updateeventsStatus(users.id, newStatus);
  }

  updateeventsStatus(eventsId: string, status: string): void {
    this.firebaseService.updateStatus('user', eventsId, status)
      .then(() => console.log(`User status updated to ${status}`))
      .catch((error) => console.error(`Error updating status for user ${eventsId}`, error));
  }
}
