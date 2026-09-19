import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type PomodoroMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export interface ApiTask {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly completed: boolean;
  readonly completedAt: string | null;
  readonly priority: number | null;
  readonly category: string | null;
  readonly tags: readonly string[];
  readonly sortOrder: number;
  readonly dueDate: string | null;
  readonly scheduledDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ApiReminderLog {
  readonly id: string;
  readonly reminderId: string;
  readonly date: string;
  readonly amount: number | null;
  readonly unit: string | null;
  readonly completedAt: string | null;
}

export interface ApiReminder {
  readonly id: string;
  readonly key?: string;
  readonly title: string;
  readonly description: string | null;
  readonly icon: string | null;
  readonly actionLabel: string | null;
  readonly actionIcon: string | null;
  readonly tone: string | null;
  readonly completed?: boolean;
  readonly log?: ApiReminderLog | null;
}

export interface ApiMilestone {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly dueDate: string;
  readonly daysLeft?: number;
  readonly tone: string | null;
  readonly category: string | null;
}

export interface ApiStickyNote {
  readonly id: string;
  readonly text: string;
  readonly tone: string | null;
  readonly color: string | null;
  readonly sortOrder: number;
}

export interface DashboardTodayResponse {
  readonly profile: {
    readonly firstName: string;
    readonly displayName: string;
    readonly currentFocus: string | null;
    readonly greetingName: string;
  };
  readonly today: {
    readonly date: string;
    readonly timezone: string;
  };
  readonly priorityTasks: readonly ApiTask[];
  readonly unfinishedTasksToday: readonly ApiTask[];
  readonly finishedTasksToday: readonly ApiTask[];
  readonly activeReminders: readonly ApiReminder[];
  readonly reminderStatus: {
    readonly total: number;
    readonly completed: number;
    readonly pending: number;
  };
  readonly upcomingMilestones: readonly ApiMilestone[];
  readonly stickyNotes: readonly ApiStickyNote[];
  readonly daySummary: {
    readonly totalTasks: number;
    readonly completedTask: number;
  } | null;
}

export interface ApiJournalEntry {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly content: string;
  readonly excerpt: string | null;
  readonly mood: string | null;
  readonly moodLabel: string | null;
  readonly moodIcon: string | null;
  readonly imageUrl: string | null;
  readonly featured: boolean;
}

export interface SaveJournalEntryRequest {
  readonly date: string;
  readonly title: string;
  readonly content: string;
  readonly excerpt?: string | null;
  readonly mood?: string | null;
  readonly moodIcon?: string | null;
  readonly imageUrl?: string | null;
  readonly featured?: boolean;
}

export interface ApiMoodLog {
  readonly id: string;
  readonly date: string;
  readonly moodLabel: string;
  readonly moodIcon: string | null;
  readonly intensity: number;
  readonly note: string | null;
}

export interface MoodSummaryResponse {
  readonly count: number;
  readonly averageIntensity: number | null;
  readonly mostFrequentMood: string | null;
  readonly latest: ApiMoodLog | null;
  readonly byMood: readonly { readonly moodLabel: string; readonly count: number }[];
  readonly logs: readonly ApiMoodLog[];
}

export interface CycleSummaryResponse {
  readonly current: {
    readonly id: string;
    readonly startDate: string;
    readonly endDate: string | null;
    readonly cycleDay: number | null;
    readonly phase: string | null;
    readonly flow: string | null;
  } | null;
  readonly predictedPhase: string | null;
  readonly recentEntries: readonly unknown[];
}

export interface ApiSymptomLog {
  readonly id: string;
  readonly cycleEntryId: string | null;
  readonly date: string;
  readonly symptom: string;
  readonly severity: number | null;
  readonly note: string | null;
}

export interface ApiPomodoroSession {
  readonly id: string;
  readonly taskTitle: string;
  readonly mode: PomodoroMode;
  readonly duration: number;
  readonly completed: boolean;
  readonly skipped: boolean;
  readonly atmosphere: string | null;
  readonly startedAt: string | null;
  readonly endedAt: string | null;
}

export interface PomodoroSummary {
  readonly totalSessions: number;
  readonly completedSessions: number;
  readonly skippedSessions: number;
  readonly focusSessions: number;
  readonly focusMinutes: number;
  readonly completedFocusMinutes: number;
  readonly breakMinutes: number;
}

export interface PomodoroTodayResponse {
  readonly date: string;
  readonly timezone: string;
  readonly sessions: readonly ApiPomodoroSession[];
  readonly summary: PomodoroSummary;
}

export interface PomodoroHistoryResponse {
  readonly sessions: readonly ApiPomodoroSession[];
  readonly summary: PomodoroSummary;
}

export interface ApiProfile {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly timezone: string;
  readonly displayName: string | null;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly currentFocus: string | null;
  readonly greetingName: string;
}

export interface ApiNotificationPreference {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly description: string | null;
  readonly enabled: boolean;
  readonly locked: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getDashboardToday(): Observable<DashboardTodayResponse> {
    return this.http.get<DashboardTodayResponse>(`${this.apiUrl}/dashboard/today`);
  }

  completeTask(id: string): Observable<ApiTask> {
    return this.http.patch<ApiTask>(`${this.apiUrl}/tasks/${id}/complete`, {});
  }

  saveStickyNotes(notes: readonly { id?: string; text: string; sortOrder: number }[]): Observable<ApiStickyNote[]> {
    return this.http.put<ApiStickyNote[]>(`${this.apiUrl}/sticky-notes/bulk`, { notes });
  }

  logReminder(key: string): Observable<{ readonly reminder: ApiReminder; readonly log: ApiReminderLog }> {
    return this.http.post<{ readonly reminder: ApiReminder; readonly log: ApiReminderLog }>(
      `${this.apiUrl}/reminders/${key}/log`,
      {},
    );
  }

  getJournalEntries(params?: Record<string, string>): Observable<ApiJournalEntry[]> {
    return this.http.get<ApiJournalEntry[]>(`${this.apiUrl}/journal`, {
      params: this.toParams(params),
    });
  }

  getTodayJournal(): Observable<ApiJournalEntry | null> {
    return this.http.get<ApiJournalEntry | null>(`${this.apiUrl}/journal/today`);
  }

  createJournalEntry(body: SaveJournalEntryRequest): Observable<ApiJournalEntry> {
    return this.http.post<ApiJournalEntry>(`${this.apiUrl}/journal`, body);
  }

  updateJournalEntry(id: string, body: Partial<SaveJournalEntryRequest>): Observable<ApiJournalEntry> {
    return this.http.patch<ApiJournalEntry>(`${this.apiUrl}/journal/${id}`, body);
  }

  saveMoodLog(body: {
    date: string;
    moodLabel: string;
    moodIcon?: string;
    intensity: number;
    note?: string | null;
  }): Observable<ApiMoodLog> {
    return this.http.post<ApiMoodLog>(`${this.apiUrl}/mood-logs`, body);
  }

  getMoodSummary(range: 'week' | 'month' = 'week'): Observable<MoodSummaryResponse> {
    return this.http.get<MoodSummaryResponse>(`${this.apiUrl}/mood-logs/summary`, {
      params: new HttpParams().set('range', range),
    });
  }

  getCycleSummary(): Observable<CycleSummaryResponse> {
    return this.http.get<CycleSummaryResponse>(`${this.apiUrl}/cycle/summary`);
  }

  getCycleSymptoms(params?: Record<string, string>): Observable<ApiSymptomLog[]> {
    return this.http.get<ApiSymptomLog[]>(`${this.apiUrl}/cycle/symptoms`, {
      params: this.toParams(params),
    });
  }

  createPomodoroSession(body: {
    taskTitle?: string;
    mode: PomodoroMode;
    duration: number;
    completed: boolean;
    skipped?: boolean;
    atmosphere?: string;
    startedAt: string;
    endedAt?: string;
  }): Observable<ApiPomodoroSession> {
    return this.http.post<ApiPomodoroSession>(`${this.apiUrl}/pomodoro/sessions`, body);
  }

  getPomodoroToday(): Observable<PomodoroTodayResponse> {
    return this.http.get<PomodoroTodayResponse>(`${this.apiUrl}/pomodoro/today`);
  }

  getPomodoroHistory(params?: Record<string, string>): Observable<PomodoroHistoryResponse> {
    return this.http.get<PomodoroHistoryResponse>(`${this.apiUrl}/pomodoro/history`, {
      params: this.toParams(params),
    });
  }

  getProfile(): Observable<ApiProfile> {
    return this.http.get<ApiProfile>(`${this.apiUrl}/settings/profile`);
  }

  updateProfile(body: Partial<ApiProfile>): Observable<ApiProfile> {
    return this.http.patch<ApiProfile>(`${this.apiUrl}/settings/profile`, body);
  }

  getNotificationPreferences(): Observable<ApiNotificationPreference[]> {
    return this.http.get<ApiNotificationPreference[]>(`${this.apiUrl}/settings/notifications`);
  }

  updateNotificationPreference(key: string, enabled: boolean): Observable<ApiNotificationPreference> {
    return this.http.patch<ApiNotificationPreference>(
      `${this.apiUrl}/settings/notifications/${key}`,
      { enabled },
    );
  }

  private toParams(params?: Record<string, string>): HttpParams {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params ?? {})) {
      httpParams = httpParams.set(key, value);
    }

    return httpParams;
  }
}
