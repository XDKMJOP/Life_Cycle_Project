import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular';
import { ExerciseItem } from '../../core/models';
import { TH } from '../../core/i18n/th';
import { ExerciseVisualComponent } from '../../shared/exercise-visual.component';

const EXERCISE_GUIDES: Record<string, { muscle: string; tips: string }> = {
  Bodyweight_Squat: {
    muscle: 'ต้นขาด้านหน้าและกล้ามเนื้อสะโพก',
    tips: 'ยืนแยกเท้ากว้างเท่าหัวไหล่ เปิดปลายเท้าเล็กน้อย ย่อตัวลงเหมือนนั่งเก้าอี้โดยรักษาแนวกระดูกสันหลังให้ตรงและไม่ให้หัวเข่าเลยปลายเท้า',
  },
  Squats: {
    muscle: 'ต้นขาด้านหน้าและกล้ามเนื้อสะโพก',
    tips: 'ยืนแยกเท้ากว้างเท่าหัวไหล่ เปิดปลายเท้าเล็กน้อย ย่อตัวลงเหมือนนั่งเก้าอี้โดยรักษาแนวกระดูกสันหลังให้ตรง',
  },
  Lunges: {
    muscle: 'กล้ามเนื้อต้นขาด้านหน้าและก้น',
    tips: 'ก้าวขาไปข้างหน้าหนึ่งก้าว ย่อตัวลงจนเข่าทั้งสองข้างทำมุมประมาณ 90 องศา ลำตัวตั้งตรง',
  },
  Push_Ups: {
    muscle: 'กล้ามเนื้อหน้าอก หัวไหล่ และหลังแขน',
    tips: 'วางมือทั้งสองข้างกว้างกว่าหัวไหล่เล็กน้อย ลำตัวตรง เกร็งหน้าท้อง ย่อศอกลงให้อกเฉียดพื้นแล้วดันตัวขึ้น',
  },
  Plank: {
    muscle: 'กล้ามเนื้อแกนกลางลำตัวและหน้าท้อง',
    tips: 'ตั้งศอกลงบนพื้นระดับเดียวกับหัวไหล่ เกร็งหน้าท้องและสะโพก ลำตัวตรงเป็นแนวเดียวกัน ห้ามหย่อนสะโพก',
  },
};

@Component({
  selector: 'app-exercise-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    ExerciseVisualComponent,
  ],
  template: `
    <ion-modal
      [isOpen]="isOpen"
      [initialBreakpoint]="0.75"
      [breakpoints]="[0, 0.5, 0.75, 0.95]"
      (didDismiss)="onDismiss()"
    >
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ exercise?.name_th || exercise?.exercise_id }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="onDismiss()">{{ th.today.modalClose }}</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding modal-content-box">
          @if (exercise) {
            <!-- Frame Switcher Segment -->
            <div class="frame-segment-wrapper">
              <ion-segment
                [value]="frame()"
                (ionChange)="onFrameChange($event)"
              >
                <ion-segment-button [value]="0">
                  <ion-label>{{ th.today.stepStart }}</ion-label>
                </ion-segment-button>
                <ion-segment-button [value]="1">
                  <ion-label>{{ th.today.stepEnd }}</ion-label>
                </ion-segment-button>
              </ion-segment>
            </div>

            <!-- Vector Visual Graphic -->
            <div class="visual-card">
              <app-exercise-visual
                [exerciseId]="exercise.exercise_id"
                [frame]="frame()"
              ></app-exercise-visual>
            </div>

            <!-- Details Section -->
            <div class="detail-section">
              <h4 class="section-title">{{ th.today.mainMuscle }}</h4>
              <p class="section-text">{{ getMuscleInfo(exercise.exercise_id) }}</p>
            </div>

            <div class="detail-section">
              <h4 class="section-title">{{ th.today.instructions }}</h4>
              <p class="section-text">{{ getTipsInfo(exercise.exercise_id) }}</p>
            </div>
          }
        </ion-content>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    ion-toolbar {
      --background: var(--bg-mid);
      --color: var(--text);
    }

    .modal-content-box {
      --background: var(--bg-deep);
      color: var(--text);
    }

    .frame-segment-wrapper {
      margin-bottom: 14px;

      ion-segment {
        --background: rgba(0, 0, 0, 0.35);
        border-radius: var(--radius-pill);
        padding: 3px;

        ion-segment-button {
          --indicator-color: var(--sage-strong);
          --color: var(--text-muted);
          --color-checked: var(--on-sage);
          font-weight: 600;
          font-size: 0.85rem;
        }
      }
    }

    .visual-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-control);
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      justify-content: center;
    }

    .detail-section {
      margin-bottom: 14px;

      .section-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--sage-strong);
        margin: 0 0 4px;
      }

      .section-text {
        font-size: 0.86rem;
        color: var(--text-muted);
        line-height: 1.55;
        margin: 0;
      }
    }
  `],
})
export class ExerciseModalComponent {
  @Input() isOpen = false;
  @Input() exercise: ExerciseItem | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly th = TH;
  readonly frame = signal<0 | 1>(0);

  onFrameChange(event: CustomEvent): void {
    const val = Number(event.detail.value);
    this.frame.set(val === 1 ? 1 : 0);
  }

  onDismiss(): void {
    this.closed.emit();
  }

  getMuscleInfo(exerciseId: string): string {
    return EXERCISE_GUIDES[exerciseId]?.muscle || 'กล้ามเนื้อแกนกลางและร่างกายส่วนล่าง';
  }

  getTipsInfo(exerciseId: string): string {
    return EXERCISE_GUIDES[exerciseId]?.tips || 'ควบคุมลมหายใจ ออกแรงอย่างมั่นคงและรักษาแนวระนาบของลำตัวให้ถูกต้อง';
  }
}
