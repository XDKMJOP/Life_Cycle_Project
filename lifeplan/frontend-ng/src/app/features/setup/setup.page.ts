import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { TH } from '../../core/i18n/th';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, IonContent],
  template: `
    <ion-content [fullscreen]="true">
      <div class="app-container">
        <header class="brand-header">
          <h1 class="brand-title">{{ th.app.title }}</h1>
        </header>

        <div class="glass-card">
          <div class="glass-card-header">
            <span>ตั้งค่าเริ่มต้น</span>
            <span class="status-pill">ขั้นตอนที่ 1</span>
          </div>
          <h2 style="font-size: 1.2rem; color: var(--sage-strong); margin: 6px 0 12px;">
            ตั้งค่าร่างกายและเป้าหมายสุขภาพ
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.6;">
            เตรียมพร้อมข้อมูลร่างกายและวิถีชีวิตเพื่อคำนวณพลังงาน
          </p>

          <button
            type="button"
            class="btn-primary"
            style="margin-top: 20px;"
            (click)="goToDashboard()"
          >
            เข้าสู่หน้าหลัก
          </button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class SetupPage {
  private readonly router = inject(Router);
  readonly th = TH;

  goToDashboard(): void {
    this.router.navigate(['/tabs/today']);
  }
}
