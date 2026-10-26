import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exercise-visual',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="exercise-visual-box">
      @if (exerciseId === 'Push_Ups') {
        @if (frame === 0) {
          <svg viewBox="0 0 200 120" class="exercise-svg">
            <line x1="10" y1="105" x2="190" y2="105" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="160" cy="40" r="10" fill="#c9dcb8" />
            <line x1="150" y1="46" x2="60" y2="78" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <polyline points="140,50 142,105" stroke="#c9dcb8" stroke-width="6" stroke-linecap="round" fill="none" />
            <polyline points="60,78 30,105" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="22" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">1. ท่าเริ่มต้น: ลำตัวตรง แขนตึง ดันพื้น</text>
          </svg>
        } @else {
          <svg viewBox="0 0 200 120" class="exercise-svg">
            <line x1="10" y1="105" x2="190" y2="105" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="160" cy="72" r="10" fill="#c9dcb8" />
            <line x1="150" y1="76" x2="60" y2="88" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <polyline points="135,76 150,55 140,105" stroke="#c9dcb8" stroke-width="6" stroke-linecap="round" fill="none" />
            <polyline points="60,88 30,105" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="22" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">2. ท่าสุดท้าย: ย่อศอก 90 องศา อกเฉียดพื้น</text>
          </svg>
        }
      } @else if (exerciseId === 'Bodyweight_Squat' || exerciseId === 'Squats' || exerciseId === 'Barbell_Squat' || exerciseId === 'Goblet_Squat') {
        @if (frame === 0) {
          <svg viewBox="0 0 200 140" class="exercise-svg">
            <line x1="30" y1="130" x2="170" y2="130" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="100" cy="25" r="9" fill="#c9dcb8" />
            <line x1="100" y1="34" x2="100" y2="78" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <line x1="100" y1="45" x2="85" y2="75" stroke="#c9dcb8" stroke-width="5" stroke-linecap="round" />
            <polyline points="100,78 90,130" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <polyline points="100,78 110,130" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="15" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">1. ท่าเริ่มต้น: ยืนตรง แยกเท้ากว้างเท่าหัวไหล่</text>
          </svg>
        } @else {
          <svg viewBox="0 0 200 140" class="exercise-svg">
            <line x1="30" y1="130" x2="170" y2="130" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="85" cy="48" r="9" fill="#c9dcb8" />
            <line x1="85" y1="57" x2="70" y2="92" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <line x1="85" y1="62" x2="135" y2="62" stroke="#c9dcb8" stroke-width="5" stroke-linecap="round" />
            <polyline points="70,92 110,95 110,130" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="20" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">2. ท่าสุดท้าย: ย่อสะโพกลงเหมือนนั่งเก้าอี้ หลังตรง</text>
          </svg>
        }
      } @else if (exerciseId === 'Lunges' || exerciseId === 'Dumbbell_Lunges') {
        @if (frame === 0) {
          <svg viewBox="0 0 200 140" class="exercise-svg">
            <line x1="20" y1="130" x2="180" y2="130" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="100" cy="25" r="9" fill="#c9dcb8" />
            <line x1="100" y1="34" x2="100" y2="80" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <line x1="100" y1="45" x2="95" y2="70" stroke="#c9dcb8" stroke-width="5" stroke-linecap="round" />
            <polyline points="100,80 100,130" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="15" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">1. ท่าเริ่มต้น: ยืนตรง มือเท้าสะเอว</text>
          </svg>
        } @else {
          <svg viewBox="0 0 200 140" class="exercise-svg">
            <line x1="20" y1="130" x2="180" y2="130" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="100" cy="40" r="9" fill="#c9dcb8" />
            <line x1="100" y1="49" x2="100" y2="90" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <polyline points="100,90 140,92 140,130" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <polyline points="100,90 70,115 50,130" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="20" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">2. ท่าสุดท้าย: ก้าวขาย่อตัวลง เข่าทำมุม 90 องศา</text>
          </svg>
        }
      } @else {
        <!-- Generic / Default Exercise Graphic -->
        @if (frame === 0) {
          <svg viewBox="0 0 200 120" class="exercise-svg">
            <line x1="10" y1="105" x2="190" y2="105" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="100" cy="30" r="9" fill="#c9dcb8" />
            <line x1="100" y1="39" x2="100" y2="78" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <polyline points="75,55 100,45 125,55" stroke="#c9dcb8" stroke-width="5" stroke-linecap="round" fill="none" />
            <polyline points="100,78 90,105" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <polyline points="100,78 110,105" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="16" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">1. ท่าเริ่มต้น: เตรียมความพร้อม</text>
          </svg>
        } @else {
          <svg viewBox="0 0 200 120" class="exercise-svg">
            <line x1="10" y1="105" x2="190" y2="105" stroke="#3d6b4f" stroke-width="3" stroke-dasharray="4 4" />
            <circle cx="100" cy="40" r="9" fill="#c9dcb8" />
            <line x1="100" y1="49" x2="100" y2="84" stroke="#eaf1e4" stroke-width="8" stroke-linecap="round" />
            <polyline points="65,65 100,48 135,65" stroke="#c9dcb8" stroke-width="5" stroke-linecap="round" fill="none" />
            <polyline points="100,84 80,105" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <polyline points="100,84 120,105" stroke="#eaf1e4" stroke-width="7" stroke-linecap="round" fill="none" />
            <text x="100" y="20" fill="#c9dcb8" font-size="11" text-anchor="middle" font-weight="bold">2. ท่าสุดท้าย: ออกแรงเกร็งกล้ามเนื้อ</text>
          </svg>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .exercise-visual-box {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .exercise-svg {
      width: 100%;
      max-height: 180px;
    }
  `],
})
export class ExerciseVisualComponent {
  @Input() exerciseId = '';
  @Input() frame: 0 | 1 = 0;
}
