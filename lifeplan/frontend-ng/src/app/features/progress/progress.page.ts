import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline,
  bedOutline,
  flameOutline,
  refreshOutline,
  ribbonOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/api/api.service';
import { CurrentPlanResponse, PlanDaySummary } from '../../core/models';
import { TH } from '../../core/i18n/th';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSkeletonText],
  template: `
    <ion-content [fullscreen]="true">
      <div class="progress-page-wrapper">
        <header class="progress-header">
          <h1 class="progress-title">{{ th.progress.title }}</h1>
          <p class="progress-desc">ติดตามความสม่ำเสมอและสถิติการปฏิบัติจริงตลอด 30 วัน</p>
        </header>

        <!-- Loading Skeleton -->
        @if (isLoading()) {
          <div class="sk-wrapper">
            <ion-skeleton-text [animated]="true" class="sk-card"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-chart"></ion-skeleton-text>
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
        } @else if (!hasPlan()) {
          <!-- Empty State -->
          <div class="empty-plan-box">
            <h3>ยังไม่มีข้อมูลความคืบหน้า</h3>
            <p>กรุณาสร้างแผน 30 วันเพื่อเริ่มต้นบันทึกความคืบหน้า</p>
            <button type="button" class="btn-primary" (click)="goToPlan()">
              ไปที่หน้าแผน 30 วัน
            </button>
          </div>
        } @else {
          <!-- Clean Summary Cards Row -->
          <div class="summary-cards-grid">
            <div class="stat-card">
              <div class="stat-icon-wrap">
                <ion-icon name="ribbonOutline"></ion-icon>
              </div>
              <div class="stat-data">
                <span class="stat-label">ทำเสร็จ</span>
                <h3 class="stat-value">{{ completedCount() }} <small>/ 30 วัน</small></h3>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap streak">
                <ion-icon name="flame-outline"></ion-icon>
              </div>
              <div class="stat-data">
                <span class="stat-label">ต่อเนื่อง (Streak)</span>
                <h3 class="stat-value">{{ streakCount() }} <small>วัน</small></h3>
              </div>
            </div>
          </div>

          <!-- Overall Progress Bar Card -->
          <div class="progress-bar-card">
            <div class="bar-header">
              <span class="bar-label">ความสำเร็จโดยรวม</span>
              <span class="bar-percent">{{ percentCompleted() }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="percentCompleted()"></div>
            </div>
          </div>

          <!-- 30-Bar Chart Section -->
          <div class="chart-section-card">
            <div class="chart-header">
              <h3 class="chart-title">แผนภูมิความต่อเนื่อง 30 วัน</h3>
              <span class="chart-tip">แตะแต่ละแท่งเพื่อดูรายละเอียด</span>
            </div>

            <!-- Legend Row -->
            <div class="legend-row">
              <div class="legend-item">
                <span class="legend-box done">
                  <ion-icon name="checkmark-outline"></ion-icon>
                </span>
                <span>ทำเสร็จ</span>
              </div>
              <div class="legend-item">
                <span class="legend-box rest">
                  <ion-icon name="bed-outline"></ion-icon>
                </span>
                <span>วันพัก</span>
              </div>
              <div class="legend-item">
                <span class="legend-box pending"></span>
                <span>ยังไม่ทำ</span>
              </div>
            </div>

            <!-- 30-Bar Visual Chart -->
            <div class="bars-container">
              @for (day of days(); track day.dayNo) {
                <button
                  type="button"
                  class="bar-col-btn"
                  [class.is-done]="day.completedAt"
                  [class.is-rest]="day.isRest"
                  [class.is-pending]="!day.completedAt && !day.isRest"
                  (click)="onSelectDay(day.dayNo)"
                  [attr.aria-label]="'วันที่ ' + day.dayNo"
                >
                  <div class="bar-pillar-wrap">
                    <div
                      class="bar-pillar"
                      [style.height.%]="getBarHeight(day)"
                    >
                      @if (day.completedAt) {
                        <ion-icon name="checkmark-outline" class="bar-icon"></ion-icon>
                      } @else if (day.isRest) {
                        <ion-icon name="bed-outline" class="bar-icon"></ion-icon>
                      }
                    </div>
                  </div>
                  <span class="bar-day-no">{{ day.dayNo }}</span>
                </button>
              }
            </div>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .progress-page-wrapper {
      max-width: 520px;
      margin: 0 auto;
      padding: 16px 16px 80px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .progress-header {
      .progress-title {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--sage-strong);
        margin: 0 0 4px;
      }

      .progress-desc {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
        line-height: 1.45;
      }
    }

    .summary-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .stat-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;

      .stat-icon-wrap {
        width: 42px;
        height: 42px;
        border-radius: var(--radius-pill);
        background: rgba(168, 195, 160, 0.14);
        color: var(--sage);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        flex-shrink: 0;

        &.streak {
          background: rgba(220, 160, 60, 0.14);
          color: #f6ad55;
        }
      }

      .stat-data {
        .stat-label {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .stat-value {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--sage-strong);

          small {
            font-size: 0.76rem;
            color: var(--text-muted);
            font-weight: 500;
          }
        }
      }
    }

    .progress-bar-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 14px 16px;

      .bar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .bar-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text);
        }

        .bar-percent {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--sage-strong);
        }
      }

      .bar-track {
        height: 8px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 999px;
        overflow: hidden;

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sage), var(--sage-strong));
          border-radius: 999px;
          transition: width 0.35s ease;
        }
      }
    }

    .chart-section-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 16px 14px;

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 12px;

        .chart-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text);
          margin: 0;
        }

        .chart-tip {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      }

      .legend-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);

          .legend-box {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;

            &.done {
              background: var(--completed-bg);
              border: 1px solid var(--completed-border);
              color: var(--completed-text);
            }

            &.rest {
              background: rgba(100, 140, 180, 0.15);
              border: 1px dashed #a0c4e8;
              color: #a0c4e8;
            }

            &.pending {
              background: rgba(255, 255, 255, 0.06);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
          }
        }
      }

      .bars-container {
        display: grid;
        grid-template-columns: repeat(15, 1fr);
        gap: 4px;
        row-gap: 12px;
      }

      .bar-col-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;

        .bar-pillar-wrap {
          width: 100%;
          height: 56px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: rgba(0, 0, 0, 0.25);
          border-radius: 4px;
          padding: 2px;
        }

        .bar-pillar {
          width: 100%;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: height 0.3s ease;

          .bar-icon {
            font-size: 0.65rem;
          }
        }

        &.is-done .bar-pillar {
          background: var(--completed-bg);
          border: 1px solid var(--completed-border);
          color: var(--completed-text);
        }

        &.is-rest .bar-pillar {
          background: rgba(100, 140, 180, 0.18);
          border: 1px dashed #a0c4e8;
          color: #a0c4e8;
        }

        &.is-pending .bar-pillar {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: transparent;
        }

        .bar-day-no {
          font-size: 0.62rem;
          color: var(--text-muted);
          margin-top: 3px;
        }
      }
    }

    .sk-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .sk-card {
        height: 72px;
        border-radius: var(--radius-card);
      }
      .sk-chart {
        height: 180px;
        border-radius: var(--radius-card);
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
export class ProgressPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly th = TH;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly hasPlan = signal(false);
  readonly days = signal<PlanDaySummary[]>([]);

  readonly completedCount = computed(() => {
    return this.days().filter((d) => Boolean(d.completedAt)).length;
  });

  readonly percentCompleted = computed(() => {
    return Math.round((this.completedCount() / 30) * 100);
  });

  readonly streakCount = computed(() => {
    const list = this.days();
    let currentStreak = 0;
    for (const d of list) {
      if (d.completedAt) {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  });

  constructor() {
    addIcons({ checkmarkOutline, bedOutline, flameOutline, refreshOutline, ribbonOutline });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.get<CurrentPlanResponse>('/plan/current').subscribe({
      next: (res) => {
        this.hasPlan.set(res.hasPlan);
        this.days.set(res.days || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.th.common.error);
      },
    });
  }

  getBarHeight(day: PlanDaySummary): number {
    if (day.completedAt) return 100;
    if (day.isRest) return 60;
    return 30;
  }

  onSelectDay(dayNo: number): void {
    this.router.navigate(['/tabs/today', dayNo]);
  }

  goToPlan(): void {
    this.router.navigate(['/tabs/plan']);
  }
}
