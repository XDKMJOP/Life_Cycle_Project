import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonSpinner,
} from '@ionic/angular';
import { ApiService } from '../../../core/api/api.service';
import { SessionStore } from '../../../core/state/session.store';
import { AuthResponse } from '../../../core/models';
import { TH } from '../../../core/i18n/th';
import { AppLogoComponent } from '../../../shared/app-logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonSpinner,
    AppLogoComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="app-container">
        <header class="brand-header">
          <app-logo size="lg"></app-logo>
        </header>

        <div class="glass-card glass-card-hero auth-card">
          <h2 class="auth-title">{{ th.auth.registerTitle }}</h2>

          @if (errorMessage()) {
            <div class="error-banner">
              {{ errorMessage() }}
            </div>
          }

          <form (ngSubmit)="onRegister()">
            <div class="form-group">
              <label class="form-label" for="reg-name">{{ th.auth.name }}</label>
              <input
                id="reg-name"
                type="text"
                class="glass-input"
                name="name"
                [(ngModel)]="name"
                [placeholder]="th.auth.namePlaceholder"
                required
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">{{ th.auth.email }}</label>
              <input
                id="reg-email"
                type="email"
                class="glass-input"
                name="email"
                [(ngModel)]="email"
                [placeholder]="th.auth.emailPlaceholder"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">{{ th.auth.password }}</label>
              <input
                id="reg-password"
                type="password"
                class="glass-input"
                name="password"
                [(ngModel)]="password"
                [placeholder]="th.auth.passwordPlaceholder"
                required
                minlength="8"
                autocomplete="new-password"
              />
            </div>

            <button
              type="submit"
              class="btn-primary"
              [disabled]="loading() || !name || !email || !password || password.length < 8"
            >
              @if (loading()) {
                <ion-spinner name="crescent" color="dark"></ion-spinner>
              } @else {
                {{ th.auth.registerBtn }}
              }
            </button>
          </form>

          <div class="auth-footer">
            <a routerLink="/login" class="auth-link">
              {{ th.auth.toLogin }}
            </a>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .brand-subtitle {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-top: 4px;
      margin-bottom: 24px;
    }

    .auth-card {
      margin-top: 8px;
    }

    .auth-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--sage-strong);
      margin: 0 0 16px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .error-banner {
      background: rgba(229, 154, 143, 0.2);
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 10px 14px;
      border-radius: var(--radius-control);
      font-size: 0.85rem;
      margin-bottom: 16px;
      text-align: center;
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
    }

    .auth-link {
      color: var(--sage);
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--sage-strong);
        text-decoration: underline;
      }
    }
  `],
})
export class RegisterPage {
  private readonly api = inject(ApiService);
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly th = TH;
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onRegister(): void {
    if (!this.name || !this.email || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.api.post<{ token: string; userId: number }>('/auth/register', {
      name: this.name,
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const user = { id: res.userId, email: this.email };
        this.sessionStore.setSession(res.token, user, null);
        this.router.navigate(['/setup']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.error || this.th.auth.registerFailed;
        this.errorMessage.set(msg);
      },
    });
  }
}
