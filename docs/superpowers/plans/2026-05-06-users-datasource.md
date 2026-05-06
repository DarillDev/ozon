# DataSource: фільтри та пагінація для users-list Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Створити абстрактний `ADataSourceService` в `data-access-api` і конкретний `UsersListDataSourceService` у `feature-users`, замінивши прямий виклик `usersService.getUsers()` в компоненті.

**Architecture:** Абстрактний клас `ADataSourceService<TFilter, TData>` зберігає стан фільтрів, пагінації, даних та завантаження через RxJS `BehaviorSubject`. Конкретний клас успадковує його, реалізує `getDataSource()` і надається як `providers: [UsersListDataSourceService]` у компоненті. Компонент читає стан через `toSignal()`.

**Tech Stack:** Angular 21, RxJS, Jest, TypeScript 5.9, Nx 22 monorepo (pnpm)

---

## File Map

| Статус | Файл | Відповідальність |
|--------|------|-----------------|
| CREATE | `libs/frontend/data-access-api/src/lib/data-source/data-source.interfaces.ts` | `IPaginationParams`, `IPaginationState`, `IDataSourceParams<TFilter>` |
| CREATE | `libs/frontend/data-access-api/src/lib/data-source/data-source.constants.ts` | `DEFAULT_PAGINATION` |
| CREATE | `libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.ts` | Абстрактний клас `ADataSourceService` |
| CREATE | `libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.spec.ts` | Тести для `ADataSourceService` |
| CREATE | `libs/frontend/data-access-api/src/lib/data-source/index.ts` | Публічне API модуля |
| MODIFY | `tsconfig.base.json` | Додати path alias `@ozon/frontend/data-access-api/data-source` |
| CREATE | `libs/frontend/features/feature-users/src/lib/pages/user-list-page/interfaces/user-filter.interface.ts` | `IUserFilter` |
| CREATE | `libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.ts` | Конкретний DataSource для users |
| CREATE | `libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.spec.ts` | Тести для `UsersListDataSourceService` |
| MODIFY | `libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.ts` | Використовує DataSource замість прямого сервісу |
| MODIFY | `libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.html` | Читає `users()` як `IUserDto[]` (не `IUsersPageDto`) |
| MODIFY | `libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.spec.ts` | Мокує `UsersListDataSourceService` |

---

## Task 1: Інтерфейси та константи data-source модуля

**Files:**
- Create: `libs/frontend/data-access-api/src/lib/data-source/data-source.interfaces.ts`
- Create: `libs/frontend/data-access-api/src/lib/data-source/data-source.constants.ts`

- [ ] **Step 1: Створити файл інтерфейсів**

```typescript
// libs/frontend/data-access-api/src/lib/data-source/data-source.interfaces.ts

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

- [ ] **Step 2: Створити файл констант**

```typescript
// libs/frontend/data-access-api/src/lib/data-source/data-source.constants.ts
import { IPaginationState } from './data-source.interfaces';

export const DEFAULT_PAGINATION: IPaginationState = {
  page: 1,
  limit: 10,
  total: 0,
};
```

- [ ] **Step 3: Commit**

```bash
git add libs/frontend/data-access-api/src/lib/data-source/data-source.interfaces.ts \
        libs/frontend/data-access-api/src/lib/data-source/data-source.constants.ts
git commit -m "feat(data-access-api): add data-source interfaces and constants"
```

---

## Task 2: ADataSourceService (TDD)

**Files:**
- Create: `libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.spec.ts`
- Create: `libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.ts`

- [ ] **Step 1: Написати failing тести**

```typescript
// libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { ADataSourceService } from './data-source.abstract';
import { IDataSourceParams, IPaginationState } from './data-source.interfaces';
import { DEFAULT_PAGINATION } from './data-source.constants';
import { IPaginatedResponse } from '@ozon/shared/model-types';

interface ITestFilter {
  name?: string;
}

interface ITestItem {
  id: string;
}

