import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  selectedFiles: File[] = [];  // 📌 multiple optional photos

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.petAdoptionForm = this.fb.group({
      petName: ['', Validators.required],
      species: ['', Validators.required],
      breed: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      healthStatus: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      location: ['', Validators.required],
      description: ['', Validators.maxLength(255)]
    });
  }

  // 📷 file select method (multiple)
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files); // multiple photos
  }

  private showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
    const currentTime = new Date().toLocaleTimeString();
    const fullTitle = `${title} - ${currentTime}`;

    switch (type) {
      case 'Success':
        this.toastService.success(message, fullTitle);
        break;
      case 'Error':
        this.toastService.error(message, fullTitle);
        break;
      case 'Info':
        this.toastService.info(message, fullTitle);
        break;
      case 'Warning':
        this.toastService.warning(message, fullTitle);
        break;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.petAdoptionForm.valid) {
      this.showToast("Warning", "Form Invalid", "Please fill all required fields correctly.");
      return;
    }

    const formValue = { ...this.petAdoptionForm.value };

    // Trim strings
    Object.keys(formValue).forEach(key => {
      if (typeof formValue[key] === 'string') {
        formValue[key] = formValue[key].trim();
      }
    });

    const docID = uuidv4();
    let photoUrls: string[] = [];

    try {
      // 📤 Upload photos if selected
      if (this.selectedFiles.length > 0) {
        for (const file of this.selectedFiles) {
          const path = `pet-photos/${docID}/${file.name}`;
          const url = await this.firebaseService.uploadFile(path, file);
          photoUrls.push(url);
        }
      }

      const petAdoptionData = {
        ...formValue,
        photos: photoUrls,         // ✅ multiple/optional photos
        status: "Active",          // ✅ always active for admin
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.firebaseService.addInformation(docID, petAdoptionData, "pet-adoption");

      this.petAdoptionForm.reset();
      this.petAdoptionForm.markAsPristine();
      this.petAdoptionForm.markAsUntouched();
      this.selectedFiles = [];

      this.showToast("Success", "Pet Added", `Pet "${formValue.petName}" added successfully!`);
      this.router.navigate(['/manage-pet-adoption']);
    } catch (error) {
      console.error('Error saving pet adoption:', error);
      this.showToast("Error", "Save Failed", `Failed to add pet "${formValue.petName}". Please try again.`);
    }
  }
}
