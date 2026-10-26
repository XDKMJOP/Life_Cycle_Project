import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TH } from '../../core/i18n/th';

export interface NowNextCardData {
  title: string;
  timeRange: string;
  remainingText?: string;
  nextText?: string;
  progressPercent?: number;
  isSpecialMessage?: boolean;
  specialMessageText?: string;
}

@Component({
  selector: 'app-today-hero-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="today-hero-wrapper">
      <!-- Day Badge & Status Chip -->
      <div class="day-header-row">
        <span class="day-number-text">
          วันที่ {{ dayNo }} จาก 30 วัน
        </span>
        <span
          class="status-chip"
          [class.rest]="isRest"
          [class.completed]="isCompleted"
        >
          @if (isCompleted) {
            {{ th.today.statusCompleted }}
          } @else if (isRest) {
            {{ th.today.statusRest }}
          } @else {
            {{ th.today.statusNotStarted }}
          }
        </span>
      </div>

      <!-- Day Focus Title -->
      <h2 class="day-focus-title">{{ focus || 'กิจกรรมดูแลสุขภาพประจำวัน' }}</h2>

      <!-- Card ตอนนี้ / ถัดไป (แสดงเฉพาะวันที่เป็นวันปัจจุบัน) -->
      @if (isCurrentCalendarDay && nowNextData) {
        <div class="now-next-card">
          @if (nowNextData.isSpecialMessage) {
            <div class="special-msg-row">
              <span class="pulse-dot"></span>
              <span class="special-msg-text">{{ nowNextData.specialMessageText }}</span>
            </div>
          } @else {
            <div class="now-next-main-row">
              <div class="now-col">
                <span class="now-tag">{{ th.today.nowLabel }}</span>
                <span class="now-title">{{ nowNextData.title }}</span>
              </div>
              <span class="now-time">{{ nowNextData.timeRange }}</span>
            </div>

            @if (nowNextData.remainingText) {
              <div class="now-progress-row">
                <span class="now-remaining">{{ nowNextData.remainingText }}</span>
                <div class="thin-progress-track">
                  <div
                    class="thin-progress-bar"
                    [style.width.%]="nowNextData.progressPercent || 0"
                  ></div>
                </div>
              </div>
            }

            @if (nowNextData.nextText) {
              <div class="next-preview-row">
                <span class="next-tag">{{ th.today.nextLabel }}</span>
                <span class="next-desc">{{ nowNextData.nextText }}</span>
              </div>
            }
          }
        </div>
      }

      <!-- สรุปวัน 3 ตัวเลขในแถวเดียว (kcal, protein, workout min) -->
      <div class="day-metrics-row">
        <div class="metric-box">
          <div class="metric-num">
            {{ actualKcal }} <span class="metric-sub">/ {{ targetKcal }}</span>
          </div>
          <span class="metric-label">{{ th.today.caloriesUnit }}</span>
          <div class="metric-bar-track">
            <div
              class="metric-bar-fill"
              [style.width.%]="Math.min(100, targetKcal > 0 ? (actualKcal / targetKcal) * 100 : 0)"
            ></div>
          </div>
        </div>

        <div class="metric-box">
          <div class="metric-num">{{ proteinG }} <span class="metric-unit">{{ th.today.proteinUnit }}</span></div>
          <span class="metric-label">โปรตีน</span>
        </div>

        <div class="metric-box">
          <div class="metric-num">{{ workoutMinutes }} <span class="metric-unit">{{ th.today.minutesUnit }}</span></div>
          <span class="metric-label">ออกกำลังกาย</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .today-hero-wrapper {
      margin-bottom: 16px;
    }

    .day-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .day-number-text {
      font-size: 0.82rem;
      color: var(--sage);
      font-weight: 600;
    }

    .status-chip {
      font-size: 0.72rem;
      padding: 3px 10px;
      border-radius: var(--radius-pill);
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-muted);
      border: 1px solid var(--glass-border);

      &.rest {
        color: #7dd3fc;
        border-color: rgba(56, 189, 248, 0.4);
      }

      &.completed {
        background: #14532d;
        color: #ffffff;
        border-color: #22c55e;
        font-weight: 700;
      }
    }

    .day-focus-title {
      font-family: var(--font-display);
      font-size: 1.38rem;
      line-height: 1.3;
      font-weight: 700;
      color: var(--sage-strong);
      margin: 4px 0 14px;
    }

    .now-next-card {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--sage-strong);
      border-radius: var(--radius-control);
      padding: 12px 14px;
      margin-bottom: 16px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.4);
    }

    .now-next-main-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .now-col {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .now-tag {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--on-sage);
      background: var(--sage-strong);
      padding: 2px 7px;
      border-radius: var(--radius-pill);
    }

    .now-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text);
    }

    .now-time {
      font-size: 0.8rem;
      color: var(--sage);
      font-family: monospace;
    }

    .now-progress-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .now-remaining {
      font-size: 0.72rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .thin-progress-track {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }

    .thin-progress-bar {
      height: 100%;
      background: #22c55e;
      transition: width 0.4s ease;
    }

    .next-preview-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 6px;
    }

    .next-tag {
      color: var(--sage);
      font-weight: 600;
    }

    .special-msg-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--sage-strong);
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }

    .day-metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 12px;
      background: rgba(0, 0, 0, 0.22);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-control);
    }

    .metric-box {
      text-align: center;
    }

    .metric-num {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sage-strong);
      line-height: 1.2;
    }

    .metric-sub, .metric-unit {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: normal;
    }

    .metric-label {
      display: block;
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .metric-bar-track {
      width: 80%;
      margin: 4px auto 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }

    .metric-bar-fill {
      height: 100%;
      background: var(--sage-strong);
    }
  `],
})
export class TodayHeroCardComponent {
  @Input() dayNo = 1;
  @Input() focus = '';
  @Input() isCompleted = false;
  @Input() isRest = false;
  @Input() isCurrentCalendarDay = true;
  @Input() targetKcal = 1400;
  @Input() actualKcal = 1340;
  @Input() proteinG = 75;
  @Input() workoutMinutes = 45;
  @Input() nowNextData: NowNextCardData | null = null;

  readonly th = TH;
  readonly Math = Math;
}
