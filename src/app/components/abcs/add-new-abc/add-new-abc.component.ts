import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-new-abc',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './add-new-abc.component.html',
  styleUrl: './add-new-abc.component.scss'
})
export class AddNewAbcComponent {
  abcsForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService, private toastService:ToastrService  ) {}

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
    this.abcsForm = this.fb.group({
      personIncharge: ['', Validators.required],
      type: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      area: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  

  onSubmit(): void {
    if (this.abcsForm.valid) {
      const formValue = this.abcsForm.value;


      const abcsData = {
        personIncharge: formValue.personIncharge,
        type: formValue.type,
        state: formValue.state,
        city: formValue.city,
        area: formValue.area,
        pincode: formValue.pincode,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, abcsData, "abcs")
      .then((response) => {
        console.log('abcs added successfully with ID:', response);
        this.showToast( "Success",`abcs "${formValue.name}" added successfully!`,'Success');
        this.abcsForm.reset();
      })
      .catch((error) => {
        console.error('Error saving abcs:', error);
        this.showToast("Error",`Failed to add abcs "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', abcsData);
    } else {
      console.log('Form is not valid');
    }
  }
}
