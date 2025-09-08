import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FirebaseService } from '../../../services/firebase.service';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-new-medical-insurance',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-new-medical-insurance.component.html',
  styleUrls: ['./add-new-medical-insurance.component.scss']
})
export class AddNewMedicalInsuranceComponent implements OnInit {
  insuranceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.insuranceForm = this.fb.group({
      providerName: ['', Validators.required],
      website: ['', [Validators.required, Validators.pattern(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)]],
      coverage: ['', Validators.required],
      contact: ['', Validators.required],
      remarks: ['']
    });
  }

  onSubmit() {
    if (this.insuranceForm.valid) {
      const formValue = this.insuranceForm.value;
      const insuranceData = {
        id: uuidv4(),
        providerName: formValue.providerName,
        website: formValue.website,
        coverage: formValue.coverage,
        contact: formValue.contact,
        remarks: formValue.remarks,
        status: 'Active',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      console.log('Submitting insurance data:', insuranceData); // Debug log

      this.firebaseService.addInformation(insuranceData.id, insuranceData, 'medical-insurance')
        .then(() => {
          console.log('Insurance added successfully to Firestore');
          this.insuranceForm.reset();
          this.toastr.success(`Insurance "${formValue.providerName}" added successfully!`, 'Success');
        })
        .catch(err => {
          console.error('Error adding insurance to Firestore:', err);
          this.toastr.error(`Failed to add insurance: ${err.message || 'Unknown error'}`, 'Error');
        });
    } else {
      console.log('Form is invalid:', this.insuranceForm.errors); // Debug log
      this.insuranceForm.markAllAsTouched(); // Mark all fields as touched to show errors
      this.toastr.error('Please fill all required fields correctly', 'Error');
    }
  }
}