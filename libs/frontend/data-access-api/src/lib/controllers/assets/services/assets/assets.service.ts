import { Injectable, OnDestroy } from '@angular/core';
import {
  Observable,
  Subject,
  defer,
  finalize,
  map,
  share,
  takeUntil,
  timer,
} from 'rxjs';
import { AssetStringMapper } from '../../mappers/asset-string.mapper';
import { IAsset } from '../../interfaces/asset.interface';

const IDLE_TIMEOUT_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class AssetsApiService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly stream$ = defer(() => {
    const worker = new Worker(
      new URL('../../workers/assets/asset-worker', import.meta.url),
      { type: 'module' },
    );

    return new Observable<string[]>((subscriber) => {
      const onMessage = (event: MessageEvent) => subscriber.next(event.data);
      const onError = (event: ErrorEvent) => subscriber.error(event);

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      return () => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
      };
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => worker.terminate()),
    );
  }).pipe(share({ resetOnRefCountZero: () => timer(IDLE_TIMEOUT_MS) }));

  public getAssetsStream(): Observable<IAsset[]> {
    return this.stream$.pipe(
      map((data) => data.map((item) => AssetStringMapper.toDecimal(item))),
    );
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
