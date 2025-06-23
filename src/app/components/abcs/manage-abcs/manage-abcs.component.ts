declare var bootstrap: any;

import { Component  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-manage-abcs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-abcs.component.html',
  styleUrl: './manage-abcs.component.scss'
})
export class ManageAbcsComponent {
  abcss: any[] = []; 
  editabcsForm: FormGroup;
  selectedabcs: any = null; 
  abcsToDelete: any;
  paginatedabcss: any[] = []; 
  currentPage: number = 1; 
  rowsPerPage: number = 5; 
  totalPages: number = 0; 

  rowsPerPageOptions = [5, 10, 15, 20];
  

  constructor(private firebaseService: FirebaseService, private fb: FormBuilder,private toastService:ToastrService
  ) {
    this.editabcsForm = this.fb.group({
      personIncharge: ['', Validators.required],
      type: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', Validators.required],
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
    this.abcss = await this.firebaseService.getInformation('abcs');
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.abcss.length / this.rowsPerPage);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedabcss = this.abcss.slice(startIndex, endIndex);
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

  openDeleteModal(abcs: any): void {
    this.abcsToDelete = abcs;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }
  closeDeleteModal() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.hide();
    this.abcsToDelete = null;
  }
 
  
  confirmDelete(): void {
    if (this.abcsToDelete) {
      this.deleteInformation(this.abcsToDelete.id);
      this.closeDeleteModal();
    }
  }
  
  async deleteInformation(abcsId: string): Promise<void> {
    try {
      await this.firebaseService.deleteInformation('abcs', abcsId);
      this.showToast('Success', 'abcs deleted successfully!', 'success');
      await this.getInformation();
    } catch (error) {
      console.error('Error deleting abcs:', error);
      this.showToast('Error', 'Failed to delete abcs. Please try again.', 'error');
    }
  }
  

  async openEditForm(abcs: any): Promise<void> {
    this.selectedabcs ={ ...abcs}; 
    this.editabcsForm.patchValue(abcs);
  }
  
  closeEditForm(): void {
    this.selectedabcs = null;
    this.editabcsForm.reset();
  }
  

  onStatusToggle(abcs: any): void {
    const newStatus = abcs.status === 'Active' ? 'Inactive' : 'Active';
  
    abcs.status = newStatus;
  
    this.updateabcsStatus(abcs.id, newStatus);
  }
  
  updateabcsStatus(abcsId: string, status: string): void {
    this.firebaseService.updateStatus('abcs', abcsId, status)
      .then(() => {
        console.log(`abcs with ID: ${abcsId} status updated to ${status}`);
      })
      .catch((error) => {
        console.error(`Error updating status for abcs with ID: ${abcsId}`, error);
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
  


  async saveabcs(): Promise<void> {
    if (this.editabcsForm.valid && this.selectedabcs) {
      try {
        const updatedData: any = {
          updatedAt: Date.now(), 
        };
  
        for (const controlName in this.editabcsForm.value) {
          if (this.editabcsForm.value.hasOwnProperty(controlName)) {
            const formValue = this.editabcsForm.value[controlName];
            const currentabcsValue = this.selectedabcs[controlName];
            if (formValue !== currentabcsValue) {
              updatedData[controlName] = formValue;
            }
          }
        }
        updatedData.timeFrom = this.convertTo12HourFormat(updatedData.timeFrom || this.selectedabcs.timeFrom);
        updatedData.timeTo = this.convertTo12HourFormat(updatedData.timeTo || this.selectedabcs.timeTo);
  
        await this.firebaseService.editInformation(
          'abcs',
          this.selectedabcs.id,
          updatedData
        );
  
        this.showToast('Success', 'abcs updated successfully!', 'Success');
  
        this.closeEditForm();
  
        await this.getInformation();
        this.updatePagination();
  
      } catch (error) {
        console.error('Error updating abcs:', error);
        this.showToast('Error', 'Failed to update abcs. Please try again.', 'Error');
      }
    } else {
      this.showToast('Error', 'Please fill in all required fields.', 'Error');
    }
  }
  
}
