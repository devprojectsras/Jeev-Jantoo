declare var bootstrap: any;

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-adoption',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-pet-adoption.component.html',
  styleUrls: ['./manage-pet-adoption.component.scss']
})
export class ManageAdoptionComponent implements OnInit {

  adoptions: any[] = [];
  paginatedAdoptions: any[] = [];
  editAdoptionForm: FormGroup;
  selectedAdoption: any = null;
  adoptionToDelete: any = null;

  currentPage = 1;
  rowsPerPage = 5;
  totalPages = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editAdoptionForm = this.fb.group({
      petName: ['', Validators.required],
      species: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['Pending', Validators.required] // default status
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadAdoptions();
  }

  // ---------- NORMALIZATION ----------
  private normalizeAdoption = (a: any) => {
    const species = (a?.species ?? a?.petType ?? '').toString().toLowerCase();
    const description = a?.description ?? a?.details ?? '';
    const status =
      a?.status ??
      (a?.active === true ? 'Active' : a?.active === false ? 'Inactive' : 'Pending');

    return {
      ...a,
      species,
      description,
      status
    };
  };

  private currentStatus(a: any): 'Active' | 'Inactive' | 'Pending' {
    if (a?.status) return a.status;
    if (a?.active === true) return 'Active';
    if (a?.active === false) return 'Inactive';
    return 'Pending';
  }

  // ---------- LOAD DATA ----------
  async loadAdoptions(): Promise<void> {
    try {
      const raw = await this.firebaseService.getInformation('pet-adoption');
      this.adoptions = (raw || []).map(this.normalizeAdoption);
      this.updatePagination();
    } catch (error) {
      console.error('Error fetching adoption data:', error);
      this.showToast('Error', 'Fetch Error', 'Failed to fetch adoption records.');
    }
  }

  // ---------- PAGINATION ----------
  updatePagination(): void {
    this.totalPages = Math.max(1, Math.ceil(this.adoptions.length / this.rowsPerPage));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedAdoptions = this.adoptions.slice(startIndex, endIndex);
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

  trackById = (_: number, item: any) => item?.id ?? item;

  // ---------- DELETE ----------
  openDeleteModal(adoption: any): void {
    this.adoptionToDelete = adoption;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal')!);
    deleteModal.show();
  }

  closeDeleteModal(): void {
    this.adoptionToDelete = null;
    const modalEl = document.getElementById('deleteModal');
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  }

  async confirmDelete(): Promise<void> {
    if (!this.adoptionToDelete) return;

    try {
      await this.firebaseService.deleteInformation('pet-adoption', this.adoptionToDelete.id);
      this.showToast('Success', 'Deleted', 'Adoption deleted successfully!');
      await this.loadAdoptions();
    } catch (error) {
      console.error('Error deleting adoption:', error);
      this.showToast('Error', 'Delete Failed', 'Failed to delete adoption.');
    } finally {
      this.closeDeleteModal();
    }
  }

  // ---------- EDIT ----------
  openEditForm(adoption: any): void {
    this.selectedAdoption = this.normalizeAdoption(adoption);
    this.editAdoptionForm.patchValue({
      petName: this.selectedAdoption.petName ?? '',
      species: this.selectedAdoption.species ?? '',
      age: this.selectedAdoption.age ?? '',
      description: this.selectedAdoption.description ?? '',
      status: this.selectedAdoption.status ?? 'Pending'
    });
    const editModal = new bootstrap.Modal(document.getElementById('editModal')!);
    editModal.show();
  }

  closeEditForm(): void {
    const editModalEl = document.getElementById('editModal');
    if (editModalEl) bootstrap.Modal.getInstance(editModalEl)?.hide();
    this.selectedAdoption = null;
    this.editAdoptionForm.reset();
  }

  async saveAdoption(): Promise<void> {
    if (!this.editAdoptionForm.valid || !this.selectedAdoption) {
      this.showToast('Error', 'Form Invalid', 'Please fill all required fields.');
      return;
    }

    try {
      const updatedData: any = { updatedAt: Date.now() };
      Object.entries(this.editAdoptionForm.value).forEach(([key, value]) => {
        if (value !== this.selectedAdoption[key]) updatedData[key] = value;
      });

      // keep boolean 'active' in sync if your backend uses it
      if ('status' in updatedData) {
        updatedData.active = updatedData.status === 'Active';
      }

      await this.firebaseService.editInformation('pet-adoption', this.selectedAdoption.id, updatedData);
      this.showToast('Success', 'Updated', 'Adoption updated successfully!');
      this.closeEditForm();
      await this.loadAdoptions();
    } catch (error) {
      console.error('Error updating adoption:', error);
      this.showToast('Error', 'Update Failed', 'Failed to update adoption.');
    }
  }

  // ---------- STATUS TOGGLE ----------
  onStatusToggle(adoption: any): void {
    const cur = this.currentStatus(adoption);
    const next = cur === 'Pending' ? 'Active' : cur === 'Active' ? 'Inactive' : 'Active';

    // optimistic UI (sync both fields)
    adoption.status = next;
    adoption.active = next === 'Active';

    this.updateAdoptionStatus(adoption.id, next);
    this.showToast('Success', 'Status Updated', `Adoption status changed to ${next}`);
  }

  async updateAdoptionStatus(adoptionId: string, status: string): Promise<void> {
    try {
      if (this.firebaseService.updateStatus) {
        await this.firebaseService.updateStatus('pet-adoption', adoptionId, status);
      } else {
        await this.firebaseService.editInformation('pet-adoption', adoptionId, {
          status,
          active: status === 'Active',
          updatedAt: Date.now()
        });
      }
    } catch (error) {
      console.error(`Error updating status for adoption ${adoptionId}`, error);
      this.showToast('Error', 'Update Failed', 'Failed to update adoption status.');
      // reload to avoid UI drift
      await this.loadAdoptions();
    }
  }

  // ---------- TOAST ----------
  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title} - ${currentTime}`;

    switch (type) {
      case 'Success': this.toastService.success(message, fullTitle); break;
      case 'Error': this.toastService.error(message, fullTitle); break;
      case 'Info': this.toastService.info(message, fullTitle); break;
      case 'Warning': this.toastService.warning(message, fullTitle); break;
      default: console.error('Invalid toast type');
    }
  }
}
