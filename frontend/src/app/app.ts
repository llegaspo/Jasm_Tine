import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
export class App {
  protected readonly navigationItems: readonly NavigationItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Wellness', icon: 'spa', route: '/wellness' },
    { label: 'Pomodoro', icon: 'timer', route: '/pomodoro' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];
}
