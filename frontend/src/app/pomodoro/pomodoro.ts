import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ApiPomodoroSession, ApiService, PomodoroMode } from '../core/api.service';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerModeConfig {
  readonly id: TimerMode;
  readonly label: string;
  readonly minutes: number;
}

interface Atmosphere {
  readonly label: string;
  readonly icon: string;
}

interface SessionRecord {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
}

@Component({
  selector: 'app-pomodoro',
  templateUrl: './pomodoro.html',
})
export class Pomodoro implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private sessionStartedAt: Date | null = null;

  protected readonly modes: readonly TimerModeConfig[] = [
    { id: 'focus', label: 'Focus', minutes: 25 },
    { id: 'shortBreak', label: 'Short Break', minutes: 5 },
    { id: 'longBreak', label: 'Long Break', minutes: 15 },
  ];

  protected readonly atmospheres: readonly Atmosphere[] = [
    { label: 'Gentle Rain', icon: 'water_drop' },
    { label: 'Jasmine Garden', icon: 'local_florist' },
    { label: 'Corner Cafe', icon: 'local_cafe' },
  ];

  protected readonly currentMode = signal<TimerMode>('focus');
  protected readonly secondsRemaining = signal(this.minutesToSeconds(25));
  protected readonly isRunning = signal(false);
  protected readonly focusTask = signal('');
  protected readonly completedFocusSessions = signal(0);
  protected readonly selectedAtmosphere = signal('Gentle Rain');
  protected readonly sessionHistory = signal<readonly SessionRecord[]>([]);

  protected readonly activeMode = computed(() => this.configFor(this.currentMode()));
  protected readonly durationSeconds = computed(() => this.minutesToSeconds(this.activeMode().minutes));
  protected readonly timerLabel = computed(() => this.formatTime(this.secondsRemaining()));
  protected readonly progressPercent = computed(() => {
    const elapsedSeconds = this.durationSeconds() - this.secondsRemaining();
    return Math.min(100, Math.max(0, (elapsedSeconds / this.durationSeconds()) * 100));
  });
  protected readonly progressOffset = computed(() => {
    const circumference = 289;
    return circumference - (this.progressPercent() / 100) * circumference;
  });
  protected readonly sessionStatus = computed(() =>
    this.isRunning() ? 'Session in progress' : 'Ready when you are',
  );

  ngOnInit(): void {
    this.loadPomodoroToday();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  protected setFocusTask(event: Event): void {
    this.focusTask.set((event.target as HTMLInputElement).value);
  }

  protected selectMode(mode: TimerMode): void {
    this.currentMode.set(mode);
    this.secondsRemaining.set(this.minutesToSeconds(this.configFor(mode).minutes));
    this.sessionStartedAt = null;
    this.stopTimer();
  }

  protected toggleTimer(): void {
    if (this.isRunning()) {
      this.stopTimer();
      return;
    }

    this.isRunning.set(true);
    this.sessionStartedAt ??= new Date();
    this.intervalId = setInterval(() => {
      const seconds = this.secondsRemaining();

      if (seconds <= 1) {
        this.completeCurrentSession();
        return;
      }

      this.secondsRemaining.set(seconds - 1);
    }, 1000);
  }

  protected resetTimer(): void {
    this.secondsRemaining.set(this.durationSeconds());
    this.sessionStartedAt = null;
    this.stopTimer();
  }

  protected skipTimer(): void {
    this.logCurrentSession(false, true);
    this.advanceMode();
  }

  protected selectAtmosphere(label: string): void {
    this.selectedAtmosphere.set(label);
  }

  private completeCurrentSession(): void {
    const finishedMode = this.activeMode();
    this.logCurrentSession(true, false);

    if (finishedMode.id === 'focus') {
      const completedCount = this.completedFocusSessions() + 1;
      this.completedFocusSessions.set(completedCount);
      this.currentMode.set(completedCount % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      this.currentMode.set('focus');
    }

    this.secondsRemaining.set(this.minutesToSeconds(this.activeMode().minutes));
    this.stopTimer();
  }

  private advanceMode(): void {
    if (this.currentMode() === 'focus') {
      const completedCount = this.completedFocusSessions();
      this.currentMode.set((completedCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak');
    } else {
      this.currentMode.set('focus');
    }

    this.secondsRemaining.set(this.durationSeconds());
    this.stopTimer();
  }

  private addSessionRecord(session: ApiPomodoroSession): void {
    const record = this.toSessionRecord(session);

    this.sessionHistory.update((history) => [record, ...history].slice(0, 4));
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning.set(false);
  }

  private configFor(mode: TimerMode): TimerModeConfig {
    return this.modes.find((config) => config.id === mode) ?? this.modes[0];
  }

  private minutesToSeconds(minutes: number): number {
    return minutes * 60;
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private loadPomodoroToday(): void {
    this.api.getPomodoroToday().subscribe((today) => {
      this.completedFocusSessions.set(
        today.sessions.filter((session) => session.completed && session.mode === 'FOCUS').length,
      );
      this.sessionHistory.set(today.sessions.slice(-4).reverse().map((session) => this.toSessionRecord(session)));
    });
  }

  private logCurrentSession(completed: boolean, skipped: boolean): void {
    const finishedMode = this.activeMode();
    const startedAt = this.sessionStartedAt ?? new Date();
    const endedAt = new Date();

    this.api
      .createPomodoroSession({
        taskTitle: this.focusTask().trim() || undefined,
        mode: this.toApiMode(finishedMode.id),
        duration: finishedMode.minutes,
        completed,
        skipped,
        atmosphere: this.selectedAtmosphere(),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      })
      .subscribe((session) => this.addSessionRecord(session));
    this.sessionStartedAt = null;
  }

  private toApiMode(mode: TimerMode): PomodoroMode {
    if (mode === 'shortBreak') {
      return 'SHORT_BREAK';
    }

    if (mode === 'longBreak') {
      return 'LONG_BREAK';
    }

    return 'FOCUS';
  }

  private toSessionRecord(session: ApiPomodoroSession): SessionRecord {
    return {
      id: session.id,
      title: session.taskTitle,
      meta: `${session.duration} min - ${session.skipped ? 'Skipped' : 'Completed'}`,
    };
  }
}
