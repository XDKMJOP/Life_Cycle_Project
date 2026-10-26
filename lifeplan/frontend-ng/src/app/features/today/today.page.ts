import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonSkeletonText,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  refreshOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api/api.service';
import { ClockService } from '../../core/clock/clock.service';
import { DayDetailResponse, CurrentPlanResponse } from '../../core/models';
import { TH } from '../../core/i18n/th';
import { computeTimelineState, TimelineState } from './timeline.util';
import { TodayHeroCardComponent, NowNextCardData } from './today-hero-card.component';
import { TodayTimelineComponent } from './today-timeline.component';
import { TodayWorkoutComponent } from './today-workout.component';
import { TodayMealsComponent } from './today-meals.component';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonSkeletonText,
    TodayHeroCardComponent,
    TodayTimelineComponent,
    TodayWorkoutComponent,
    TodayMealsComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="today-page-wrapper">
        <!-- Optional Back Header if Navigated to Specific Day -->
        @if (hasRouteDayParam()) {
          <div class="back-nav-bar">
            <button type="button" class="back-nav-btn" (click)="goBack()">
              <ion-icon name="arrow-back-outline"></ion-icon>
              <span>กลับไปแผน 30 วัน</span>
            </button>
          </div>
        }

        <!-- Loading Skeleton -->
        @if (isLoading()) {
          <div class="skeleton-container">
            <ion-skeleton-text [animated]="true" class="sk-hero"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-metrics"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-tabs"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-card"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-card"></ion-skeleton-text>
          </div>
        } @else if (errorMessage()) {
          <!-- Error State -->
          <div class="error-container">
            <p class="error-msg">{{ errorMessage() }}</p>
            <button type="button" class="btn-primary" (click)="loadData()">
              <ion-icon name="refresh-outline"></ion-icon>
              <span>{{ th.common.retry }}</span>
            </button>
          </div>
        } @else if (!dayDetail()) {
          <!-- Empty State -->
          <div class="empty-plan-box">
            <h3>ยังไม่มีแผนสุขภาพที่ใช้งานอยู่</h3>
            <p>กรุณาสร้างแผน 30 วันเพื่อเริ่มต้นตารางชีวิตประจำวันของคุณ</p>
            <button type="button" class="btn-primary" (click)="goToPlan()">
              ไปที่หน้าแผน 30 วัน
            </button>
          </div>
        } @else {
          <!-- Hero Card Section -->
          <app-today-hero-card
            [dayNo]="dayDetail()!.dayNo"
            [focus]="dayDetail()!.content.focus"
            [isCompleted]="isCompleted()"
            [isRest]="dayDetail()!.content.is_rest"
            [isCurrentCalendarDay]="isCurrentCalendarDay()"
            [targetKcal]="targetKcal()"
            [actualKcal]="dayDetail()!.content.total_kcal || 0"
            [proteinG]="dayDetail()!.content.total_protein_g || 0"
            [workoutMinutes]="workoutDuration()"
            [nowNextData]="nowNextData()"
          ></app-today-hero-card>

          <!-- Segment Navigation -->
          <div class="segment-wrap">
            <ion-segment
              [value]="activeSegment()"
              (ionChange)="onSegmentChange($event)"
              class="capsule-segment"
            >
              <ion-segment-button value="timeline">
                <ion-label>{{ th.today.segmentTimeline }}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="workout">
                <ion-label>{{ th.today.segmentWorkout }}</ion-label>
              </ion-segment-button>
              <ion-segment-button value="meals">
                <ion-label>{{ th.today.segmentMeals }}</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>

          <!-- Segment Content -->
          <div class="segment-content-area">
            @if (activeSegment() === 'timeline') {
              <app-today-timeline
                [rows]="timelineState().rows"
                [currentIndex]="timelineState().currentIndex"
                [nextIndex]="timelineState().nextIndex"
                [idlePointer]="timelineState().idlePointer"
              ></app-today-timeline>
            } @else if (activeSegment() === 'workout') {
              <app-today-workout
                [workout]="dayDetail()!.content.workout || []"
                [workoutHome]="dayDetail()!.content.workout_home"
                [workoutGym]="dayDetail()!.content.workout_gym"
                [isRest]="dayDetail()!.content.is_rest"
              ></app-today-workout>
            } @else if (activeSegment() === 'meals') {
              <app-today-meals
                [meals]="dayDetail()!.content.meals || []"
                [totalKcal]="dayDetail()!.content.total_kcal || 0"
                [targetKcal]="targetKcal()"
              ></app-today-meals>
            }
          </div>

          <!-- Bottom Floating Action Button -->
          <div class="bottom-action-bar">
            @if (isFutureDay()) {
              <button type="button" class="complete-btn disabled" disabled>
                {{ th.today.futureDayDisabled }}
              </button>
            } @else {
              <button
                type="button"
                class="complete-btn"
                [class.is-done]="isCompleted()"
                (click)="toggleComplete()"
              >
                @if (isCompleted()) {
                  <ion-icon name="checkmark-circle-outline"></ion-icon>
                  <span>{{ th.today.completedBtn }}</span>
                } @else {
                  <span>{{ th.today.completeBtn }}</span>
                }
              </button>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .today-page-wrapper {
      max-width: 520px;
      margin: 0 auto;
      padding: 16px 16px 100px;
    }

    .back-nav-bar {
      margin-bottom: 12px;

      .back-nav-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: none;
        color: var(--sage);
        font-size: 0.88rem;
        cursor: pointer;
        padding: 4px 0;
      }
    }

    .segment-wrap {
      margin: 16px 0 14px;

      .capsule-segment {
        --background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-pill);
        padding: 3px;

        ion-segment-button {
          --indicator-color: var(--sage-strong);
          --color: var(--text-muted);
          --color-checked: var(--on-sage);
          font-weight: 600;
          font-size: 0.85rem;
          min-height: 38px;
        }
      }
    }

    .segment-content-area {
      min-height: 200px;
    }

    .bottom-action-bar {
      position: fixed;
      bottom: 64px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      padding: 0 16px;
      z-index: 50;
      pointer-events: none;

      .complete-btn {
        pointer-events: auto;
        max-width: 480px;
        width: 100%;
        height: 48px;
        border-radius: var(--radius-pill);
        background: var(--sage-strong);
        color: var(--on-sage);
        font-weight: 700;
        font-size: 0.95rem;
        border: none;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: transform 0.15s ease, background 0.2s ease;

        &:active {
          transform: scale(0.98);
        }

        &.is-done {
          background: rgba(30, 60, 45, 0.92);
          border: 1px solid var(--completed-border);
          color: var(--completed-text);
        }

        &.disabled {
          background: rgba(40, 50, 45, 0.7);
          color: var(--text-muted);
          cursor: not-allowed;
          font-size: 0.82rem;
        }
      }
    }

    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .sk-hero {
        height: 120px;
        border-radius: var(--radius-card);
      }
      .sk-metrics {
        height: 56px;
        border-radius: var(--radius-control);
      }
      .sk-tabs {
        height: 40px;
        border-radius: var(--radius-pill);
      }
      .sk-card {
        height: 70px;
        border-radius: var(--radius-control);
      }
    }

    .error-container, .empty-plan-box {
      text-align: center;
      padding: 40px 16px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      color: var(--text);

      h3 {
        color: var(--sage-strong);
        margin-top: 0;
      }
      p {
        color: var(--text-muted);
        font-size: 0.88rem;
        margin-bottom: 20px;
      }
    }
  `],
})
export class TodayPage implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly clock = inject(ClockService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly toastCtrl = inject(ToastController);

  readonly th = TH;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly dayDetail = signal<DayDetailResponse | null>(null);
  readonly targetKcal = signal(2000);
  readonly activeSegment = signal<'timeline' | 'workout' | 'meals'>('timeline');

  readonly hasRouteDayParam = signal(false);
  readonly calendarDayNo = signal(1);
  private routeSub?: Subscription;

  readonly isCompleted = computed(() => Boolean(this.dayDetail()?.completedAt));
  readonly isCurrentCalendarDay = computed(() => {
    const detail = this.dayDetail();
    if (!detail) return false;
    return detail.dayNo === this.calendarDayNo();
  });
  readonly isFutureDay = computed(() => {
    const detail = this.dayDetail();
    if (!detail) return false;
    return detail.dayNo > this.calendarDayNo();
  });

  readonly workoutDuration = computed(() => {
    const w = this.dayDetail()?.content.workout || [];
    return w.reduce((sum, item) => sum + (item.duration_min || 10), 0);
  });

  readonly timelineState = computed<TimelineState>(() => {
    const content = this.dayDetail()?.content;
    if (!content || !content.schedule) {
      return { rows: [], currentIndex: -1, nextIndex: -1, remainingMinutes: 0, idlePointer: null, dayState: 'active' };
    }
    let effectiveNow = this.clock.nowMinutes();
    if (!this.isCurrentCalendarDay()) {
      effectiveNow = this.isFutureDay() ? -1 : 1440;
    }
    return computeTimelineState(content.schedule, effectiveNow);
  });

  readonly nowNextData = computed<NowNextCardData | null>(() => {
    if (!this.isCurrentCalendarDay()) return null;
    const detail = this.dayDetail();
    if (!detail) return null;
    if (this.isCompleted()) {
      return { title: '', timeRange: '', isSpecialMessage: true, specialMessageText: this.th.today.dayCompletedMsg };
    }
    const state = this.timelineState();
    if (state.dayState === 'before_wake') {
      return { title: '', timeRange: '', isSpecialMessage: true, specialMessageText: this.th.today.beforeWakeMsg };
    }
    if (state.dayState === 'after_bedtime') {
      return { title: '', timeRange: '', isSpecialMessage: true, specialMessageText: this.th.today.afterBedMsg };
    }
    if (state.currentIndex >= 0) {
      const cur = state.rows[state.currentIndex];
      const next = state.nextIndex >= 0 ? state.rows[state.nextIndex] : null;
      return {
        title: cur.label,
        timeRange: `${cur.start} - ${cur.end}`,
        remainingText: state.remainingMinutes ? `เหลืออีก ${state.remainingMinutes} นาที` : undefined,
        nextText: next ? `ถัดไป: ${next.label}` : undefined,
        progressPercent: cur.progressPercent,
      };
    }
    if (state.nextIndex >= 0) {
      const next = state.rows[state.nextIndex];
      return {
        title: this.th.today.freeLabel,
        timeRange: '',
        nextText: `ถัดไป ${next.label} (${next.start})`,
      };
    }
    return null;
  });

  constructor() {
    addIcons({ arrowBackOutline, checkmarkCircleOutline, checkmarkOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const dayParam = params.get('dayNo');
      this.hasRouteDayParam.set(Boolean(dayParam));
      this.loadData(dayParam ? Number(dayParam) : undefined);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  loadData(targetDay?: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.get<CurrentPlanResponse>('/plan/current').subscribe({
      next: (plan) => {
        if (!plan.hasPlan || !plan.startDate) {
          this.isLoading.set(false);
          this.dayDetail.set(null);
          return;
        }
        const start = new Date(plan.startDate).getTime();
        const now = new Date().setHours(0, 0, 0, 0);
        const dayDiff = Math.max(1, Math.min(30, Math.floor((now - start) / 86400000) + 1));
        this.calendarDayNo.set(dayDiff);

        const chosenDay = targetDay ?? dayDiff;
        this.fetchDay(chosenDay);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.th.common.error);
      },
    });
  }

  private fetchDay(dayNo: number): void {
    this.api.get<DayDetailResponse>(`/plan/days/${dayNo}`).subscribe({
      next: (detail) => {
        this.dayDetail.set(detail);
        if (detail.content.total_kcal) {
          this.targetKcal.set(detail.content.total_kcal);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.th.common.error);
      },
    });
  }

  onSegmentChange(e: CustomEvent): void {
    this.activeSegment.set(e.detail.value as 'timeline' | 'workout' | 'meals');
  }

  toggleComplete(): void {
    const detail = this.dayDetail();
    if (!detail || this.isFutureDay()) return;

    this.api.patch<{ ok: boolean; completedAt: string | null }>(`/plan/days/${detail.dayNo}/complete`).subscribe({
      next: async (res) => {
        this.dayDetail.update((prev) => (prev ? { ...prev, completedAt: res.completedAt } : null));
        if (!res.completedAt) {
          const toast = await this.toastCtrl.create({
            message: this.th.today.canceledToast,
            duration: 1800,
            position: 'bottom',
          });
          await toast.present();
        }
      },
      error: () => {
        this.errorMessage.set('ไม่สามารถบันทึกสถานะได้ โปรดลองอีกครั้ง');
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToPlan(): void {
    this.router.navigate(['/tabs/plan']);
  }
}
