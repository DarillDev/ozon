# DataSource: управління фільтрами і пагінацією

**Дата:** 2026-05-06
**Гілка:** feat/test

## Мета

Створити сервіс для управління станом фільтрів і пагінації на сторінці списку користувачів. Патерн — абстрактний базовий клас `ADataSourceService`, аналогічний `bbp` проекту, але без кешування і без синхронізації з URL.

## Архітектура

```
UserListPageComponent
  providers: [UsersListDataSourceService]
  inject(UsersListDataSourceService)
        ↓
UsersListDataSourceService extends ADataSourceService<IUserFilter, IUserDto>
  implements getDataSource(params) → usersApiService.getUsers({...params.filters, ...params.pagination})
        ↓
ADataSourceService (libs/frontend/data-access-api)
  updater$ → switchMap → getDataSource() → data$, pagination$, isLoading$
```

## Зміни по файлах

### 1. `libs/frontend/data-access-api` — новий модуль `data-source/`

#### `data-source.interfaces.ts`

```ts
export interface IPaginationParams {
  page: number;
  limit: number;
}

export interface IPaginationState extends IPaginationParams {
  total: number;
}

export interface IDataSourceParams<TFilter> {
  filters: TFilter;
  pagination: IPaginationParams;
}
```

#### `data-source.constants.ts`

```ts
export const DEFAULT_PAGINATION: IPaginationState = { page: 1, limit: 10, total: 0 };
```

#### `data-source.abstract.ts`

```ts
@Injectable()
export abstract class ADataSourceService<TFilter extends object, TData> implements OnDestroy {
  protected abstract filters: TFilter;

  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly data$      = new BehaviorSubject<TData[]>([]);
  public readonly pagination$ = new BehaviorSubject<IPaginationState>(DEFAULT_PAGINATION);

  private readonly updater$ = new Subject<void>();

  constructor() {
    this.updater$.pipe(
      switchMap(() => this.fetchData()),
    ).subscribe();
  }

  public abstract getDataSource(params: IDataSourceParams<TFilter>): Observable<IPaginatedResponse<TData>>;

  public update(): void { this.updater$.next(); }

  public updateFilter(changes: Partial<TFilter>): void {
    this.filters = { ...this.filters, ...changes };
    this.resetPage();
    this.updater$.next();
  }

  public resetFilter(defaults: TFilter): void {
    this.filters = defaults;
    this.resetPage();
    this.updater$.next();
  }

  public setPagination(changes: Partial<IPaginationParams>): void {
    this.pagination$.next({ ...this.pagination$.value, ...changes });
    this.updater$.next();
  }

  public ngOnDestroy(): void { this.updater$.complete(); }

  private resetPage(): void {
    this.pagination$.next({ ...this.pagination$.value, page: 1 });
  }

  private fetchData(): Observable<never> {
    this.isLoading$.next(true);
    return this.getDataSource({ filters: this.filters, pagination: this.pagination$.value }).pipe(
      tap(response => {
        this.data$.next(response.data);
        this.pagination$.next({ ...this.pagination$.value, total: response.total });
      }),
      catchError(() => EMPTY),
      finalize(() => this.isLoading$.next(false)),
      ignoreElements(),
    );
  }
}
```

Публічний API через `index.ts`:
```ts
export { ADataSourceService } from './lib/data-source/data-source.abstract';
export type { IDataSourceParams, IPaginationParams, IPaginationState } from './lib/data-source/data-source.interfaces';
export { DEFAULT_PAGINATION } from './lib/data-source/data-source.constants';
```

### 2. `libs/frontend/features/feature-users/src/lib/pages/user-list-page/`

#### `interfaces/user-filter.interface.ts` (новий файл)

```ts
export interface IUserFilter {
  name?: string;
  sex?: 'male' | 'female';
  isActive?: boolean;
}
```

#### `services/users-list-data-source.service.ts` (новий файл)

```ts
@Injectable()
export class UsersListDataSourceService extends ADataSourceService<IUserFilter, IUserDto> {
  private readonly usersApi = inject(UsersApiService);

  protected filters: IUserFilter = {};

  public getDataSource(params: IDataSourceParams<IUserFilter>): Observable<IUsersPageDto> {
    return this.usersApi.getUsers({ ...params.filters, ...params.pagination });
  }
}
```

#### `user-list-page.component.ts` (оновлення)

```ts
@Component({
  providers: [UsersListDataSourceService],
  // ...
})
export class UserListPageComponent {
  protected readonly dataSource = inject(UsersListDataSourceService);

  protected readonly users     = toSignal(this.dataSource.data$,        { initialValue: [] });
  protected readonly isLoading = toSignal(this.dataSource.isLoading$,   { initialValue: false });
  protected readonly pagination = toSignal(this.dataSource.pagination$, { initialValue: DEFAULT_PAGINATION });

  constructor() {
    this.dataSource.update();
  }

  protected onFilterChange(changes: Partial<IUserFilter>): void {
    this.dataSource.updateFilter(changes);
  }

  protected onPageChange(page: number): void {
    this.dataSource.setPagination({ page });
  }

  protected onReset(): void {
    this.dataSource.resetFilter({});
  }
}
```

## Рішення

| Питання | Рішення |
|---------|---------|
| Signals vs RxJS | RxJS BehaviorSubject (bbp-стиль), компонент читає через `toSignal()` |
| Кешування | Відсутнє (можна додати пізніше) |
| Сортування | Не включено (API не підтримує) |
| Де живе абстракція | `libs/frontend/data-access-api` (без нового Nx-проекту) |
| URL sync | Відсутня |

## Що НЕ змінюється

- `UsersApiService` — без змін
- `IUsersQueryDto`, `IUsersPageDto` — без змін
- Backend — без змін
