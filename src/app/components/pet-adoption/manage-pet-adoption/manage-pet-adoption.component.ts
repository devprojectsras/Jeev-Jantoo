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

  // for photo editing
  editNewFiles: File[] = [];
  editRemovedUrls: string[] = [];

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
      species: ['', Validators.required],       // code: dog/cat/bird/fish/rabbit/other
      ageYears: [null, [Validators.min(0)]],
      ageMonths: [null, [Validators.min(0), Validators.max(11)]],
      description: [''],
      status: ['Pending', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadAdoptions();
  }

  // ---------- HELPERS ----------
  private normalizeSpecies(val: any): string {
    const s = String(val || '').toLowerCase();
    if (s.includes('dog')) return 'dog';
    if (s.includes('cat')) return 'cat';
    if (s.includes('bird')) return 'bird';
    if (s.includes('fish')) return 'fish';
    if (s.includes('rabbit')) return 'rabbit';
    return 'other';
  }

  speciesLabel(s: any): string {
    const code = this.normalizeSpecies(s);
    switch (code) {
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'bird': return 'Bird';
      case 'fish': return 'Fish';
      case 'rabbit': return 'Rabbit';
      default: return 'Other';
    }
  }

  private toDisplayAge(a: any): string {
    let m = typeof a?.ageInMonths === 'number'
      ? a.ageInMonths
      : (Number(a?.ageYears) || 0) * 12 + (Number(a?.ageMonths) || 0);

    if ((!m || m <= 0) && typeof a?.age === 'number') {
      m = Math.max(0, Math.floor(a.age * 12)); // legacy 'age' in years
    }

    const months = Math.max(0, Math.floor(m || 0));
    const y = Math.floor(months / 12);
    const mm = months % 12;
    return y > 0 ? (mm > 0 ? `${y}y ${mm}m` : `${y}y`) : `${mm}m`;
  }
  displayAge = (a: any) => this.toDisplayAge(a);

  private normalizeAdoption = (a: any) => {
    const species = this.normalizeSpecies(a?.species ?? a?.petType);
    const description = a?.description ?? a?.details ?? '';

    let ageInMonths = a?.ageInMonths;
    if (typeof ageInMonths !== 'number') {
      const yrs = Number(a?.ageYears) || 0;
      const mos = Number(a?.ageMonths) || 0;
      ageInMonths = yrs * 12 + mos;
      if ((!ageInMonths || ageInMonths <= 0) && typeof a?.age === 'number') {
        ageInMonths = Math.max(0, Math.floor(a.age * 12));
      }
    }

    const status =
      a?.status ??
      (a?.active === true ? 'Active' : a?.active === false ? 'Inactive' : 'Pending');

    // ensure photos array
    let photos = a?.photos;
    if (!Array.isArray(photos)) photos = photos ? [photos] : [];

    return {
      ...a,
      species,
      description,
      ageInMonths,
      status,
      photos
    };
  };

  private currentStatus(a: any): 'Active' | 'Inactive' | 'Pending' {
    if (a?.status) return a.status;
    if (a?.active === true) return 'Active';
    if (a?.active === false) return 'Inactive';
    return 'Pending';
  }

  // ---------- LOAD ----------
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
  changeRowsPerPage(rows: number): void { this.rowsPerPage = rows; this.currentPage = 1; this.updatePagination(); }
  changePage(page: number): void { this.currentPage = page; this.updatePagination(); }
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

    // derive Y/M from canonical months
    const months = Math.max(0, Math.floor(this.selectedAdoption.ageInMonths || 0));
    const ageYears = Math.floor(months / 12);
    const ageMonths = months % 12;

    this.editAdoptionForm.patchValue({
      petName: this.selectedAdoption.petName ?? '',
      species: this.selectedAdoption.species ?? '',
      ageYears,
      ageMonths,
      description: this.selectedAdoption.description ?? '',
      status: this.selectedAdoption.status ?? 'Pending'
    });

    // reset photo edit state
    this.editNewFiles = [];
    this.editRemovedUrls = [];

    const editModal = new bootstrap.Modal(document.getElementById('editModal')!);
    editModal.show();
  }
  closeEditForm(): void {
    const editModalEl = document.getElementById('editModal');
    if (editModalEl) bootstrap.Modal.getInstance(editModalEl)?.hide();
    this.selectedAdoption = null;
    this.editAdoptionForm.reset();
    this.editNewFiles = [];
    this.editRemovedUrls = [];
  }

  onEditFilesSelected(ev: any) {
    this.editNewFiles = Array.from(ev?.target?.files || []);
  }
  removeExistingPhoto(url: string) {
    this.editRemovedUrls.push(url);
    this.selectedAdoption.photos = (this.selectedAdoption.photos || []).filter((u: string) => u !== url);
  }
  removeNewFile(i: number) {
    this.editNewFiles.splice(i, 1);
  }
  previewFile(file: File): string {
    return URL.createObjectURL(file);
  }
  private safeName(file: File, i: number): string {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const base = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40);
    return `${Date.now()}_${i}_${base}.${ext}`;
  }

  async saveAdoption(): Promise<void> {
    if (!this.editAdoptionForm.valid || !this.selectedAdoption) {
      this.showToast('Error', 'Form Invalid', 'Please fill all required fields.');
      return;
    }

    try {
      const val = this.editAdoptionForm.value;
      const ageYears = Number(val.ageYears || 0);
      const ageMonths = Number(val.ageMonths || 0);
      const ageInMonths = ageYears * 12 + ageMonths;

      const id = this.selectedAdoption.id;

      // upload new files
      const newUrls: string[] = [];
      for (let i = 0; i < this.editNewFiles.length; i++) {
        const f = this.editNewFiles[i];
        const filename = this.safeName(f, i);
        const path = `pet-photos/${id}/${filename}`;
        // your service: uploadFile(path: string, file: File)
        const url = await this.firebaseService.uploadFile(path, f);
        newUrls.push(url);
      }

      // final merged photo list
      const kept = this.selectedAdoption.photos || [];
      const finalPhotos = [...kept, ...newUrls];

      // optionally delete removed storage files if service supports it
      if (this.editRemovedUrls.length && (this.firebaseService as any).deleteFileByUrl) {
        for (const url of this.editRemovedUrls) {
          try {
            await (this.firebaseService as any).deleteFileByUrl(url);
          } catch (e) {
            console.warn('Failed to delete storage object for URL:', url, e);
          }
        }
      }

      const updatedData: any = {
        petName: val.petName,
        species: this.normalizeSpecies(val.species),
        ageYears: val.ageYears ?? null,
        ageMonths: val.ageMonths ?? null,
        ageInMonths,
        description: val.description ?? '',
        status: val.status,
        active: val.status === 'Active',
        photos: finalPhotos,
        updatedAt: Date.now()
      };

      await this.firebaseService.editInformation('pet-adoption', id, updatedData);
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

    adoption.status = next;
    adoption.active = next === 'Active';

    this.updateAdoptionStatus(adoption.id, next);
    this.showToast('Success', 'Status Updated', `Adoption status changed to ${next}`);
  }

  async updateAdoptionStatus(adoptionId: string, status: string): Promise<void> {
    try {
      if ((this.firebaseService as any).updateStatus) {
        await (this.firebaseService as any).updateStatus('pet-adoption', adoptionId, status);
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
