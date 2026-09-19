import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiNotificationPreference, ApiProfile, ApiService } from '../core/api.service';

interface ProfileField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'email';
}

interface NotificationPreference {
  readonly key: string;
  readonly title: string;
  readonly description: string | null;
  readonly enabled: boolean;
  readonly locked?: boolean;
}

type ProfileDraft = {
  avatarUrl: string;
  bio: string;
  email: string;
  firstName: string;
  lastName: string;
  timezone: string;
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly avatarUrl = signal(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
  );
  protected readonly profileDraft = signal<ProfileDraft>({
    avatarUrl: '',
    bio: '',
    email: '',
    firstName: '',
    lastName: '',
    timezone: '',
  });

  protected readonly profileFields: readonly ProfileField[] = [
    { id: 'firstName', label: 'First Name', type: 'text' },
    { id: 'lastName', label: 'Last Name', type: 'text' },
    { id: 'email', label: 'Email Address', type: 'email' },
    { id: 'timezone', label: 'Timezone', type: 'text' },
    { id: 'avatarUrl', label: 'Avatar URL', type: 'text' },
  ];

  protected readonly notificationPreferences = signal<readonly NotificationPreference[]>([]);

  ngOnInit(): void {
    this.loadProfile();
    this.loadNotifications();
  }

  protected profileFieldValue(id: string): string {
    return this.profileDraft()[id as keyof ProfileDraft];
  }

  protected updateProfileField(id: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.profileDraft.update((draft) => ({
      ...draft,
      [id]: value,
    }));
  }

  protected updateBio(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;

    this.profileDraft.update((draft) => ({
      ...draft,
      bio: value,
    }));
  }

  protected saveProfile(): void {
    const draft = this.profileDraft();

    this.api
      .updateProfile({
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        bio: draft.bio || null,
        avatarUrl: draft.avatarUrl || null,
        timezone: draft.timezone,
      })
      .subscribe((profile) => this.applyProfile(profile));
  }

  protected toggleNotification(preference: NotificationPreference): void {
    if (preference.locked) {
      return;
    }

    this.api
      .updateNotificationPreference(preference.key, !preference.enabled)
      .subscribe((updatedPreference) => {
        this.notificationPreferences.update((preferences) =>
          preferences.map((current) =>
            current.key === updatedPreference.key
              ? this.toNotificationPreference(updatedPreference)
              : current,
          ),
        );
      });
  }

  private loadProfile(): void {
    this.api.getProfile().subscribe((profile) => this.applyProfile(profile));
  }

  private loadNotifications(): void {
    this.api.getNotificationPreferences().subscribe((preferences) => {
      this.notificationPreferences.set(
        preferences.map((preference) => this.toNotificationPreference(preference)),
      );
    });
  }

  private applyProfile(profile: ApiProfile): void {
    const avatarUrl = profile.avatarUrl ?? '';

    this.avatarUrl.set(
      avatarUrl ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    );
    this.profileDraft.set({
      avatarUrl,
      bio: profile.bio ?? '',
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      timezone: profile.timezone,
    });
  }

  private toNotificationPreference(
    preference: ApiNotificationPreference,
  ): NotificationPreference {
    return {
      key: preference.key,
      title: preference.title,
      description: preference.description,
      enabled: preference.enabled,
      locked: preference.locked,
    };
  }
}
