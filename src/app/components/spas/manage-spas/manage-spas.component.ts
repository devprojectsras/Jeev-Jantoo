declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-spas',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './manage-spas.component.html',
  styleUrl: './manage-spas.component.scss'
})
export class ManageSpasComponent {
  spass: any[] = []; 
  editspasForm: FormGroup;
  selectedspas: any = null; 
  spasToDelete: any;
  paginatedspass: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];
  

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder, private toastService:ToastrService
  ) {
    this.editspasForm = this.fb.group({
      name: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      contact: ['', Validators.required],
      timeFrom: ['', Validators.required],
      timeTo: ['', Validators.required],
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
    this.spass = await this.firebaseService.getInformation('spas');
    this.updatePagination();
  }


  updatePagination(): void {
    this.totalPages = Math.ceil(this.spass.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedspass = this.spass.slice(startIndex, endIndex);
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

  openDeleteModal(spas: any): void {
    this.spasToDelete = spas;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.spasToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.spasToDelete) {
      this.deleteInformation(this.spasToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(spasId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('spas', spasId);
      this.showToast('Success', 'spas deleted successfully!', 'Success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting spas:', error);
      this.showToast('Error', 'Failed to delete spas. Please try again.', 'Error');
    }
  }
  

  getFormattedTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes}`;
  }

  async openEditForm(spas: any): Promise<void> {
    this.selectedspas ={ ...spas}; 
    this.editspasForm.patchValue(spas);
  }
  
  closeEditForm(): void {
    this.selectedspas = null;
    this.editspasForm.reset();
  }
  

  onStatusToggle(spas: any): void {
    const newStatus = spas.status === 'Active' ? 'Inactive' : 'Active';
  
    spas.status = newStatus;
  
    this.updatespasStatus(spas.id, newStatus);
  }
  
  updatespasStatus(spasId: string, status: string): void {
    this.firebaseService.updateStatus('spas', spasId, status)
      .then(() => {
        console.log(`spas with ID: ${spasId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for spas with ID: ${spasId}`, error);
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
  


  async savespas(): Promise<void> {
    if (this.editspasForm.valid && this.selectedspas) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editspasForm.value) {
          if (this.editspasForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editspasForm.value[controlName];
            const currentspasValue = this.selectedspas[controlName];
            if (formValue !== currentspasValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
  
        await this.firebaseService.editInformation(
          'spas',
          this.selectedspas.id,
          updatedData
        );
  
        this.showToast('Success', 'spas updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating spas:', error);
        this.showToast('Error', 'Failed to update spas. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
  
}
