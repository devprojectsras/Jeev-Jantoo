import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PrimaryComponent } from './layouts/primary/primary.component';
import { SecondaryComponent } from './layouts/secondary/secondary.component';
import { authGuard } from './auth.guard';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AddNewEventComponent } from './components/events/add-new-event/add-new-event.component';
import { AddNewBoardingComponent } from './components/boardings/add-new-boarding/add-new-boarding.component';
import { ManageAmbulanceComponent } from './components/ambulance/manage-ambulance/manage-ambulance.component';
import { ManageUsersComponent } from './components/users/manage-users/manage-users.component';
import { AddNewUserComponent } from './components/users/add-new-user/add-new-user.component';
import { AddNewNgoComponent } from './components/ngos/add-new-ngo/add-new-ngo.component';
import { ManageNgosComponent } from './components/ngos/manage-ngos/manage-ngos.component';
import { AddNewVeterinaryClinicComponent } from './components/veterinaryClinics/add-new-veterinary-clinic/add-new-veterinary-clinic.component';
import { ManageVeterinaryClinicsComponent } from './components/veterinaryClinics/manage-veterinary-clinics/manage-veterinary-clinics.component';
import { ManageEventsComponent } from './components/events/manage-events/manage-events.component';
import { AddNewAmbulanceComponent } from './components/ambulance/add-new-ambulance/add-new-ambulance.component';
import { ManageBoardingsComponent } from './components/boardings/manage-boardings/manage-boardings.component';
import { AddNewAbcComponent } from './components/abcs/add-new-abc/add-new-abc.component';
import { ManageAbcsComponent } from './components/abcs/manage-abcs/manage-abcs.component';
import { AddNewSpaComponent } from './components/spas/add-new-spa/add-new-spa.component';
import { ManageGovernmentHelplinesComponent } from './components/governmentHelplines/manage-government-helplines/manage-government-helplines.component';
import { ManageSpasComponent } from './components/spas/manage-spas/manage-spas.component';
import { AddNewGovernmentHelplineComponent } from './components/governmentHelplines/add-new-government-helpline/add-new-government-helpline.component';
import { AddNewPetAdoptionComponent } from './components/pet-adoption/add-new-pet-adoption/add-new-pet-adoption.component';
import { ManageAdoptionComponent } from './components/pet-adoption/manage-pet-adoption/manage-pet-adoption.component';
import { ManageMedicalInsuranceComponent } from './components/Insurance/manage-medical-insurance/manage-medical-insurance.component';
import { AddNewMedicalInsuranceComponent } from './components/Insurance/add-new-medical-insurance/add-new-medical-insurance.component';
import { AddNewFeedingComponent } from './components/food/add-new-food/add-new-food.component';
import { ManageFoodComponent } from './components/food/manage-food/manage-food.component';
import { ManageReportsComponent } from './components/manage-reports/manage-reports.component';

export const routes: Routes = [
  {
    path: '',
    component: PrimaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: LoginComponent,
      },
    ],
  },
  {
    path: 'login',
    component: PrimaryComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
      },
    ],
  },
  {
    path: 'dashboard',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
    ],
  },
  {
    path: 'add-new-ngo',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewNgoComponent,
      },
    ],
  },
  {
    path: 'manage-ngos',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageNgosComponent,
      },
    ],
  },
  {
    path: 'add-new-veterinaryClinic',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewVeterinaryClinicComponent,
      },
    ],
  },
  {
    path: 'manage-veterinaryClinics',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageVeterinaryClinicsComponent,
      },
    ],
  },
  {
    path: 'add-new-event',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewEventComponent,
      },
    ],
  },
  {
    path: 'manage-events',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageEventsComponent,
      },
    ],
  },
  {
    path: 'add-new-ambulance',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewAmbulanceComponent,
      },
    ],
  },
  {
    path: 'manage-ambulance',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageAmbulanceComponent,
      },
    ],
  },
  {
    path: 'add-new-boarding',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewBoardingComponent,
      },
    ],
  },
  {
    path: 'manage-boardings',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageBoardingsComponent,
      },
    ],
  },
  {
    path: 'add-new-abcs',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewAbcComponent,
      },
    ],
  },
  {
    path: 'manage-abcs',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageAbcsComponent,
      },
    ],
  },
  {
    path: 'add-new-spa',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewSpaComponent,
      },
    ],
  },
  {
    path: 'manage-spas',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageSpasComponent,
      },
    ],
  },
  {
    path: 'add-new-governmentHelplines',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewGovernmentHelplineComponent,
      },
    ],
  },
  {
    path: 'manage-governmentHelplines',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageGovernmentHelplinesComponent,
      },
    ],
  },
  {
    path: 'add-new-user',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewUserComponent,
      },
    ],
  },
  {
    path: 'manage-users',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageUsersComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
      },
    ],
  },
  {
    path: 'add-new-pet-adoption',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewPetAdoptionComponent,
      },
    ],
  },
  {
  path: 'manage-medical-insurance',
  component: SecondaryComponent,
  canActivate: [authGuard],
  children: [
    {
      path: '',
      component: ManageMedicalInsuranceComponent,
    },
  ],
},
{
  path: 'add-new-feeding',
  component: SecondaryComponent,
  children: [
    { path: '', component: AddNewFeedingComponent }
  ]
},
{
  path: 'manage-food',
  component: SecondaryComponent,
  children: [{ path: '', component: ManageFoodComponent }]
},
{
  path: 'add-new-medical-insurance',
  component: SecondaryComponent,
  canActivate: [authGuard],
  children: [
    {
      path: '',
      component: AddNewMedicalInsuranceComponent,
    },
  ],
},

  {
    path: 'manage-pet-adoption',
    component: SecondaryComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageAdoptionComponent,
      },
    ],
  },
  {
  path: 'manage-reports',
  component: SecondaryComponent,
  canActivate: [authGuard],
  children: [{ path: '', component: ManageReportsComponent }],
},
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];