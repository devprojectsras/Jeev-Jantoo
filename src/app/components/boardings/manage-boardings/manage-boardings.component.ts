declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-manage-boardings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './manage-boardings.component.html',
  styleUrl: './manage-boardings.component.scss'
})
export class ManageBoardingsComponent {
  boardings: any[] = []; 
  editboardingForm: FormGroup;
  selectedboarding: any = null; 
  boardingToDelete: any;
  paginatedboardings: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder , private toastService:ToastrService
  ) {
    this.editboardingForm = this.fb.group({
      name: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      contact: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
      remarks: [''],
      status: ['', Validators.required],
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
    this.boardings = await this.firebaseService.getInformation('boardings');
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.boardings.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedboardings = this.boardings.slice(startIndex, endIndex);
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

  openDeleteModal(boarding: any): void {
    this.boardingToDelete = boarding;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.boardingToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.boardingToDelete) {
      this.deleteInformation(this.boardingToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(boardingId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('boardings', boardingId);
      this.showToast('Success', 'boarding deleted successfully!', 'Success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting boarding:', error);
      this.showToast('Error', 'Failed to delete boarding. Please try again.', 'Error');
    }
  }
  

  async openEditForm(boarding: any): Promise<void> {
    this.selectedboarding ={ ...boarding}; 
    this.editboardingForm.patchValue(boarding);
  }
  
  closeEditForm(): void {
    this.selectedboarding = null;
    this.editboardingForm.reset();
  }
  

  onStatusToggle(boarding: any): void {
    const newStatus = boarding.status === 'Active' ? 'Inactive' : 'Active';
  
    boarding.status = newStatus;
  
    this.updateboardingStatus(boarding.id, newStatus);
  }
  
  updateboardingStatus(boardingId: string, status: string): void {
    this.firebaseService.updateStatus('boardings', boardingId, status)
      .then(() => {
        console.log(`boarding with ID: ${boardingId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for boarding with ID: ${boardingId}`, error);
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
  


  async saveboarding(): Promise<void> {
    if (this.editboardingForm.valid && this.selectedboarding) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editboardingForm.value) {
          if (this.editboardingForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editboardingForm.value[controlName];
            const currentboardingValue = this.selectedboarding[controlName];
            if (formValue !== currentboardingValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
      
        await this.firebaseService.editInformation(
          'boardings',
          this.selectedboarding.id,
          updatedData
        );
  
        this.showToast('Success', 'boarding updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating boarding:', error);
        this.showToast('Error', 'Failed to update boarding. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
}
