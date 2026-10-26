import { Injectable, signal, computed } from '@angular/core';
import { User, Profile } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SessionStore {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';
  private readonly PROFILE_KEY = 'profile';

  readonly token = signal<string | null>(this.getInitialToken());
  readonly user = signal<User | null>(this.getInitialUser());
  readonly profile = signal<Profile | null>(this.getInitialProfile());

  readonly isLoggedIn = computed(() => Boolean(this.token()));
  readonly hasProfile = computed(() => Boolean(this.profile()));

  setSession(token: string, user: User, profile?: Profile | null): void {
    this.token.set(token);
    this.user.set(user);
    this.profile.set(profile ?? null);

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (profile) {
      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(this.PROFILE_KEY);
    }
  }

  setProfile(profile: Profile): void {
    this.profile.set(profile);
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    this.profile.set(null);

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
  }

  private getInitialToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getInitialUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private getInitialProfile(): Profile | null {
    try {
      const raw = localStorage.getItem(this.PROFILE_KEY);
      return raw ? (JSON.parse(raw) as Profile) : null;
    } catch {
      return null;
    }
  }
}
