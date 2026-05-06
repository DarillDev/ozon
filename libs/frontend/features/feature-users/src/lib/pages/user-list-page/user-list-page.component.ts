import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'feature-users-list-page',
  imports: [],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListPageComponent {}