@Injectable()
class TestDataSourceService extends ADataSourceService<ITestFilter, ITestItem> {
  protected filters: ITestFilter = {};
  public getDataSource = jest.fn<Observable<IPaginatedResponse<ITestItem>>, [IDataSourceParams<ITestFilter>]>(
    () => of({ data: [], total: 0, page: 1, limit: 10 }),
  );
}

describe('ADataSourceService', () => {
  let service: TestDataSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TestDataSourceService] });
    service = TestBed.inject(TestDataSourceService);
  });

  it('should initialize with empty data and default pagination', () => {
    expect(service.data$.value).toEqual([]);
    expect(service.pagination$.value).toEqual(DEFAULT_PAGINATION);
    expect(service.isLoading$.value).toBe(false);
  });

  it('update() should call getDataSource and populate data$', fakeAsync(() => {
    const mockItems: ITestItem[] = [{ id: '1' }, { id: '2' }];
    service.getDataSource.mockReturnValue(
      of({ data: mockItems, total: 2, page: 1, limit: 10 }),
    );

    service.update();
    tick();

    expect(service.data$.value).toEqual(mockItems);
    expect(service.pagination$.value.total).toBe(2);
  }));

  it('update() should set isLoading$ to true during fetch and false after', fakeAsync(() => {
    const subject = new Subject<IPaginatedResponse<ITestItem>>();
    service.getDataSource.mockReturnValue(subject.asObservable());

    service.update();
    expect(service.isLoading$.value).toBe(true);

    subject.next({ data: [], total: 0, page: 1, limit: 10 });
    subject.complete();
    tick();

    expect(service.isLoading$.value).toBe(false);
  }));

  it('on error, isLoading$ should become false and data$ should remain empty', fakeAsync(() => {
    service.getDataSource.mockReturnValue(throwError(() => new Error('Network error')));

    service.update();
    tick();

    expect(service.isLoading$.value).toBe(false);
    expect(service.data$.value).toEqual([]);
  }));

  it('updateFilter() should merge filters, reset page to 1, and trigger fetch', fakeAsync(() => {
    service.pagination$.next({ ...DEFAULT_PAGINATION, page: 3 });

    service.updateFilter({ name: 'John' });
    tick();

    expect(service.pagination$.value.page).toBe(1);
    expect(service.getDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { name: 'John' } }),
    );
  }));

  it('updateFilter() should merge with existing filters', fakeAsync(() => {
    service.updateFilter({ name: 'John' });
    tick();
    service.getDataSource.mockClear();

    service.updateFilter({ name: 'Jane' });
    tick();

    expect(service.getDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { name: 'Jane' } }),
    );
  }));

  it('resetFilter() should replace filters entirely and reset page to 1', fakeAsync(() => {
    service.pagination$.next({ ...DEFAULT_PAGINATION, page: 5 });
    service.updateFilter({ name: 'Old' });
    tick();
    service.getDataSource.mockClear();

    service.resetFilter({});
    tick();

    expect(service.pagination$.value.page).toBe(1);
    expect(service.getDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ filters: {} }),
    );
  }));

  it('setPagination() should update pagination and trigger fetch', fakeAsync(() => {
    service.getDataSource.mockReturnValue(
      of({ data: [], total: 100, page: 2, limit: 10 }),
    );

    service.setPagination({ page: 2 });
    tick();

    expect(service.pagination$.value.page).toBe(2);
    expect(service.getDataSource).toHaveBeenCalledWith(
      expect.objectContaining({ pagination: expect.objectContaining({ page: 2 }) }),
    );
  }));

  it('should cancel in-flight request when update() is called again', fakeAsync(() => {
    const firstSubject = new Subject<IPaginatedResponse<ITestItem>>();
    const secondSubject = new Subject<IPaginatedResponse<ITestItem>>();
    service.getDataSource
      .mockReturnValueOnce(firstSubject.asObservable())
      .mockReturnValueOnce(secondSubject.asObservable());

    service.update();
    service.update();

    secondSubject.next({ data: [{ id: 'second' }], total: 1, page: 1, limit: 10 });
    secondSubject.complete();
    tick();

    firstSubject.next({ data: [{ id: 'first' }], total: 1, page: 1, limit: 10 });
    firstSubject.complete();
    tick();

    expect(service.data$.value).toEqual([{ id: 'second' }]);
  }));
});
```

- [ ] **Step 2: Запустити тести — переконатись що FAIL**

```bash
pnpm nx test frontend-data-access-api --testFile=src/lib/data-source/data-source.abstract.spec.ts
```

Expected: `Cannot find module './data-source.abstract'`

- [ ] **Step 3: Реалізувати ADataSourceService**

```typescript
// libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, finalize, Observable, Subject, switchMap, tap, ignoreElements, takeUntil } from 'rxjs';
import { IPaginatedResponse } from '@ozon/shared/model-types';
import { DEFAULT_PAGINATION } from './data-source.constants';
import { IDataSourceParams, IPaginationParams, IPaginationState } from './data-source.interfaces';

