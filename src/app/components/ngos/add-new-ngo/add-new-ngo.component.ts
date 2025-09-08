import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-ngo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './add-new-ngo.component.html',
  styleUrls: ['./add-new-ngo.component.scss']
})
export class AddNewNgoComponent implements OnInit {
  ngoForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.ngoForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      contact: ['', Validators.required],
      lat: ['', Validators.required],
      lng: ['', Validators.required],
    });
  }

  showToast(type: 'Success' | 'Error' | 'Info' | 'Warning', title: string, message: string) {
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
      default:
        console.error('Invalid toast type');
    }
  }

  onSubmit(): void {
    if (!this.ngoForm.valid) {
      console.log('Form is not valid');
      return;
    }

    const formValue = this.ngoForm.value;
    const ngoData = {
      name: formValue.name,
      individual: formValue.individual,
      state: formValue.state,
      city: formValue.city,
      area: formValue.area,
      pincode: formValue.pincode,
      contact: formValue.contact,
      lat: Number(formValue.lat),
      lng: Number(formValue.lng),
      status: 'Active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docID = uuidv4();

    this.firebaseService
      .addInformation(docID, ngoData, 'ngos')
      .then(() => {
        this.ngoForm.reset();
        this.showToast('Success', 'NGO Added', `NGO "${formValue.name}" added successfully!`);
      })
      .catch((error) => {
        console.error('Error saving NGO:', error);
        this.showToast('Error', 'NGO Add Failed', `Failed to add NGO "${formValue.name}". Please try again.`);
      });
  }
}
