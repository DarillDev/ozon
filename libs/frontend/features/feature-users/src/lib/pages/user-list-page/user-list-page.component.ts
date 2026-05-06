import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { UsersApiService } from '@ozon/frontend/data-access-api/controllers/users';
import {
  IUserDto,
  IUsersPageDto,
  IUsersQueryDto,
} from '@ozon/shared/model-dtos';
import { createSearchUserForm } from './forms/search-user-form.model';
import { ISearchUserForm } from './interfaces/search-user-form.interface';
import { HttpResourceRef } from '@angular/common/http';

@Component({
  selector: 'feature-users-list-page',
  imports: [FormField],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListPageComponent {
  private readonly usersService = inject(UsersApiService);

  protected readonly searchForm: FieldTree<ISearchUserForm>;
  protected readonly filter: Signal<IUsersQueryDto>;
  protected readonly usersResource: HttpResourceRef<IUsersPageDto | undefined>;
  protected readonly users: Signal<IUserDto[]>;

  constructor() {
    this.searchForm = createSearchUserForm();
    this.filter = computed<IUsersQueryDto>(() => ({
      name: this.searchForm.query().value(),
    }));
    this.usersResource = this.usersService.getUsersResource(this.filter);
    this.users = computed(() => this.usersResource.value()?.data ?? []);
  }
}
