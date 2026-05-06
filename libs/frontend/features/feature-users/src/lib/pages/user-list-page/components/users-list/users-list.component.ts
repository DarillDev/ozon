import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { IUserDto } from '@ozon/shared/model-dtos';
import { PaginatorComponent } from '../paginator/paginator.component';

@Component({
  selector: 'feature-users-list',
  imports: [PaginatorComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent {
  public readonly users = input.required<IUserDto[]>();
  public readonly page = input.required<number>();
  public readonly limit = input.required<number>();
  public readonly total = input.required<number>();

  public readonly onPageChange = output<number>();
}
