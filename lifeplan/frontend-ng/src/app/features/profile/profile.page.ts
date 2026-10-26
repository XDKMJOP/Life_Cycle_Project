import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  refreshOutline,
  personOutline,
  flashOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/api/api.service';
import { SessionStore } from '../../core/state/session.store';
import { Profile } from '../../core/models';
import { TH } from '../../core/i18n/th';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSkeletonText],
  template: `
    <ion-content [fullscreen]="true">
      <div class="profile-page-wrapper">
        <header class="profile-header">
          <h1 class="profile-title">{{ th.profile.title }}</h1>
          <p class="profile-desc">ข้อมูลสรีระ การเผาผลาญพลังงาน และการตั้งค่าบัญชีของคุณ</p>
        </header>

        <!-- Loading Skeleton -->
        @if (isLoading()) {
          <div class="sk-stack">
            <ion-skeleton-text [animated]="true" class="sk-panel"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-panel"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" class="sk-panel"></ion-skeleton-text>
          </div>
        } @else if (errorMessage()) {
          <!-- Error State -->
          <div class="error-container">
            <p class="error-msg">{{ errorMessage() }}</p>
            <button type="button" class="btn-primary" (click)="loadProfile()">
              <ion-icon name="refresh-outline"></ion-icon>
              <span>{{ th.common.retry }}</span>
            </button>
          </div>
        } @else {
          <!-- Group 1: Body & Goal -->
          <div class="panel-card">
            <div class="panel-header">
              <ion-icon name="person-outline"></ion-icon>
              <h3>ร่างกายและเป้าหมาย</h3>
            </div>
            <div class="panel-rows">
              <div class="attr-row">
                <span class="attr-label">ชื่อ</span>
                <span class="attr-val">{{ profile()?.name || '-' }}</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">เพศ</span>
                <span class="attr-val highlight">{{ profile()?.sex === 'female' ? 'หญิง (โปรแกรม 50 ท่าสำหรับผู้หญิง)' : 'ชาย (โปรแกรม 50 ท่าสำหรับผู้ชาย)' }}</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">อายุ</span>
                <span class="attr-val">{{ profile()?.age || '-' }} ปี</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">ส่วนสูง</span>
                <span class="attr-val">{{ profile()?.height_cm || '-' }} ซม.</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">น้ำหนัก</span>
                <span class="attr-val">{{ profile()?.weight_kg || '-' }} กก.</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">เป้าหมาย</span>
                <span class="attr-val">{{ getGoalLabel(profile()?.goal) }}</span>
              </div>
            </div>
          </div>

          <!-- Group 2: Energy & Calories -->
          <div class="panel-card">
            <div class="panel-header">
              <ion-icon name="flash-outline"></ion-icon>
              <h3>พลังงานและแคลอรี่</h3>
            </div>
            <div class="panel-rows">
              <div class="attr-row">
                <span class="attr-label">BMR (พลังงานพื้นฐาน)</span>
                <span class="attr-val highlight">{{ profile()?.bmr || '-' }} kcal</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">TDEE (พลังงานรวมกิจกรรม)</span>
                <span class="attr-val highlight">{{ profile()?.tdee || '-' }} kcal</span>
              </div>
              <div class="attr-row">
                <span class="attr-label">แคลอรี่เป้าหมายต่อวัน</span>
                <span class="attr-val target-val">{{ profile()?.target_kcal || '-' }} kcal</span>
              </div>
            </div>
          </div>

          <!-- Group 3: Account & Logout -->
          <div class="panel-card">
            <div class="panel-rows">
              <div class="attr-row">
                <span class="attr-label">อีเมลผู้ใช้งาน</span>
                <span class="attr-val">{{ sessionStore.user()?.email || '-' }}</span>
              </div>
            </div>
            <div class="logout-row">
              <button type="button" class="logout-btn" (click)="onLogout()">
                <ion-icon name="log-out-outline"></ion-icon>
                <span>{{ th.common.logout }}</span>
              </button>
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

    .profile-page-wrapper {
      max-width: 520px;
      margin: 0 auto;
      padding: 16px 16px 80px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .profile-header {
      .profile-title {
        font-family: var(--font-display);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--sage-strong);
        margin: 0 0 4px;
      }

      .profile-desc {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: 0;
        line-height: 1.45;
      }
    }

    .panel-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      padding: 14px 16px;

      .panel-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: var(--sage-strong);

        ion-icon {
          font-size: 1.15rem;
        }

        h3 {
          font-size: 0.94rem;
          font-weight: 700;
          margin: 0;
        }
      }

      .panel-rows {
        display: flex;
        flex-direction: column;

        .attr-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 44px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.86rem;

          &:last-child {
            border-bottom: none;
          }

          .attr-label {
            color: var(--text-muted);
          }

          .attr-val {
            font-weight: 600;
            color: var(--text);

            &.highlight {
              color: var(--sage);
            }

            &.target-val {
              color: var(--sage-strong);
              font-weight: 700;
              font-size: 0.94rem;
            }
          }
        }
      }

      .logout-row {
        margin-top: 14px;
        display: flex;
        justify-content: center;

        .logout-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          height: 42px;
          background: rgba(220, 70, 70, 0.12);
          border: 1px solid rgba(220, 70, 70, 0.25);
          border-radius: var(--radius-pill);
          color: #ff8888;
          font-weight: 600;
          font-size: 0.86rem;
          cursor: pointer;
          transition: background 0.15s ease;

          &:active {
            background: rgba(220, 70, 70, 0.22);
          }
        }
      }
    }

    .sk-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .sk-panel {
        height: 140px;
        border-radius: var(--radius-card);
      }
    }

    .error-container {
      text-align: center;
      padding: 40px 16px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-card);
      color: var(--text);

      p {
        color: var(--text-muted);
        font-size: 0.88rem;
        margin-bottom: 20px;
      }
    }
  `],
})
export class ProfilePage implements OnInit {
  private readonly api = inject(ApiService);
  readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly th = TH;
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profile = signal<Profile | null>(null);

  constructor() {
    addIcons({ logOutOutline, refreshOutline, personOutline, flashOutline });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.get<Profile>('/profile').subscribe({
      next: (data) => {
        this.profile.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.th.common.error);
      },
    });
  }

  getGoalLabel(goal?: string): string {
    switch (goal) {
      case 'lose_weight':
        return 'ลดน้ำหนัก';
      case 'maintain':
        return 'รักษาน้ำหนักและสุขภาพ';
      case 'build_muscle':
        return 'สร้างกล้ามเนื้อ';
      case 'gain_weight':
        return 'เพิ่มน้ำหนัก';
      default:
        return 'ดูแลสุขภาพทั่วไป';
    }
  }

  onLogout(): void {
    this.sessionStore.clearSession();
    this.router.navigate(['/login']);
  }
}
