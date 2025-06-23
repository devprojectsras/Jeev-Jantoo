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


export const routes: Routes = [
  {
    path: '', // Default route
    component: PrimaryComponent,
    canActivate: [authGuard], // Use AuthGuard to determine redirection
    children: [
      {
        path: '',
        component: LoginComponent, // Default to LoginComponent if not authenticated
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
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewNgoComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-ngos',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageNgosComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-veterinaryClinic',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewVeterinaryClinicComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-veterinaryClinics',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageVeterinaryClinicsComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-event',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewEventComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-events',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageEventsComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-ambulance',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewAmbulanceComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-ambulance',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageAmbulanceComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-boarding',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewBoardingComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-boardings',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageBoardingsComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-abcs',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewAbcComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-abcs',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageAbcsComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-spa',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewSpaComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-spas',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageSpasComponent, // The component for managing NGOs
      },
    ],
  },

  {
    path: 'add-new-governmentHelplines',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewGovernmentHelplineComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-governmentHelplines',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageGovernmentHelplinesComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'add-new-user',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AddNewUserComponent, // The component for managing NGOs
      },
    ],
  },
  {
    path: 'manage-users',
    component: SecondaryComponent, // Use the layout component
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ManageUsersComponent, // The component for managing NGOs
      },
    ],
  },
  
 
  
  { path: 'reset-password', component: ResetPasswordComponent },

  

  {
    path: '**',
    redirectTo: '', // Redirect any undefined route to the root
  },
];
