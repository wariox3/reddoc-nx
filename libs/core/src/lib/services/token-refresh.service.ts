import { Injectable, signal } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  private readonly _refreshing = signal(false);
  private readonly refreshResult$ = new Subject<boolean>();

  readonly isRefreshing = this._refreshing.asReadonly();

  get refreshing(): boolean {
    return this._refreshing();
  }

  startRefresh(): void {
    this._refreshing.set(true);
  }

  completeRefresh(): void {
    this._refreshing.set(false);
    this.refreshResult$.next(true);
  }

  failRefresh(): void {
    this._refreshing.set(false);
    this.refreshResult$.next(false);
  }

  waitForRefresh(): Observable<boolean> {
    return this.refreshResult$.pipe(take(1));
  }

  reset(): void {
    this._refreshing.set(false);
  }
}
