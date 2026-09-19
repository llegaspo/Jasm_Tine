import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './core/api.service';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly navigationItems: readonly NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Wellness', icon: 'spa', route: '/wellness' },
    { label: 'Pomodoro', icon: 'timer', route: '/pomodoro' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  protected readonly profileName = signal('Jasmine');
  protected readonly avatarUrl = signal(
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  );
  protected readonly currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  ngOnInit(): void {
    this.api.getProfile().subscribe({
      next: (profile) => {
        this.profileName.set(profile.greetingName || profile.firstName);
        if (profile.avatarUrl) {
          this.avatarUrl.set(profile.avatarUrl);
        }
      },
      error: () => {
        // Keep the friendly shell defaults when profile data is unavailable.
      },
    });
  }
}
