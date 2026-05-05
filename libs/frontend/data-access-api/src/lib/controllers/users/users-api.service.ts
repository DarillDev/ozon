import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/users';

  public getUsers(): Observable<string[]> {
    return this.http.get<string[]>(this.url);
  }
}
