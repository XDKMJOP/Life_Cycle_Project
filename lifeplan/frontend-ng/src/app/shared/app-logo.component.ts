import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container" [class.logo-sm]="size === 'sm'" [class.logo-lg]="size === 'lg'">
      @if (!hasError()) {
        <img
          src="assets/brand/logo.svg"
          alt="Life Cycle"
          class="logo-img"
          (error)="onError()"
        />
      } @else {
        <span class="logo-fallback">Life Cycle</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .logo-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .logo-sm {
      height: 30px;

      .logo-img {
        height: 30px;
        width: auto;
        max-width: 140px;
      }

      .logo-fallback {
        font-family: var(--font-display);
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--sage-strong);
        letter-spacing: -0.5px;
        line-height: 1;
      }
    }

    .logo-lg {
      height: 80px;

      .logo-img {
        height: 80px;
        width: auto;
        max-width: 240px;
      }

      .logo-fallback {
        font-family: var(--font-display);
        font-size: 2.4rem;
        font-weight: 700;
        color: var(--sage-strong);
        letter-spacing: -0.5px;
        line-height: 1;
      }
    }
  `],
})
export class AppLogoComponent {
  @Input() size: 'sm' | 'lg' = 'sm';
  readonly hasError = signal<boolean>(false);

  onError(): void {
    this.hasError.set(true);
  }
}
