declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-manage-government-helplines',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-government-helplines.component.html',
  styleUrl: './manage-government-helplines.component.scss'
})
export class ManageGovernmentHelplinesComponent {
  govtHelplines: any[] = []; 
  editgovtHelplineForm: FormGroup;
  selectedgovtHelpline: any = null; 
  govtHelplineToDelete: any;
  paginatedgovtHelplines: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];
  

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder, private toastService:ToastrService
  ) {
    this.editgovtHelplineForm = this.fb.group({
      helplineServices: ['', Validators.required],
      govtBody: ['', Validators.required],
      contact: ['', Validators.required],
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
    this.govtHelplines = await this.firebaseService.getInformation('government-helpline');
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.govtHelplines.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedgovtHelplines = this.govtHelplines.slice(startIndex, endIndex);
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

  openDeleteModal(govtHelpline: any): void {
    this.govtHelplineToDelete = govtHelpline;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.govtHelplineToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.govtHelplineToDelete) {
      this.deleteInformation(this.govtHelplineToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(govtHelplineId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('government-helpline', govtHelplineId);
      this.showToast('Success', 'govtHelpline deleted successfully!', 'Success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting govtHelpline:', error);
      this.showToast('Error', 'Failed to delete govtHelpline. Please try again.', 'Error');
    }
  }
  

  async openEditForm(govtHelpline: any): Promise<void> {
    this.selectedgovtHelpline ={ ...govtHelpline}; 
    this.editgovtHelplineForm.patchValue(govtHelpline);
  }
  
  closeEditForm(): void {
    this.selectedgovtHelpline = null;
    this.editgovtHelplineForm.reset();
  }
  

  onStatusToggle(govtHelpline: any): void {
    const newStatus = govtHelpline.status === 'Active' ? 'Inactive' : 'Active';
  
    govtHelpline.status = newStatus;
  
    this.updategovtHelplineStatus(govtHelpline.id, newStatus);
  }
  
  updategovtHelplineStatus(govtHelplineId: string, status: string): void {
    this.firebaseService.updateStatus('government-helpline', govtHelplineId, status)
      .then(() => {
        console.log(`govtHelpline with ID: ${govtHelplineId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for govtHelpline with ID: ${govtHelplineId}`, error);
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
  


  async savegovtHelpline(): Promise<void> {
    if (this.editgovtHelplineForm.valid && this.selectedgovtHelpline) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editgovtHelplineForm.value) {
          if (this.editgovtHelplineForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editgovtHelplineForm.value[controlName];
            const currentgovtHelplineValue = this.selectedgovtHelpline[controlName];
            if (formValue !== currentgovtHelplineValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
        updatedData.timeFrom = this.convertTo12HourFormat(updatedData.timeFrom || this.selectedgovtHelpline.timeFrom);
        updatedData.timeTo = this.convertTo12HourFormat(updatedData.timeTo || this.selectedgovtHelpline.timeTo);
  
        await this.firebaseService.editInformation(
          'government-helpline',
          this.selectedgovtHelpline.id,
          updatedData
        );
  
        this.showToast('Success', 'govtHelpline updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating govtHelpline:', error);
        this.showToast('Error', 'Failed to update govtHelpline. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
}
