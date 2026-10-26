import { Component, Input, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineRow } from './timeline.util';

@Component({
  selector: 'app-today-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container">
      @for (row of rows; track row.id; let idx = $index) {
        <div
          class="timeline-row-item"
          [id]="'timeline-row-' + idx"
          [class.is-wake-bed]="row.kind === 'wake' || row.kind === 'bed'"
          [class.is-free]="row.kind === 'free'"
          [class.is-activity]="row.kind === 'activity'"
          [class.is-past]="row.status === 'past'"
          [class.is-current]="row.status === 'current'"
          [class.is-next]="idx === nextIndex"
          [attr.aria-current]="row.status === 'current' ? 'time' : null"
        >
          <!-- Left Axis: Node Point & Connector Line -->
          <div class="axis-col">
            <div class="node-point" [class.checked]="row.status === 'past'">
              @if (row.status === 'past') {
                <span class="check-symbol">✓</span>
              }
            </div>
            @if (idx < rows.length - 1) {
              <div class="connector-line" [class.passed]="row.status === 'past'"></div>
            }
          </div>

          <!-- Content Row -->
          <div class="content-col">
            @if (row.kind === 'wake' || row.kind === 'bed') {
              <div class="wake-bed-row">
                <span class="wake-bed-time">{{ row.start }}</span>
                <span class="wake-bed-label">{{ row.label }}</span>
              </div>
            } @else if (row.kind === 'free') {
              <div class="free-gap-row">
                <span class="free-text">{{ row.label }}</span>
                @if (idlePointer && idlePointer.afterIndex === idx) {
                  <span class="idle-pointer-badge">ตอนนี้ {{ idlePointer.timeStr }}</span>
                }
              </div>
            } @else {
              <!-- Activity Row (Meal / Workout) -->
              <div class="activity-card" [class.current-active]="row.status === 'current'">
                <div class="activity-top-line">
                  <div class="time-and-title">
                    <span class="time-range">{{ row.start }} - {{ row.end }}</span>
                    <span class="activity-title">{{ row.label }}</span>
                  </div>

                  @if (row.status === 'current') {
                    <span class="now-badge">ตอนนี้</span>
                  }
                </div>

                @if (row.subLabel) {
                  <div class="activity-subline">{{ row.subLabel }}</div>
                }

                @if (row.status === 'current' && row.remainingMinutes !== undefined) {
                  <div class="current-status-row">
                    <span class="remaining-text">เหลืออีก {{ row.remainingMinutes }} นาที</span>
                    <div class="current-bar-track">
                      <div class="current-bar-fill" [style.width.%]="row.progressPercent || 0"></div>
                    </div>
                  </div>
                }

                @if (idx === nextIndex && row.status !== 'current') {
                  <div class="next-hint-text">ถัดไป</div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-container {
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 4px 0 16px;
    }

    .timeline-row-item {
      display: flex;
      position: relative;
      min-height: 40px;
    }

    /* Left Axis */
    .axis-col {
      width: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .node-point {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--bg-deep);
      border: 2px solid var(--sage);
      margin-top: 14px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s ease;

      &.checked {
        background: #14532d;
        border-color: #22c55e;
      }
    }

    .check-symbol {
      font-size: 8px;
      color: #ffffff;
      font-weight: bold;
      line-height: 1;
    }

    .connector-line {
      width: 2px;
      flex: 1;
      background: rgba(255, 255, 255, 0.08);
      margin: 2px 0;

      &.passed {
        background: rgba(34, 197, 94, 0.4);
      }
    }

    /* Content Column */
    .content-col {
      flex: 1;
      padding: 6px 0 10px 10px;
    }

    /* Wake & Bed Rows */
    .wake-bed-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      font-size: 0.8rem;
      color: var(--text-muted);
      padding: 6px 0;
    }

    .wake-bed-time {
      font-family: monospace;
      font-weight: 600;
      color: var(--sage);
    }

    /* Free Gap Row */
    .free-gap-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px;
      font-size: 0.74rem;
      color: rgba(234, 241, 228, 0.45);
      border-left: 1px dashed rgba(255, 255, 255, 0.15);
      margin: 4px 0 4px 6px;
    }

    .idle-pointer-badge {
      font-size: 0.68rem;
      background: rgba(168, 195, 160, 0.2);
      color: var(--sage-strong);
      padding: 1px 7px;
      border-radius: var(--radius-pill);
      font-weight: 600;
    }

    /* Activity Card */
    .activity-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-control);
      padding: 10px 14px;
      margin-bottom: 4px;
      transition: all 0.4s ease;

      &.current-active {
        border-color: var(--sage-strong);
        background: rgba(20, 50, 35, 0.5);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      }
    }

    .activity-top-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .time-and-title {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }

    .time-range {
      font-family: monospace;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--sage-strong);
    }

    .activity-title {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--text);
    }

    .now-badge {
      font-size: 0.68rem;
      font-weight: 700;
      background: var(--sage-strong);
      color: var(--on-sage);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
    }

    .activity-subline {
      font-size: 0.76rem;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .current-status-row {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .remaining-text {
      font-size: 0.72rem;
      color: var(--sage);
      white-space: nowrap;
    }

    .current-bar-track {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 999px;
      overflow: hidden;
    }

    .current-bar-fill {
      height: 100%;
      background: #22c55e;
      transition: width 0.4s ease;
    }

    .next-hint-text {
      font-size: 0.72rem;
      color: var(--sage);
      margin-top: 4px;
      font-weight: 500;
    }

    /* Past State (จางลง 50%) */
    .timeline-row-item.is-past .activity-card {
      opacity: 0.5;
    }
  `],
})
export class TodayTimelineComponent implements AfterViewInit, OnChanges {
  @Input() rows: TimelineRow[] = [];
  @Input() currentIndex = -1;
  @Input() nextIndex = -1;
  @Input() idlePointer: { timeStr: string; timeMinutes: number; afterIndex: number } | null = null;

  constructor(private readonly el: ElementRef) {}

  ngAfterViewInit(): void {
    this.scrollToCurrentRow();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentIndex']) {
      this.scrollToCurrentRow();
    }
  }

  private scrollToCurrentRow(): void {
    if (this.currentIndex >= 0 && typeof window !== 'undefined') {
      const target = this.el.nativeElement.querySelector(`#timeline-row-${this.currentIndex}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
}
