import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
  Signal,
  WritableSignal,
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
import { UsersListComponent } from './components/users-list/users-list.component';

@Component({
  selector: 'feature-users-list-page',
  imports: [FormField, UsersListComponent],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListPageComponent {
  private readonly usersService = inject(UsersApiService);

  protected readonly searchForm: FieldTree<ISearchUserForm>;

  protected readonly limit = signal(10);
  protected readonly page: WritableSignal<number>;
  protected readonly filter: Signal<IUsersQueryDto>;
  protected readonly usersResource: HttpResourceRef<IUsersPageDto | undefined>;
  protected readonly users: Signal<IUserDto[]>;
  protected readonly total: Signal<number>;

  constructor() {
    this.searchForm = createSearchUserForm();
    this.filter = computed<IUsersQueryDto>(() => ({
      name: this.searchForm.query().value(),
      page: this.page(),
      limit: this.limit(),
    }));
    this.usersResource = this.usersService.getUsersResource(this.filter);
    this.users = computed(() => this.usersResource.value()?.data ?? []);
    this.total = computed(() => this.usersResource.value()?.total ?? 0);
    this.page = linkedSignal(() => {
      this.searchForm.query().value();
      return 1;
    });
  }

  protected onPageChange(page: number): void {
    this.page.set(page);
  }
}
