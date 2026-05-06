import { Routes } from '@angular/router';
import { UserListPageComponent } from './pages/user-list-page/user-list-page.component';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UserListPageComponent,
  },
];
