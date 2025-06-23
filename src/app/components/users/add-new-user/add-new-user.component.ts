import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService } from '../../../services/firebase.service'; 
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { finalize } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-add-new-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './add-new-user.component.html',
  styleUrl: './add-new-user.component.scss'
})
export class AddNewUserComponent implements OnInit {
  userForm!: FormGroup;
  profilePictureUrl: string = '';

  constructor(private fb: FormBuilder, private firebaseService: FirebaseService ,private toastService:ToastrService
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
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      gender: [''],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      profilePicture: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      Adhar: ['', Validators.required],
      AdharPicture: ['', Validators.required],
      area: ['', Validators.maxLength(255)]
    });
  }
 
  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
  
      // Prepare unique document ID
      const docID = uuidv4();
  
      // Handle file uploads (AdharPicture and ProfilePicture)
      const adharFile = formValue.AdharPicture;
      const profileFile = formValue.profilePicture;
  
      Promise.all([
        this.firebaseService.uploadFile(`adhar-pictures/${docID}`, adharFile),
        this.firebaseService.uploadFile(`profile-pictures/${docID}`, profileFile),
      ])
        .then(([adharUrl, profileUrl]) => {
          const userData = {
            firstname: formValue.firstname,
            lastname: formValue.lastname,
            email: formValue.email,
            gender: formValue.gender,
            phone: formValue.phone,
            city: formValue.city,
            state: formValue.state,
            area: formValue.area,
            Adhar: formValue.Adhar,
            AdharPicture: adharUrl, // Store Adhar picture URL
            pincode: formValue.pincode,
            profilePicture: profileUrl, // Store profile picture URL
            status: "Active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
  
          // Save user data in Firestore or your database
          return this.firebaseService.addInformation(docID, userData, "user");
          
        })
        .then((response) => {
          console.log('User added successfully with ID:', response);
          this.userForm.reset();
          this.showToast( "Success",`User "${formValue.name}" added successfully!`,'Success');

        })
        .catch((error) => {
          console.error('Error saving user:', error);
        this.showToast("Error",`Failed to add user "${formValue.name}". Please try again.`,"Error");
        });
    } else {
      console.log('Form is not valid');
    }
  }
  
  onFileChange(event: Event, controlName: string): void {
    const input = event.target; // Avoid explicit typing
    if (input && (input as any).files && (input as any).files[0]) {
      const file = (input as any).files[0];
      this.userForm.patchValue({ [controlName]: file });
      this.userForm.get(controlName)?.markAsDirty();
    }
  }
  

  
}
