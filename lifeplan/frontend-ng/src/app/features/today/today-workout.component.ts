import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, bedOutline } from 'ionicons/icons';
import { ExerciseItem } from '../../core/models';
import { TH } from '../../core/i18n/th';
import { ExerciseVisualComponent } from '../../shared/exercise-visual.component';
import { ExerciseModalComponent } from './exercise-modal.component';

@Component({
  selector: 'app-today-workout',
  standalone: true,
  imports: [
    CommonModule,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    ExerciseVisualComponent,
    ExerciseModalComponent,
  ],
  template: `
    <div class="workout-section">
      <!-- Location Switcher (Single switcher, no duplicate labels) -->
      <div class="location-toggle-card">
        <ion-segment
          [value]="location()"
          (ionChange)="onLocationChange($event)"
          class="location-segment"
        >
          <ion-segment-button value="home">
            <ion-label>{{ th.today.locationHome }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="gym">
            <ion-label>{{ th.today.locationGym }}</ion-label>
          </ion-segment-button>
        </ion-segment>
        <p class="location-desc">
          {{ location() === 'home' ? th.today.locationHomeDesc : th.today.locationGymDesc }}
        </p>
      </div>

      <!-- Rest Day State -->
      @if (isRest) {
        <div class="rest-card">
          <div class="rest-icon-box">
            <ion-icon name="bed-outline"></ion-icon>
          </div>
          <div class="rest-info">
            <h4 class="rest-title">{{ th.today.statusRest }}</h4>
            <p class="rest-sub">วันพักฟื้นกล้ามเนื้อ แนะนำเดินเบาๆ หรือยืดเหยียดร่างกายเพื่อการฟื้นตัวที่ดี</p>
          </div>
        </div>
      } @else {
        <!-- Exercise List -->
        <div class="exercise-list">
          @for (ex of activeExercises(); track ex.exercise_id + $index) {
            <button
              type="button"
              class="exercise-item-btn"
              (click)="openExercise(ex)"
            >
              <!-- 56px Visual Thumbnail -->
              <div class="thumb-box">
                <app-exercise-visual
                  [exerciseId]="ex.exercise_id"
                  [frame]="0"
                ></app-exercise-visual>
              </div>

              <!-- Exercise Information -->
              <div class="exercise-meta">
                <h4 class="exercise-name">{{ ex.name_th || ex.exercise_id }}</h4>
                <p class="exercise-sub">
                  @if (ex.duration_min) {
                    {{ formatDuration(ex.duration_min) }}
                  } @else {
                    {{ formatSetsReps(ex.sets, ex.reps, ex.rest_sec) }}
                  }
                </p>
              </div>

              <ion-icon name="chevron-forward-outline" class="item-arrow"></ion-icon>
            </button>
          } @empty {
            <div class="empty-state">
              <p>ไม่มีรายการออกกำลังกายสำหรับวันนี้</p>
            </div>
          }
        </div>
      }

      <!-- Exercise Sheet Modal -->
      <app-exercise-modal
        [isOpen]="isModalOpen()"
        [exercise]="selectedExercise()"
        (closed)="isModalOpen.set(false)"
      ></app-exercise-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .workout-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .location-toggle-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 12px 14px 10px;

      .location-segment {
        --background: rgba(0, 0, 0, 0.4);
        border-radius: var(--radius-pill);
        padding: 3px;

        ion-segment-button {
          --indicator-color: var(--sage-strong);
          --color: var(--text-muted);
          --color-checked: var(--on-sage);
          font-weight: 600;
          font-size: 0.85rem;
          min-height: 36px;
        }
      }

      .location-desc {
        margin: 8px 0 2px;
        font-size: 0.8rem;
        color: var(--text-muted);
        text-align: center;
      }
    }

    .rest-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 20px 16px;
      display: flex;
      align-items: center;
      gap: 16px;

      .rest-icon-box {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-pill);
        background: rgba(168, 195, 160, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--sage);
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .rest-info {
        .rest-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--sage-strong);
          margin: 0 0 4px;
        }

        .rest-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin: 0;
        }
      }
    }

    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .exercise-item-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 56px;
      padding: 10px 14px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-control);
      color: var(--text);
      text-align: left;
      cursor: pointer;
      transition: background 0.18s ease, border-color 0.18s ease;

      &:active {
        background: rgba(168, 195, 160, 0.1);
        border-color: var(--glass-border-strong);
      }

      .thumb-box {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid var(--glass-border);
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
      }

      .exercise-meta {
        flex: 1;
        min-width: 0;

        .exercise-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .exercise-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .item-arrow {
        color: var(--text-muted);
        font-size: 1.1rem;
        flex-shrink: 0;
      }
    }

    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.88rem;
    }
  `],
})
export class TodayWorkoutComponent {
  @Input() workout: ExerciseItem[] = [];
  @Input() workoutHome?: ExerciseItem[];
  @Input() workoutGym?: ExerciseItem[];
  @Input() isRest = false;

  readonly th = TH;
  readonly location = signal<'home' | 'gym'>('home');
  readonly selectedExercise = signal<ExerciseItem | null>(null);
  readonly isModalOpen = signal<boolean>(false);

  readonly activeExercises = computed(() => {
    if (this.location() === 'gym' && this.workoutGym && this.workoutGym.length > 0) {
      return this.workoutGym;
    }
    if (this.location() === 'home' && this.workoutHome && this.workoutHome.length > 0) {
      return this.workoutHome;
    }
    return this.workout;
  });

  constructor() {
    addIcons({ chevronForwardOutline, bedOutline });
  }

  onLocationChange(event: CustomEvent): void {
    const val = event.detail.value as 'home' | 'gym';
    if (val === 'home' || val === 'gym') {
      this.location.set(val);
    }
  }

  openExercise(ex: ExerciseItem): void {
    this.selectedExercise.set(ex);
    this.isModalOpen.set(true);
  }

  formatSetsReps(sets?: number | null, reps?: string | number | null, rest?: number | null): string {
    const s = sets ?? 3;
    const r = reps ?? 12;
    const restSec = rest ?? 60;
    return this.th.today.setsFormat
      .replace('{sets}', String(s))
      .replace('{reps}', String(r))
      .replace('{rest}', String(restSec));
  }

  formatDuration(duration: number): string {
    return this.th.today.durationFormat.replace('{duration}', String(duration));
  }
}
