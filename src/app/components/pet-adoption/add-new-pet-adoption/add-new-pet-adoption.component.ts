import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastService: ToastrService
  ) {}

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

  onSubmit(): void {
    if (this.petAdoptionForm.valid) {
      const formValue = this.petAdoptionForm.value;
      const petAdoptionData = {
        petName: formValue.petName,
        species: formValue.species,
        breed: formValue.breed,
        age: formValue.age,
        gender: formValue.gender,
        healthStatus: formValue.healthStatus,
        contact: formValue.contact,
        location: formValue.location,
        description: formValue.description,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const docID = uuidv4();

      this.firebaseService
        .addInformation(docID, petAdoptionData, "pet-adoption")
        .then((response) => {
          console.log('Pet adoption added successfully with ID:', response);
          this.petAdoptionForm.reset();
          this.showToast("Success", `Pet "${formValue.petName}" added successfully!`, 'Success');
        })
        .catch((error) => {
          console.error('Error saving pet adoption:', error);
          this.showToast("Error", `Failed to add pet "${formValue.petName}". Please try again.`, "Error");
        });
      console.log('Form Data:', petAdoptionData);
    } else {
      console.log('Form is not valid');
    }
  }
}