import { Injectable, signal, OnDestroy } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { timeToMinutes, minutesToTime } from '../../features/today/timeline.util';

@Injectable({
  providedIn: 'root',
})
export class ClockService implements OnDestroy {
  readonly nowMinutes = signal<number>(this.getInitialMinutes());
  readonly nowTimeStr = signal<string>(minutesToTime(this.nowMinutes()));
  readonly isDemoTime = signal<boolean>(false);

  private timerSub?: Subscription;
  private readonly visibilityHandler = () => this.handleVisibilityChange();

  constructor() {
    this.checkDemoParam();
    this.startClock();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  ngOnDestroy(): void {
    this.stopClock();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  private checkDemoParam(): void {
    if (environment.demoClock && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const demoNow = urlParams.get('now');
      if (demoNow && /^\d{1,2}:\d{2}$/.test(demoNow)) {
        const mins = timeToMinutes(demoNow);
        this.nowMinutes.set(mins);
        this.nowTimeStr.set(demoNow);
        this.isDemoTime.set(true);
      }
    }
  }

  private startClock(): void {
    if (this.isDemoTime()) return; // Fixed to simulated time

    this.updateCurrentTime();
    this.timerSub = timer(0, 30_000).subscribe(() => {
      this.updateCurrentTime();
    });
  }

  private stopClock(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = undefined;
  }

  private handleVisibilityChange(): void {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      this.stopClock();
    } else {
      if (!this.isDemoTime()) {
        this.updateCurrentTime();
        this.startClock();
      }
    }
  }

  private updateCurrentTime(): void {
    if (this.isDemoTime()) return;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    this.nowMinutes.set(mins);
    this.nowTimeStr.set(minutesToTime(mins));
  }

  private getInitialMinutes(): number {
    if (environment.demoClock && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const demoNow = urlParams.get('now');
      if (demoNow && /^\d{1,2}:\d{2}$/.test(demoNow)) {
        return timeToMinutes(demoNow);
      }
    }
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
}
