import { Routes } from '@angular/router';
import { FeatureShellComponent } from './feature-shell.component';

export const SHELL_ROUTES: Routes = [
  {
    path: '',
    component: FeatureShellComponent,
  },
  {
    path: 'users',
    loadChildren: () =>
      import('@ozon/frontend/features/feature-users').then(
        (m) => m.USERS_ROUTES,
      ),
  },
];
