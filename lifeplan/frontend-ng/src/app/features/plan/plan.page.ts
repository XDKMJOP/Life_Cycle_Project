import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSkeletonText,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline,
  bedOutline,
  barbellOutline,
  refreshOutline,
  addCircleOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/api/api.service';
import { CurrentPlanResponse, PlanDaySummary } from '../../core/models';
import { TH } from '../../core/i18n/th';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSkeletonText],
  template: `
    <ion-content [fullscreen]="true">
      <div class="plan-page-wrapper">
        <!-- Header & Summary -->
        <header class="plan-header">
          <div class="title-row">
            <h1 class="plan-title">{{ th.plan.title }}</h1>
            <span class="progress-pill">
              {{ progressSummaryText() }}
            </span>
          </div>
          <p class="plan-desc">แตะวันที่ต้องการเพื่อดูตารางเวลา ท่าออกกำลังกาย และโภชนาการประจำวัน</p>
        </header>

        <!-- Loading Skeleton -->
        @if (isLoading()) {
          <div class="grid-skeleton">
            @for (i of skeletonItems; track i) {
              <ion-skeleton-text [animated]="true" class="sk-cell"></ion-skeleton-text>
            }
          </div>
        } @else if (errorMessage()) {
          <!-- Error State -->
          <div class="error-container">
            <p class="error-msg">{{ errorMessage() }}</p>
            <button type="button" class="btn-primary" (click)="loadPlan()">
              <ion-icon name="refresh-outline"></ion-icon>
              <span>{{ th.common.retry }}</span>
            </button>
          </div>
        } @else if (!hasPlan() || days().length === 0) {
          <!-- Empty State -->
          <div class="empty-plan-box">
            <h3>ยังไม่มีแผน 30 วัน</h3>
            <p>เริ่มต้นสร้างแผนสุขภาพประจำวันของคุณได้ทันที</p>
            <button type="button" class="btn-primary" [disabled]="isGenerating()" (click)="confirmGeneratePlan()">
              <ion-icon name="add-circle-outline"></ion-icon>
              <span>สร้างแผน 30 วัน</span>
            </button>
          </div>
        } @else {
          <!-- 30-Day Grid -->
          <div class="days-grid">
            @for (day of days(); track day.dayNo) {
              <button
                type="button"
                class="day-cell-btn"
                [class.is-completed]="day.completedAt"
                [class.is-rest]="day.isRest"
                (click)="onSelectDay(day.dayNo)"
              >
                <div class="day-top">
                  <span class="day-number">{{ day.dayNo }}</span>
                  @if (day.completedAt) {
                    <span class="cell-status-icon is-done">
                      <ion-icon name="checkmark-outline"></ion-icon>
                    </span>
                  } @else if (day.isRest) {
                    <span class="cell-tag rest">{{ th.plan.restTag }}</span>
                  } @else {
                    <span class="cell-tag train">{{ th.plan.trainTag }}</span>
                  }
                </div>
                <span class="day-focus-label">{{ day.focus || 'แผนประจำวัน' }}</span>
              </button>
            }
          </div>

          <!-- Regenerate Plan Section -->
          <div class="actions-section">
            <button
              type="button"
              class="btn-regenerate"
              [disabled]="isGenerating()"
              (click)="confirmGeneratePlan()"
            >
              <ion-icon name="refresh-outline"></ion-icon>
              <span>{{ isGenerating() ? 'กำลังประมวลผลแผน...' : th.plan.regenerateBtn }}</span>
            </button>
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .plan-page-wrapper {
      max-width: 520px;
      margin: 0 auto;
      padding: 16px 16px 80px;
    }

    .plan-header {
      margin-bottom: 16px;

      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        .plan-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--sage-strong);
          margin: 0;
        }

        .progress-pill {
          background: rgba(168, 195, 160, 0.14);
          color: var(--sage-strong);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-pill);
          padding: 4px 10px;
          font-size: 0.78rem;
          font-weight: 700;
        }
      }

      .plan-desc {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
        line-height: 1.45;
      }
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }

    .day-cell-btn {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 68px;
      padding: 8px 6px 6px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-control);
      color: var(--text);
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;

      &:active {
        background: rgba(168, 195, 160, 0.1);
      }

      .day-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        .day-number {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text);
        }

        .cell-status-icon.is-done {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-pill);
          background: var(--completed-bg);
          border: 1px solid var(--completed-border);
          color: var(--completed-text);
          font-size: 0.8rem;
        }

        .cell-tag {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 4px;

          &.rest {
            background: rgba(100, 140, 180, 0.15);
            color: #a0c4e8;
          }

          &.train {
            background: rgba(168, 195, 160, 0.15);
            color: var(--sage);
          }
        }
      }

      .day-focus-label {
        font-size: 0.68rem;
        color: var(--text-muted);
        line-height: 1.25;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-top: 4px;
      }

      &.is-completed {
        background: rgba(30, 60, 45, 0.55);
        border-color: var(--completed-border);

        .day-number {
          color: var(--completed-text);
        }
      }

      &.is-rest {
        border-style: dashed;
      }
    }

    .actions-section {
      margin-top: 24px;
      display: flex;
      justify-content: center;

      .btn-regenerate {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        max-width: 320px;
        height: 44px;
        border-radius: var(--radius-pill);
        background: transparent;
        border: 1px solid var(--glass-border);
        color: var(--text-muted);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.2s ease, color 0.2s ease;

        &:hover, &:active {
          border-color: var(--sage);
          color: var(--sage-strong);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .grid-skeleton {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;

      .sk-cell {
        height: 68px;
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
export class PlanPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  readonly th = TH;
  readonly isLoading = signal(true);
  readonly isGenerating = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasPlan = signal(false);
  readonly days = signal<PlanDaySummary[]>([]);
  readonly skeletonItems = Array.from({ length: 30 }, (_, i) => i);

  readonly completedCount = computed(() => {
    return this.days().filter((d) => Boolean(d.completedAt)).length;
  });

  readonly progressSummaryText = computed(() => {
    return this.th.plan.progressSummary.replace('{completed}', String(this.completedCount()));
  });

  constructor() {
    addIcons({ checkmarkOutline, bedOutline, barbellOutline, refreshOutline, addCircleOutline });
  }

  ngOnInit(): void {
    this.loadPlan();
  }

  loadPlan(): void {
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

  onSelectDay(dayNo: number): void {
    this.router.navigate(['/tabs/today', dayNo]);
  }

  async confirmGeneratePlan(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'สร้างแผน 30 วันใหม่',
      message: 'การสร้างแผนใหม่จะเก็บข้อมูลความคืบหน้าเดิมเป็นแผนเก่า และเริ่มต้นแผน 30 วันใหม่ตามโปรไฟล์ปัจจุบันของคุณ ต้องการดำเนินการต่อหรือไม่?',
      buttons: [
        {
          text: this.th.common.cancel,
          role: 'cancel',
        },
        {
          text: 'สร้างแผนใหม่',
          role: 'confirm',
          handler: () => {
            this.generatePlan();
          },
        },
      ],
    });

    await alert.present();
  }

  private generatePlan(): void {
    this.isGenerating.set(true);
    this.api.post<{ ok: boolean; planId: number }>('/plan/generate', {}).subscribe({
      next: () => {
        this.isGenerating.set(false);
        this.loadPlan();
      },
      error: () => {
        this.isGenerating.set(false);
        this.errorMessage.set('ไม่สามารถสร้างแผนใหม่ได้ โปรดลองอีกครั้ง');
      },
    });
  }
}