@Injectable()
export abstract class ADataSourceService<TFilter extends object, TData> implements OnDestroy {
  protected abstract filters: TFilter;

  public readonly isLoading$ = new BehaviorSubject<boolean>(false);
  public readonly data$ = new BehaviorSubject<TData[]>([]);
  public readonly pagination$ = new BehaviorSubject<IPaginationState>(DEFAULT_PAGINATION);

  private readonly updater$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.updater$.pipe(
      switchMap(() => this.fetchData()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public abstract getDataSource(params: IDataSourceParams<TFilter>): Observable<IPaginatedResponse<TData>>;

  public update(): void {
    this.updater$.next();
  }

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

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

- [ ] **Step 4: Запустити тести — переконатись що PASS**

```bash
pnpm nx test frontend-data-access-api --testFile=src/lib/data-source/data-source.abstract.spec.ts
```

Expected: `Tests: 7 passed, 7 total`

- [ ] **Step 5: Commit**

```bash
git add libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.ts \
        libs/frontend/data-access-api/src/lib/data-source/data-source.abstract.spec.ts
git commit -m "feat(data-access-api): add ADataSourceService abstract class"
```

---

## Task 3: Публічне API і path alias

**Files:**
- Create: `libs/frontend/data-access-api/src/lib/data-source/index.ts`
- Modify: `tsconfig.base.json`

- [ ] **Step 1: Створити index.ts модуля**

```typescript
// libs/frontend/data-access-api/src/lib/data-source/index.ts
export { ADataSourceService } from './data-source.abstract';
export { DEFAULT_PAGINATION } from './data-source.constants';
export type { IDataSourceParams, IPaginationParams, IPaginationState } from './data-source.interfaces';
```

- [ ] **Step 2: Додати path alias до tsconfig.base.json**

Відкрити `tsconfig.base.json` і додати після `@ozon/frontend/data-access-api/controllers/assets`:

```json
"@ozon/frontend/data-access-api/data-source": [
  "./libs/frontend/data-access-api/src/lib/data-source/index.ts"
],
```

- [ ] **Step 3: Перевірити lint**

```bash
pnpm nx lint frontend-data-access-api
```

Expected: `All files pass linting.`

- [ ] **Step 4: Commit**

```bash
git add libs/frontend/data-access-api/src/lib/data-source/index.ts \
        tsconfig.base.json
git commit -m "feat(data-access-api): export data-source public API and add path alias"
```

---

## Task 4: IUserFilter та UsersListDataSourceService (TDD)

**Files:**
- Create: `libs/frontend/features/feature-users/src/lib/pages/user-list-page/interfaces/user-filter.interface.ts`
- Create: `libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.spec.ts`
- Create: `libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.ts`

- [ ] **Step 1: Створити IUserFilter**

```typescript
// libs/frontend/features/feature-users/src/lib/pages/user-list-page/interfaces/user-filter.interface.ts
export interface IUserFilter {
  name?: string;
  sex?: 'male' | 'female';
  isActive?: boolean;
}
```

- [ ] **Step 2: Написати failing тест**

```typescript
// libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersApiService } from '@ozon/frontend/data-access-api/controllers/users';
import { IDataSourceParams } from '@ozon/frontend/data-access-api/data-source';
import { IUsersPageDto } from '@ozon/shared/model-dtos';
import { UsersListDataSourceService } from './users-list-data-source.service';
import { IUserFilter } from '../interfaces/user-filter.interface';

describe('UsersListDataSourceService', () => {
  let service: UsersListDataSourceService;
  let usersApiSpy: jest.Mocked<Pick<UsersApiService, 'getUsers'>>;

  const mockResponse: IUsersPageDto = {
    data: [{ id: '1', name: 'John', email: 'john@example.com', createdAt: '2024-01-01', balanceInRat: '100' }],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    usersApiSpy = { getUsers: jest.fn().mockReturnValue(of(mockResponse)) };

    TestBed.configureTestingModule({
      providers: [
        UsersListDataSourceService,
        { provide: UsersApiService, useValue: usersApiSpy },
      ],
    });

    service = TestBed.inject(UsersListDataSourceService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('getDataSource() should call usersApiService.getUsers with merged filters and pagination', () => {
    const params: IDataSourceParams<IUserFilter> = {
      filters: { name: 'John', isActive: true },
      pagination: { page: 2, limit: 20 },
    };

    service.getDataSource(params).subscribe();

    expect(usersApiSpy.getUsers).toHaveBeenCalledWith({
      name: 'John',
      isActive: true,
      page: 2,
      limit: 20,
    });
  });

  it('getDataSource() should pass only pagination when filters are empty', () => {
    const params: IDataSourceParams<IUserFilter> = {
      filters: {},
      pagination: { page: 1, limit: 10 },
    };

    service.getDataSource(params).subscribe();

    expect(usersApiSpy.getUsers).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('update() should populate data$ with users from API', fakeAsync(() => {
    service.update();
    tick();

    expect(service.data$.value).toEqual(mockResponse.data);
    expect(service.pagination$.value.total).toBe(1);
  }));
});
```

- [ ] **Step 3: Запустити тест — переконатись що FAIL**

```bash
pnpm nx test frontend-feature-users --testFile=src/lib/pages/user-list-page/services/users-list-data-source.service.spec.ts
```

Expected: `Cannot find module './users-list-data-source.service'`

- [ ] **Step 4: Реалізувати UsersListDataSourceService**

```typescript
// libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.ts
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersApiService } from '@ozon/frontend/data-access-api/controllers/users';
import { ADataSourceService, IDataSourceParams } from '@ozon/frontend/data-access-api/data-source';
import { IUserDto, IUsersPageDto } from '@ozon/shared/model-dtos';
import { IUserFilter } from '../interfaces/user-filter.interface';

@Injectable()
export class UsersListDataSourceService extends ADataSourceService<IUserFilter, IUserDto> {
  private readonly usersApi = inject(UsersApiService);

  protected filters: IUserFilter = {};

  public getDataSource(params: IDataSourceParams<IUserFilter>): Observable<IUsersPageDto> {
    return this.usersApi.getUsers({ ...params.filters, ...params.pagination });
  }
}
```

- [ ] **Step 5: Запустити тести — переконатись що PASS**

```bash
pnpm nx test frontend-feature-users --testFile=src/lib/pages/user-list-page/services/users-list-data-source.service.spec.ts
```

Expected: `Tests: 4 passed, 4 total`

- [ ] **Step 6: Commit**

```bash
git add libs/frontend/features/feature-users/src/lib/pages/user-list-page/interfaces/user-filter.interface.ts \
        libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.ts \
        libs/frontend/features/feature-users/src/lib/pages/user-list-page/services/users-list-data-source.service.spec.ts
git commit -m "feat(feature-users): add UsersListDataSourceService"
```

---

## Task 5: Оновити UserListPageComponent

**Files:**
- Modify: `libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.ts`
- Modify: `libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.html`
- Modify: `libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.spec.ts`

- [ ] **Step 1: Оновити spec компонента**

Замінити весь вміст `user-list-page.component.spec.ts`:

```typescript
// libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_PAGINATION, IPaginationState } from '@ozon/frontend/data-access-api/data-source';
import { IUserDto } from '@ozon/shared/model-dtos';
import { UserListPageComponent } from './user-list-page.component';
import { UsersListDataSourceService } from './services/users-list-data-source.service';

describe('UserListPageComponent', () => {
  let component: UserListPageComponent;
  let fixture: ComponentFixture<UserListPageComponent>;

  const mockUsers: IUserDto[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: '2024-01-01', balanceInRat: '100' },
  ];

  const dataSourceMock = {
    data$: new BehaviorSubject<IUserDto[]>([]),
    isLoading$: new BehaviorSubject<boolean>(false),
    pagination$: new BehaviorSubject<IPaginationState>(DEFAULT_PAGINATION),
    update: jest.fn(),
    updateFilter: jest.fn(),
    resetFilter: jest.fn(),
    setPagination: jest.fn(),
  };

  beforeEach(async () => {
    dataSourceMock.update.mockClear();

    await TestBed.configureTestingModule({
      imports: [UserListPageComponent],
      providers: [{ provide: UsersListDataSourceService, useValue: dataSourceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dataSource.update() on init', () => {
    expect(dataSourceMock.update).toHaveBeenCalledTimes(1);
  });

  it('should render users from dataSource.data$', async () => {
    dataSourceMock.data$.next(mockUsers);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Alice');
  });
});
```

- [ ] **Step 2: Запустити spec — переконатись що FAIL**

```bash
pnpm nx test frontend-feature-users --testFile=src/lib/pages/user-list-page/user-list-page.component.spec.ts
```

Expected: fail (компонент ще не оновлено, mock не застосовується)

- [ ] **Step 3: Оновити компонент**

Замінити весь вміст `user-list-page.component.ts`:

```typescript
// libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DEFAULT_PAGINATION } from '@ozon/frontend/data-access-api/data-source';
import { UsersListDataSourceService } from './services/users-list-data-source.service';

@Component({
  selector: 'feature-users-list-page',
  imports: [],
  templateUrl: './user-list-page.component.html',
  styleUrl: './user-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersListDataSourceService],
})
export class UserListPageComponent {
  protected readonly dataSource = inject(UsersListDataSourceService);

  protected readonly users = toSignal(this.dataSource.data$, { initialValue: [] });
  protected readonly isLoading = toSignal(this.dataSource.isLoading$, { initialValue: false });
  protected readonly pagination = toSignal(this.dataSource.pagination$, { initialValue: DEFAULT_PAGINATION });

  constructor() {
    this.dataSource.update();
  }
}
```

- [ ] **Step 4: Оновити шаблон**

Замінити вміст `user-list-page.component.html`:

```html
<p>FeatureUsers works!</p>

@for (user of users(); track user.id) {
  <p>{{ user.name }}</p>
}
```

- [ ] **Step 5: Запустити тести компонента — PASS**

```bash
pnpm nx test frontend-feature-users --testFile=src/lib/pages/user-list-page/user-list-page.component.spec.ts
```

Expected: `Tests: 3 passed, 3 total`

- [ ] **Step 6: Запустити всі тести проекту**

```bash
pnpm nx run-many --target=test --projects=frontend-data-access-api,frontend-feature-users
```

Expected: всі тести проходять.

- [ ] **Step 7: Запустити lint**

```bash
pnpm nx run-many --target=lint --projects=frontend-data-access-api,frontend-feature-users
```

Expected: `All files pass linting.`

- [ ] **Step 8: Commit**

```bash
git add libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.ts \
        libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.html \
        libs/frontend/features/feature-users/src/lib/pages/user-list-page/user-list-page.component.spec.ts
git commit -m "feat(feature-users): replace direct API call with UsersListDataSourceService"
```
