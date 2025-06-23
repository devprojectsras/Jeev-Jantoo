declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
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
  

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder, private toastService:ToastrService
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
      default:
        console.error('Invalid toast type');
    }
  }


  async ngOnInit(): Promise<void> {
    await this.getInformation(); 
    this.updatePagination();
  }


  async getInformation(): Promise<void> {
    this.users = await this.firebaseService.getInformation('user');
    console.log('Fetched users:', this.users); // Log the data
    this.updatePagination();
  }

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
      this.showToast('Success', 'users deleted successfully!', 'Success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting users:', error);
      this.showToast('Error', 'Failed to delete users. Please try again.', 'Error');
    }
  }
  

  async openEditForm(users: any): Promise<void> {
    this.selectedevents ={ ...users}; 
    this.editeventsForm.patchValue(users);
  }
  
  closeEditForm(): void {
    this.selectedevents = null;
    this.editeventsForm.reset();
  }
  

  onStatusToggle(users: any): void {
    const newStatus = users.status === 'Active' ? 'Inactive' : 'Active';
  
    users.status = newStatus;
  
    this.updateeventsStatus(users.id, newStatus);
  }
  
  updateeventsStatus(eventsId: string, status: string): void {
    this.firebaseService.updateStatus('user', eventsId, status)
      .then(() => {
        console.log(`users with ID: ${eventsId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for users with ID: ${eventsId}`, error);
      });
  }
  convertTo12HourFormat(time: string): string {
    if (!time) return ''; 
    const [hours, minutesWithPeriod] = time.split(':');
    const minutes = minutesWithPeriod.slice(0, 2); 
    const period = minutesWithPeriod.slice(2).trim(); 
  
    let hours12 = parseInt(hours, 10);
    let finalPeriod = period || (hours12 >= 12 ? 'PM' : 'AM'); 
  
    if (hours12 === 0) {
      hours12 = 12; 
    } else if (hours12 > 12) {
      hours12 = hours12 - 12; 
    }
  
    if (finalPeriod && (finalPeriod === 'AM' || finalPeriod === 'PM')) {
      return `${hours12}:${minutes} ${finalPeriod}`;
    }
  
    return `${hours12}:${minutes} ${finalPeriod}`;
  }
  


  async saveevents(): Promise<void> {
    if (this.editeventsForm.valid && this.selectedevents) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editeventsForm.value) {
          if (this.editeventsForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editeventsForm.value[controlName];
            const currenteventsValue = this.selectedevents[controlName];
            if (formValue !== currenteventsValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
  
        await this.firebaseService.editInformation(
          'user',
          this.selectedevents.id,
          updatedData
        );
  
        this.showToast('Success', 'users updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating users:', error);
        this.showToast('Error', 'Failed to update users. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
}
