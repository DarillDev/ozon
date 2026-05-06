import { signal } from '@angular/core';
import { debounce, form } from '@angular/forms/signals';
import { ISearchUserForm } from '../interfaces/search-user-form.interface';

export function createSearchUserForm(initialValue?: ISearchUserForm) {
  const model = signal<ISearchUserForm>(initialValue ?? { query: '' });

  return form(model, (schema) => {
    debounce(schema.query, 200);
  });
}
