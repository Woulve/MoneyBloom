import { Injectable, signal, effect } from '@angular/core';
import { ProjectionSettings, DEFAULT_SETTINGS } from '../models/projection-settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly KEY = 'moneybloom_settings';
  readonly settings = signal<ProjectionSettings>(this.load());

  constructor() {
    if (typeof window !== 'undefined') {
      effect(() => {
        try {
          localStorage.setItem(this.KEY, JSON.stringify(this.settings()));
        } catch (err) {
          console.error('Failed to save settings:', err);
        }
      });
    }
  }

  updateSettings(updates: Partial<ProjectionSettings>): void {
    this.settings.update((curr) => ({ ...curr, ...updates }));
  }

  resetToDefaults(): void {
    this.settings.set(DEFAULT_SETTINGS);
  }

  private load(): ProjectionSettings {
    try {
      const stored = localStorage.getItem(this.KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (err) {
      console.error('Failed to load settings:', err);
      return DEFAULT_SETTINGS;
    }
  }
}
