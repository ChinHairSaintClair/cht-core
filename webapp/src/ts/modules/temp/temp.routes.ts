import { Routes } from '@angular/router';

import { TempComponent } from '@mm-modules/temp/temp.component';
import { AppRouteGuardProvider } from '../../app-route.guard.provider';

export const routes: Routes = [
  {
    path: 'temp',
    component: TempComponent,
    data: { permissions: ['can_view_contacts'], tab: 'temp' },
    canActivate: [ AppRouteGuardProvider ],
  },
];


// export const routes:Routes = [
//   { path: 'temp', component: TempComponent },
//   { path: '', redirectTo: 'temp', pathMatch: 'full' },
// ];
