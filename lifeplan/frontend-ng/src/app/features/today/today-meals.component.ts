import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  sunnyOutline,
  restaurantOutline,
  moonOutline,
  nutritionOutline,
  chevronDownOutline,
  chevronUpOutline,
} from 'ionicons/icons';
import { MealItem } from '../../core/models';
import { TH } from '../../core/i18n/th';

@Component({
  selector: 'app-today-meals',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="meals-section">
      <!-- Total vs Target Header Card -->
      <div class="total-header-card">
        <div class="total-text-row">
          <span class="total-title">{{ getHeaderLabel() }}</span>
          <span class="pct-badge">{{ getPercentage() }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="getProgressWidth()"></div>
        </div>
      </div>

      <!-- Meal Rows -->
      <div class="meals-list">
        @for (meal of meals; track meal.title + $index) {
          <div class="meal-card" [class.is-expanded]="isExpanded($index)">
            <button
              type="button"
              class="meal-row-btn"
              (click)="toggleExpand($index)"
            >
              <!-- Slot Icon -->
              <div class="slot-icon-box" [attr.data-slot]="meal.slot">
                <ion-icon [name]="getSlotIcon(meal.slot)"></ion-icon>
              </div>

              <!-- Menu Details -->
              <div class="meal-meta">
                <span class="slot-badge">{{ getSlotLabel(meal.slot) }}</span>
                <h4 class="menu-title">{{ meal.title }}</h4>
              </div>

              <!-- Macros on Right -->
              <div class="meal-macros">
                <span class="kcal-val">{{ meal.kcal }} <small>{{ th.today.caloriesUnit }}</small></span>
                <span class="protein-val">โปรตีน {{ meal.protein_g }} {{ th.today.proteinUnit }}</span>
              </div>

              @if (meal.description) {
                <ion-icon
                  [name]="isExpanded($index) ? 'chevron-up-outline' : 'chevron-down-outline'"
                  class="expand-icon"
                ></ion-icon>
              }
            </button>

            <!-- Expandable Cooking Notes -->
            @if (meal.description && isExpanded($index)) {
              <div class="notes-dropdown">
                <p class="notes-text">{{ meal.description }}</p>
              </div>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <p>ไม่มีรายการอาหารสำหรับวันนี้</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .meals-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .total-header-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 14px 16px;

      .total-text-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;

        .total-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text);
        }

        .pct-badge {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--sage-strong);
        }
      }

      .progress-track {
        height: 6px;
        background: rgba(0, 0, 0, 0.45);
        border-radius: 999px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--sage), var(--sage-strong));
          border-radius: 999px;
          transition: width 0.3s ease;
        }
      }
    }

    .meals-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meal-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-control);
      overflow: hidden;
      transition: border-color 0.18s ease;

      &.is-expanded {
        border-color: var(--glass-border-strong);
      }
    }

    .meal-row-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 56px;
      padding: 10px 14px;
      background: transparent;
      border: none;
      color: var(--text);
      text-align: left;
      cursor: pointer;

      &:active {
        background: rgba(168, 195, 160, 0.08);
      }

      .slot-icon-box {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-pill);
        background: rgba(168, 195, 160, 0.12);
        color: var(--sage);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        flex-shrink: 0;

        &[data-slot='dinner'] {
          background: rgba(100, 140, 180, 0.14);
          color: #a0c4e8;
        }

        &[data-slot='breakfast'] {
          background: rgba(220, 170, 70, 0.14);
          color: #ffd166;
        }
      }

      .meal-meta {
        flex: 1;
        min-width: 0;

        .slot-badge {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 2px;
        }

        .menu-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .meal-macros {
        text-align: right;
        flex-shrink: 0;

        .kcal-val {
          display: block;
          font-size: 0.94rem;
          font-weight: 700;
          color: var(--sage-strong);

          small {
            font-size: 0.72rem;
            font-weight: 500;
            color: var(--text-muted);
          }
        }

        .protein-val {
          display: block;
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
      }

      .expand-icon {
        color: var(--text-muted);
        font-size: 1rem;
        flex-shrink: 0;
        margin-left: 4px;
      }
    }

    .notes-dropdown {
      padding: 10px 14px 12px;
      background: rgba(0, 0, 0, 0.25);
      border-top: 1px solid rgba(255, 255, 255, 0.05);

      .notes-text {
        font-size: 0.82rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin: 0;
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
export class TodayMealsComponent {
  @Input() meals: MealItem[] = [];
  @Input() totalKcal = 0;
  @Input() targetKcal = 2000;

  readonly th = TH;
  readonly expanded = signal<Set<number>>(new Set());

  constructor() {
    addIcons({
      sunnyOutline,
      restaurantOutline,
      moonOutline,
      nutritionOutline,
      chevronDownOutline,
      chevronUpOutline,
    });
  }

  isExpanded(index: number): boolean {
    return this.expanded().has(index);
  }

  toggleExpand(index: number): void {
    const s = new Set(this.expanded());
    if (s.has(index)) {
      s.delete(index);
    } else {
      s.add(index);
    }
    this.expanded.set(s);
  }

  getHeaderLabel(): string {
    const current = this.totalKcal || this.meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
    return this.th.today.mealsTotalFormat
      .replace('{current}', current.toLocaleString())
      .replace('{target}', this.targetKcal.toLocaleString());
  }

  getPercentage(): number {
    if (!this.targetKcal || this.targetKcal <= 0) return 0;
    const current = this.totalKcal || this.meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
    return Math.round((current / this.targetKcal) * 100);
  }

  getProgressWidth(): number {
    return Math.min(100, Math.max(0, this.getPercentage()));
  }

  getSlotIcon(slot: string): string {
    switch (slot) {
      case 'breakfast':
        return 'sunny-outline';
      case 'lunch':
        return 'restaurant-outline';
      case 'dinner':
        return 'moon-outline';
      case 'snack':
      default:
        return 'nutrition-outline';
    }
  }

  getSlotLabel(slot: string): string {
    switch (slot) {
      case 'breakfast':
        return this.th.today.mealMorning;
      case 'lunch':
        return this.th.today.mealLunch;
      case 'dinner':
        return this.th.today.mealDinner;
      case 'snack':
      default:
        return this.th.today.mealSnack;
    }
  }
}
