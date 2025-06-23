declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-manage-ngos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-ngos.component.html',
  styleUrl: './manage-ngos.component.scss'
})
export class ManageNgosComponent {
  ngos: any[] = []; 
  ngosCount: number = 0;
  editngosForm: FormGroup;
  selectedngos: any = null; 
  ngosToDelete: any;
  paginatedngos: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];


  constructor(private firebaseService: FirebaseService, private fb: FormBuilder, private toastService:ToastrService
  ) {
    this.editngosForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', Validators.required],
      contact: ['', Validators.required],
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
    this.ngos = await this.firebaseService.getInformation('ngos');
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.ngos.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedngos = this.ngos.slice(startIndex, endIndex);
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

  openDeleteModal(ngos: any): void {
    this.ngosToDelete = ngos;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.ngosToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.ngosToDelete) {
      this.deleteInformation(this.ngosToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(ngosId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('ngos', ngosId);
      this.showToast('Success', 'ngos deleted successfully!', 'Success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting ngos:', error);
      this.showToast('Error', 'Failed to delete ngos. Please try again.', 'Error');
    }
  }
  


  async openEditForm(ngos: any): Promise<void> {
    this.selectedngos ={ ...ngos}; 
    this.editngosForm.patchValue(ngos);
  }
  
  closeEditForm(): void {
    this.selectedngos = null;
    this.editngosForm.reset();
  }
  

  onStatusToggle(ngos: any): void {
    const newStatus = ngos.status === 'Active' ? 'Inactive' : 'Active';
  
    ngos.status = newStatus;
  
    this.updatengosStatus(ngos.id, newStatus);
  }
  
  updatengosStatus(ngosId: string, status: string): void {
    this.firebaseService.updateStatus('ngos', ngosId, status)
      .then(() => {
        console.log(`Ngos with ID: ${ngosId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for ngos with ID: ${ngosId}`, error);
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
  


  async saveNgos(): Promise<void> {
    if (this.editngosForm.valid && this.selectedngos) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editngosForm.value) {
          if (this.editngosForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editngosForm.value[controlName];
            const currentNgosValue = this.selectedngos[controlName];
            if (formValue !== currentNgosValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
        updatedData.timeFrom = this.convertTo12HourFormat(updatedData.timeFrom || this.selectedngos.timeFrom);
        updatedData.timeTo = this.convertTo12HourFormat(updatedData.timeTo || this.selectedngos.timeTo);
  
        await this.firebaseService.editInformation(
          'ngos',
          this.selectedngos.id,
          updatedData
        );
  
        this.showToast('Success', 'Ngos updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating ngos:', error);
        this.showToast('Error', 'Failed to update ngos. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
}
