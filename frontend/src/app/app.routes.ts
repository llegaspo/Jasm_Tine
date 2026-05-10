import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { JournalArchive } from './journal-archive/journal-archive';
import { Pomodoro } from './pomodoro/pomodoro';
import { Settings } from './settings/settings';
import { Wellness } from './wellness/wellness';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'wellness', component: Wellness },
  { path: 'journal-archive', component: JournalArchive },
  { path: 'pomodoro', component: Pomodoro },
  { path: 'settings', component: Settings },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
