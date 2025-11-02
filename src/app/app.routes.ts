
import {  Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { SeatsComponent} from './seats/seats';
import {  ReserveComponent } from './reserve/reserve';
import { ModifyComponent } from './modify/modify';
import { CancelComponent } from './cancel/cancel';

import {HomeComponent} from './home/home';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'seats', component: SeatsComponent },
  { path: 'reserve', component: ReserveComponent },
  { path: 'modify', component: ModifyComponent },
  { path: 'cancel', component: CancelComponent }

];


