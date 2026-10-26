import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/angular';
import { TH } from '../../core/i18n/th';
import { AppLogoComponent } from '../../shared/app-logo.component';
import { ApiService } from '../../core/api/api.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonLabel,
    AppLogoComponent,
  ],
  template: `
    <div class="tabs-layout">
      <!-- Sticky Top Header: Small Logo + Capsule Tab Bar -->
      <header class="top-header-wrapper">
        <div class="logo-header-row">
          <app-logo size="sm"></app-logo>
        </div>

        @if (connectionError()) {
          <div class="connection-error-banner" role="alert">
            <span>{{ th.common.error }}</span>
            <button type="button" class="retry-btn" (click)="checkHealth()">
              {{ th.common.retry }}
            </button>
          </div>
        }

        <ion-tab-bar slot="top" class="capsule-tab-bar">
          <ion-tab-button tab="today" aria-label="แท็บวันนี้">
            <ion-label>
              <span class="tab-label-full">{{ th.tabs.today }}</span>
              <span class="tab-label-short">{{ th.tabs.todayShort }}</span>
            </ion-label>
          </ion-tab-button>

          <ion-tab-button tab="plan" aria-label="แท็บแผน 30 วัน">
            <ion-label>
              <span class="tab-label-full">{{ th.tabs.plan }}</span>
              <span class="tab-label-short">{{ th.tabs.planShort }}</span>
            </ion-label>
          </ion-tab-button>

          <ion-tab-button tab="progress" aria-label="แท็บความคืบหน้า">
            <ion-label>
              <span class="tab-label-full">{{ th.tabs.progress }}</span>
              <span class="tab-label-short">{{ th.tabs.progressShort }}</span>
            </ion-label>
          </ion-tab-button>

          <ion-tab-button tab="coach" aria-label="แท็บที่ปรึกษา AI">
            <ion-label>
              <span class="tab-label-full">{{ th.tabs.coach }}</span>
              <span class="tab-label-short">{{ th.tabs.coachShort }}</span>
            </ion-label>
          </ion-tab-button>

          <ion-tab-button tab="profile" aria-label="แท็บโปรไฟล์">
            <ion-label>
              <span class="tab-label-full">{{ th.tabs.profile }}</span>
              <span class="tab-label-short">{{ th.tabs.profileShort }}</span>
            </ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </header>

      <ion-tabs class="content-tabs"></ion-tabs>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .tabs-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-deep);
    }

    .top-header-wrapper {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: var(--bg-deep);
      padding: env(safe-area-inset-top, 8px) 16px 10px;
      max-width: 520px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }

    .logo-header-row {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px 0 8px;
    }

    .connection-error-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(229, 154, 143, 0.15);
      border: 1px solid var(--danger);
      border-radius: var(--radius-control);
      padding: 6px 12px;
      margin-bottom: 8px;
      font-size: 0.8rem;
      color: var(--danger);

      .retry-btn {
        background: transparent;
        border: 1px solid var(--danger);
        color: var(--danger);
        border-radius: var(--radius-pill);
        padding: 2px 10px;
        font-size: 0.75rem;
        cursor: pointer;
      }
    }

    ion-tab-bar.capsule-tab-bar {
      --background: rgba(0, 0, 0, 0.38);
      background: rgba(0, 0, 0, 0.38);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-pill);
      padding: 4px;
      height: 44px;
      display: flex;
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      contain: none;

      ion-tab-button {
        flex: 1;
        min-height: 36px;
        height: 36px;
        padding: 0 2px;
        border-radius: var(--radius-pill);
        background: transparent;
        --color: var(--text-muted);
        --color-selected: var(--sage-strong);
        color: var(--text-muted);
        font-size: 0.82rem;
        font-weight: 500;
        transition: all 0.2s ease;
        white-space: nowrap;

        &.tab-selected {
          background: var(--glass-bg-strong);
          color: var(--sage-strong);
          font-weight: 700;
        }

        &:focus-visible {
          outline: 2px solid var(--sage);
          outline-offset: -2px;
        }
      }
    }

    .tab-label-full {
      display: inline;
    }

    .tab-label-short {
      display: none;
    }

    @media (max-width: 400px) {
      .tab-label-full {
        display: none;
      }
      .tab-label-short {
        display: inline;
      }
      ion-tab-bar.capsule-tab-bar ion-tab-button {
        font-size: 0.76rem;
      }
    }

    .content-tabs {
      flex: 1;
      height: 100%;
    }
  `],
})
export class TabsPage implements OnInit {
  private readonly api = inject(ApiService);
  readonly th = TH;
  readonly connectionError = signal<boolean>(false);

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth(): void {
    this.api.get<{ ok: boolean }>('/health').subscribe({
      next: () => this.connectionError.set(false),
      error: () => this.connectionError.set(true),
    });
  }
}
