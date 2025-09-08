import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-manage-feeding',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-feeding.component.html',
  styleUrls: ['./manage-feeding.component.scss']
})
export class ManageFeedingComponent {
  feedings: any[] = [];
  paginatedFeedings: any[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 0;
  rowsPerPageOptions = [5, 10, 15, 20];

  editFeedingForm: FormGroup;
  selectedFeeding: any = null;
  feedingToDelete: any = null;

  constructor(
    private firebaseService: FirebaseService,
    private fb: FormBuilder,
    private toastService: ToastrService
  ) {
    this.editFeedingForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      contact: ['', Validators.required],
      address: ['', Validators.required],
      food_items: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFeedings();
  }

  async loadFeedings() {
    try {
      const data = await this.firebaseService.getInformation('feeding');
      this.feedings = Array.isArray(data) ? data : [];
      this.updatePagination();
    } catch (error) {
      console.error(error);
    }
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.feedings.length / this.rowsPerPage);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedFeedings = this.feedings.slice(start, end);
  }

  changeRowsPerPage(rows: number) {
    this.rowsPerPage = rows;
    this.currentPage = 1;
    this.updatePagination();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  openEditForm(feeding: any) {
    this.selectedFeeding = { ...feeding };
    this.editFeedingForm.patchValue(feeding);
  }

  closeEditForm() {
    this.selectedFeeding = null;
    this.editFeedingForm.reset();
  }

  async saveFeeding() {
    if (this.editFeedingForm.valid && this.selectedFeeding) {
      const updatedData = { updatedAt: Date.now(), ...this.editFeedingForm.value };
      await this.firebaseService.editInformation('feeding', this.selectedFeeding.id, updatedData);
      this.closeEditForm();
      await this.loadFeedings();
    }
  }

  onStatusToggle(feeding: any) {
    feeding.status = feeding.status === 'Active' ? 'Inactive' : 'Active';
    this.firebaseService.updateStatus('feeding', feeding.id, feeding.status);
  }

  openDeleteModal(feeding: any) {
    this.feedingToDelete = feeding;
    const modalEl = document.getElementById('deleteModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeDeleteModal() {
    const modalEl = document.getElementById('deleteModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
    this.feedingToDelete = null;
  }

  async confirmDelete() {
    if (this.feedingToDelete) {
      await this.firebaseService.deleteInformation('feeding', this.feedingToDelete.id);
      this.closeDeleteModal();
      await this.loadFeedings();
    }
  }
}
