import {DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MonoTypeOperatorFunction} from 'rxjs';

export const createDestroyer = (): (<K>() => MonoTypeOperatorFunction<K>) => {
  const destroyRef = inject(DestroyRef);

  return () => takeUntilDestroyed(destroyRef);
};
