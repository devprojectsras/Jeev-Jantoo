import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-pet-adoption',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-new-pet-adoption.component.html',
  styleUrls: ['./add-new-pet-adoption.component.scss']
})
export class AddNewPetAdoptionComponent implements OnInit {
  petAdoptionForm!: FormGroup;
  selectedFiles: File[] = [];  // multiple images

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.petAdoptionForm = this.fb.group({
      petName: ['', [Validators.required, Validators.minLength(2)]],
      species: ['', Validators.required],            // codes: dog/cat/bird/fish/rabbit/other
      breed: ['', Validators.required],
      gender: ['', Validators.required],             // Male/Female/Unknown
      ageYears: [null, [Validators.min(0)]],
      ageMonths: [null, [Validators.min(0), Validators.max(11)]],
      healthStatus: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      location: ['', Validators.required],
      description: ['', Validators.maxLength(255)]
    }, { validators: this.ageValidator });
  }

  // show age errors only after user interacts with either age field
  ageTouched(): boolean {
    const y = this.petAdoptionForm.get('ageYears');
    const m = this.petAdoptionForm.get('ageMonths');
    return !!((y && (y.touched || y.dirty)) || (m && (m.touched || m.dirty)));
  }

  private ageValidator(group: AbstractControl): ValidationErrors | null {
    const yRaw = group.get('ageYears')?.value;
    const mRaw = group.get('ageMonths')?.value;

    const y = (yRaw === null || yRaw === '') ? null : Number(yRaw);
    const m = (mRaw === null || mRaw === '') ? null : Number(mRaw);

    const interacted =
      (group.get('ageYears')?.touched || group.get('ageYears')?.dirty) ||
      (group.get('ageMonths')?.touched || group.get('ageMonths')?.dirty);

    if (!interacted) return null;

    const bothEmpty = (y === null || isNaN(y)) && (m === null || isNaN(m));
    if (bothEmpty) return { ageRequired: true };

    if ((y !== null && (isNaN(y) || y < 0)) || (m !== null && (isNaN(m) || m < 0 || m > 11))) {
      return { ageInvalid: true };
    }
    return null;
  }

  // files input
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event?.target?.files || []);
  }

  // previews & remove
  previewFile(file: File): string {
    return URL.createObjectURL(file);
  }
  removeNewFile(i: number) {
    this.selectedFiles.splice(i, 1);
  }

  private showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title} - ${currentTime}`;
    switch (type) {
      case 'Success': this.toastService.success(message, fullTitle); break;
      case 'Error': this.toastService.error(message, fullTitle); break;
      case 'Info': this.toastService.info(message, fullTitle); break;
      case 'Warning': this.toastService.warning(message, fullTitle); break;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.petAdoptionForm.valid) {
      this.showToast('Warning', 'Form Invalid', 'Please fill all required fields correctly.');
      return;
    }

    // Trim strings
    const v: any = { ...this.petAdoptionForm.value };
    Object.keys(v).forEach(k => { if (typeof v[k] === 'string') v[k] = v[k].trim(); });

    // Canonical age
    const years = Number(v.ageYears || 0);
    const months = Number(v.ageMonths || 0);
    const ageInMonths = (isNaN(years) ? 0 : years * 12) + (isNaN(months) ? 0 : months);

    // Species code guard
    const normalizeSpecies = (s: string) => {
      const x = (s || '').toLowerCase();
      if (x.includes('dog')) return 'dog';
      if (x.includes('cat')) return 'cat';
      if (x.includes('bird')) return 'bird';
      if (x.includes('fish')) return 'fish';
      if (x.includes('rabbit')) return 'rabbit';
      return 'other';
    };

    const id = uuidv4();
    const photoUrls: string[] = [];

    try {
      // upload all selected images
      for (let i = 0; i < this.selectedFiles.length; i++) {
        const f = this.selectedFiles[i];
        const ext = (f.name.split('.').pop() || 'jpg').toLowerCase();
        const safeBase = f.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 40);
        const filename = `${Date.now()}_${i}_${safeBase}.${ext}`;
        const path = `pet-photos/${id}/${filename}`;

        // Your service signature: uploadFile(path: string, file: File)
        const url = await this.firebaseService.uploadFile(path, f);
        photoUrls.push(url);
      }

      const payload = {
        id,
        petName: v.petName,
        species: normalizeSpecies(v.species),
        breed: v.breed,
        gender: v.gender,                 // 'Male' | 'Female' | 'Unknown'
        ageYears: v.ageYears ?? null,
        ageMonths: v.ageMonths ?? null,
        ageInMonths,
        health: v.healthStatus || null,
        location: v.location,
        contactPhone: v.contact,
        description: v.description || '',
        photos: photoUrls,                // multiple photos saved
        status: 'Active',                 // admin posts live
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.firebaseService.addInformation(id, payload, 'pet-adoption');

      this.petAdoptionForm.reset();
      this.petAdoptionForm.markAsPristine();
      this.petAdoptionForm.markAsUntouched();
      this.selectedFiles = [];

      this.showToast('Success', 'Pet Added', `Pet "${v.petName}" added successfully!`);
      this.router.navigate(['/manage-pet-adoption']);
    } catch (error) {
      console.error('Error saving pet adoption:', error);
      this.showToast('Error', 'Save Failed', `Failed to add pet "${v.petName}". Please try again.`);
    }
  }
}
