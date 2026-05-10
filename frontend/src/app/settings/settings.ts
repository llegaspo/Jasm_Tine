import { Component } from '@angular/core';

interface ProfileField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'email';
  readonly value: string;
}

interface NotificationPreference {
  readonly title: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly locked?: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings {
  protected readonly avatarUrl =
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80';

  protected readonly profileFields: readonly ProfileField[] = [
    { id: 'firstName', label: 'First Name', type: 'text', value: 'Jasmine' },
    { id: 'lastName', label: 'Last Name', type: 'text', value: 'Valentine' },
    { id: 'email', label: 'Email Address', type: 'email', value: 'hello@jasminetine.co' },
  ];

  protected readonly bio = 'Curating spaces and experiences that foster calm productivity.';

  protected readonly notificationPreferences: readonly NotificationPreference[] = [
    {
      title: 'Weekly Digest',
      description: 'Receive a summary of your activity and insights.',
      enabled: true,
    },
    {
      title: 'Marketing & Offers',
      description: 'Updates on new features and exclusive chic drops.',
      enabled: false,
    },
    {
      title: 'Security Alerts',
      description: 'Crucial notifications regarding your account safety.',
      enabled: true,
      locked: true,
    },
  ];
}
