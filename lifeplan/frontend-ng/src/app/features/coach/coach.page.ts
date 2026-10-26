import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  sendOutline,
  refreshOutline,
  sparklesOutline,
  chatbubblesOutline,
} from 'ionicons/icons';
import { ApiService } from '../../core/api/api.service';
import { ChatMessage } from '../../core/models';
import { TH } from '../../core/i18n/th';

const QUICK_QUESTIONS = [
  'ควรจัดเวลาออกกำลังกายตอนไหนดีที่สุด?',
  'วันพักจำเป็นต้องกินโปรตีนเท่าเดิมไหม?',
  'ถ้าหิวดึก แนะนำของว่างอะไรที่ไม่หลุดแผน?',
  'รู้สึกปวดกล้ามเนื้อ ควรออกกำลังกายต่อหรือพัก?',
];

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonSkeletonText],
  template: `
    <ion-content [fullscreen]="true">
      <div class="coach-page-wrapper">
        <header class="coach-header">
          <div class="title-row">
            <h1 class="coach-title">{{ th.coach.title }}</h1>
            <span class="ai-badge">
              <ion-icon name="sparkles-outline"></ion-icon>
              <span>AI Coach</span>
            </span>
          </div>
          <p class="coach-desc">สอบถามคำแนะนำการรับประทานอาหาร ท่าฝึก และการจัดตารางสุขภาพ</p>
        </header>

        <!-- Messages Container -->
        <div class="messages-container" #messagesContainer>
          @if (isLoading()) {
            <div class="skeleton-messages">
              <ion-skeleton-text [animated]="true" class="sk-msg left"></ion-skeleton-text>
              <ion-skeleton-text [animated]="true" class="sk-msg right"></ion-skeleton-text>
              <ion-skeleton-text [animated]="true" class="sk-msg left"></ion-skeleton-text>
            </div>
          } @else if (errorMessage()) {
            <div class="error-banner">
              <p>{{ errorMessage() }}</p>
              <button type="button" class="btn-retry" (click)="loadHistory()">
                <ion-icon name="refresh-outline"></ion-icon>
                <span>{{ th.common.retry }}</span>
              </button>
            </div>
          } @else {
            @for (msg of messages(); track msg.id || $index) {
              <div class="message-row" [class.user-row]="msg.role === 'user'" [class.ai-row]="msg.role === 'assistant'">
                <div class="bubble" [class.user-bubble]="msg.role === 'user'" [class.ai-bubble]="msg.role === 'assistant'">
                  <p class="bubble-content">{{ msg.content }}</p>
                </div>

                @if (msg.role === 'assistant' && msg.source === 'fallback') {
                  <span class="fallback-pill">{{ th.coach.fallbackBadge }}</span>
                }
              </div>
            } @empty {
              <div class="empty-state">
                <ion-icon name="chatbubbles-outline" class="empty-icon"></ion-icon>
                <h4>ยินดีต้อนรับสู่ที่ปรึกษา AI</h4>
                <p>เลือกหัวข้อคำถามด่วนด้านล่าง หรือพิมพ์คำถามที่คุณสนใจได้เลย</p>
              </div>
            }

            <!-- Typing Indicator -->
            @if (isSending()) {
              <div class="message-row ai-row">
                <div class="bubble ai-bubble typing-bubble">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </div>
            }
          }
        </div>

        <!-- Quick Questions (Horizontal Scrollable, No Line Wrap) -->
        <div class="quick-questions-scroll">
          @for (q of quickQuestions; track q) {
            <button
              type="button"
              class="quick-pill-btn"
              [disabled]="isSending()"
              (click)="sendQuickQuestion(q)"
            >
              {{ q }}
            </button>
          }
        </div>

        <!-- Chat Input & Disclaimer Section -->
        <div class="chat-input-wrapper">
          <form (ngSubmit)="sendMessage()" class="input-form">
            <input
              type="text"
              class="chat-input"
              [(ngModel)]="inputText"
              name="chatInput"
              [placeholder]="th.coach.inputPlaceholder"
              [disabled]="isSending()"
              autocomplete="off"
            />
            <button
              type="submit"
              class="send-btn"
              [disabled]="isSending() || !inputText.trim()"
            >
              <ion-icon name="send-outline"></ion-icon>
            </button>
          </form>
          <p class="disclaimer-text">{{ th.coach.disclaimer }}</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
    }

    .coach-page-wrapper {
      max-width: 520px;
      margin: 0 auto;
      padding: 16px 16px 20px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: calc(100vh - 60px);
    }

    .coach-header {
      margin-bottom: 12px;

      .title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .coach-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--sage-strong);
          margin: 0;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(168, 195, 160, 0.12);
          color: var(--sage-strong);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-pill);
          padding: 3px 10px;
          font-size: 0.76rem;
          font-weight: 600;
        }
      }

      .coach-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin: 4px 0 0;
      }
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
      min-height: 280px;
    }

    .message-row {
      display: flex;
      flex-direction: column;
      max-width: 82%;

      &.user-row {
        align-self: flex-end;
        align-items: flex-end;
      }

      &.ai-row {
        align-self: flex-start;
        align-items: flex-start;
      }
    }

    .bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 0.88rem;
      line-height: 1.5;

      .bubble-content {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
      }

      &.user-bubble {
        background: var(--sage-strong);
        color: var(--on-sage);
        border-bottom-right-radius: 4px;
        font-weight: 500;
      }

      &.ai-bubble {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        color: var(--text);
        border-bottom-left-radius: 4px;
      }

      &.typing-bubble {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 16px;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sage);
          animation: pulse 1s infinite alternate;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }
          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }

    @keyframes pulse {
      0% { opacity: 0.3; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1.1); }
    }

    .fallback-pill {
      font-size: 0.68rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.06);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      margin-top: 4px;
      margin-left: 4px;
    }

    .quick-questions-scroll {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      white-space: nowrap;
      padding: 8px 0;
      margin-top: 8px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .quick-pill-btn {
        flex-shrink: 0;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-pill);
        color: var(--sage-strong);
        font-size: 0.78rem;
        padding: 6px 12px;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;

        &:active {
          background: rgba(168, 195, 160, 0.14);
          border-color: var(--sage);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .chat-input-wrapper {
      margin-top: 8px;

      .input-form {
        display: flex;
        gap: 8px;
        align-items: center;

        .chat-input {
          flex: 1;
          height: 44px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-pill);
          padding: 0 16px;
          color: var(--text);
          font-size: 0.88rem;
          outline: none;

          &:focus {
            border-color: var(--sage);
          }
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--sage-strong);
          color: var(--on-sage);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.12s ease;

          &:active {
            transform: scale(0.92);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }

      .disclaimer-text {
        font-size: 0.68rem;
        color: var(--text-muted);
        text-align: center;
        margin: 6px 0 0;
        line-height: 1.35;
      }
    }

    .skeleton-messages {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .sk-msg {
        height: 40px;
        border-radius: 16px;
        width: 65%;

        &.left {
          align-self: flex-start;
        }
        &.right {
          align-self: flex-end;
        }
      }
    }

    .error-banner {
      background: rgba(200, 60, 60, 0.15);
      border: 1px solid rgba(200, 60, 60, 0.3);
      border-radius: var(--radius-control);
      padding: 12px;
      text-align: center;
      color: #ff9999;
      font-size: 0.84rem;

      p {
        margin: 0 0 8px;
      }

      .btn-retry {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid #ff9999;
        color: #ff9999;
        border-radius: var(--radius-pill);
        padding: 4px 12px;
        font-size: 0.78rem;
        cursor: pointer;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 16px;
      color: var(--text-muted);

      .empty-icon {
        font-size: 2.2rem;
        color: var(--sage);
        margin-bottom: 8px;
      }

      h4 {
        color: var(--sage-strong);
        margin: 0 0 6px;
      }

      p {
        font-size: 0.82rem;
        margin: 0;
        line-height: 1.45;
      }
    }
  `],
})
export class CoachPage implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainerRef?: ElementRef;

  private readonly api = inject(ApiService);
  readonly th = TH;
  readonly quickQuestions = QUICK_QUESTIONS;

  readonly isLoading = signal(true);
  readonly isSending = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly messages = signal<ChatMessage[]>([]);
  inputText = '';

  private shouldScrollBottom = false;

  constructor() {
    addIcons({ sendOutline, refreshOutline, sparklesOutline, chatbubblesOutline });
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom) {
      this.scrollToBottom();
      this.shouldScrollBottom = false;
    }
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.get<{ messages: Array<{ id: number; role: 'user' | 'assistant'; content: string; createdAt: string; source?: 'ai' | 'fallback' }> }>('/chat/history').subscribe({
      next: (res) => {
        this.messages.set(
          (res.messages || []).map((m) => ({
            id: m.id,
            user_id: 0,
            role: m.role,
            content: m.content,
            created_at: m.createdAt,
            source: m.source,
          }))
        );
        this.isLoading.set(false);
        this.shouldScrollBottom = true;
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(this.th.common.error);
      },
    });
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || this.isSending()) return;

    this.inputText = '';
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      user_id: 0,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    this.messages.update((list) => [...list, tempUserMsg]);
    this.isSending.set(true);
    this.shouldScrollBottom = true;

    this.api.post<{ reply: string; source?: 'ai' | 'fallback' }>('/chat', { message: text }).subscribe({
      next: (res) => {
        const assistantMsg: ChatMessage = {
          id: Date.now() + 1,
          user_id: 0,
          role: 'assistant',
          content: res.reply,
          created_at: new Date().toISOString(),
          source: res.source,
        };
        this.messages.update((list) => [...list, assistantMsg]);
        this.isSending.set(false);
        this.shouldScrollBottom = true;
      },
      error: () => {
        this.isSending.set(false);
        const errorMsg: ChatMessage = {
          id: Date.now() + 1,
          user_id: 0,
          role: 'assistant',
          content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดลองส่งคำถามใหม่อีกครั้ง',
          created_at: new Date().toISOString(),
        };
        this.messages.update((list) => [...list, errorMsg]);
        this.shouldScrollBottom = true;
      },
    });
  }

  sendQuickQuestion(q: string): void {
    this.inputText = q;
    this.sendMessage();
  }

  private scrollToBottom(): void {
    if (this.messagesContainerRef) {
      const el = this.messagesContainerRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
