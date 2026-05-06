import {
  HttpClient,
  HttpParams,
  httpResource,
  HttpResourceRef,
} from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { IUsersPageDto, IUsersQueryDto } from '@ozon/shared/model-dtos';
import { delay, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/users';

  public getUsers(query: IUsersQueryDto = {}): Observable<IUsersPageDto> {
    const params = this.buildParams(query);

    return this.http.get<IUsersPageDto>(this.url, { params });
  }

  public getUsersResource(
    query: Signal<IUsersQueryDto>,
  ): HttpResourceRef<IUsersPageDto | undefined> {
    return httpResource<IUsersPageDto>(() => ({
      url: this.url,
      params: this.buildParams(query()),
    }));
  }

  private buildParams(query: IUsersQueryDto): HttpParams {
    let params = new HttpParams();

    if (query.name !== undefined) {
      params = params.set('name', query.name);
    }

    if (query.sex !== undefined) {
      params = params.set('sex', query.sex);
    }

    if (query.isActive !== undefined) {
      params = params.set('isActive', String(query.isActive));
    }

    if (query.page !== undefined) {
      params = params.set('page', String(query.page));
    }

    if (query.limit !== undefined) {
      params = params.set('limit', String(query.limit));
    }

    return params;
  }
}
