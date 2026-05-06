import { Route, Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@ozon/frontend/features/feature-shell').then(
        (m) => m.SHELL_ROUTES,
      ),
  },
];
