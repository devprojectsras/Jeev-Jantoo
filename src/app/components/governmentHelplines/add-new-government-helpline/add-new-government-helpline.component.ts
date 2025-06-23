import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-new-government-helpline',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './add-new-government-helpline.component.html',
  styleUrl: './add-new-government-helpline.component.scss'
})
export class AddNewGovernmentHelplineComponent {
  govtHelplineForm!: FormGroup;

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService, private toastService:ToastrService
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
    this.govtHelplineForm = this.fb.group({
      helplineServices: ['', Validators.required],
      contact: ['', Validators.required],
      govtBody: ['', Validators.required],
      remarks: ['', Validators.maxLength(255)]
    });
  }


  onSubmit(): void {
    if (this.govtHelplineForm.valid) {
      const formValue = this.govtHelplineForm.value;

      

      const govtHelplineData = {
        helplineServices: formValue.helplineServices,
        contact: formValue.contact,
        govtBody: formValue.govtBody,
        remarks: formValue.remarks,
        status: "Active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docID = uuidv4();

      this.firebaseService
      .addInformation(docID, govtHelplineData, "government-helpline")
      .then((response) => {
        console.log('Government Helpline added successfully with ID:', response);
        this.govtHelplineForm.reset();
        this.showToast( "Success",`Government Helpline "${formValue.name}" added successfully!`,'Success');

      })
      .catch((error) => {
        console.error('Error saving Government Helpline:', error);
        this.showToast("Error",`Failed to add governmnet helpline "${formValue.name}". Please try again.`,"Error");
      });
      console.log('Form Data:', govtHelplineData);
    } else {
      console.log('Form is not valid');
    }
  }
}
