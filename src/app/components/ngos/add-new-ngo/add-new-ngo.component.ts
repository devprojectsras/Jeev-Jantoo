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
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './add-new-ngo.component.html',
  styleUrl: './add-new-ngo.component.scss'
})
export class AddNewNgoComponent {
  ngosForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService,private router: Router, private toastService:ToastrService
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
    this.ngosForm = this.fb.group({
      name: ['', Validators.required],
      individual: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required,Validators.pattern('^[0-9]{6}$')]],
      contact: ['', Validators.required],
    });
  }

  

  onSubmit(): void {
    if (this.ngosForm.valid) {
      const formValue = this.ngosForm.value;

      const ngosData = {
        name: formValue.name,
        individual: formValue.individual,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        contact: formValue.contact,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, ngosData, "ngos")
      .then((response) => {
        console.log('ngos added successfully with ID:', response);
        this.ngosForm.reset();
        this.showToast( "Success",`NGOs "${formValue.name}" added successfully!`,'Success');

      })
      .catch((error) => {
        console.error('Error saving ngos:', error);
        this.showToast("Error",`Failed to add ngos "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', ngosData);
    } else {
      console.log('Form is not valid');
    }
  }
}
