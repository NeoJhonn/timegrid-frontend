import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { managerGuard } from './core/guards/manager.guard';
import { AccessDeniedPage } from './features/access-denied/access-denied.page';
import { AccountPage } from './features/account/account.page';
import { AgendaPage } from './features/agenda/agenda.page';
import { ClientsPage } from './features/clients/clients.page';
import { HistoryPage } from './features/history/history.page';
import { LoginPage } from './features/login/login.page';
import { ShellLayout } from './features/shell/shell.layout';
import { UserCreatePage } from './features/users/user-create.page';
import { WelcomePage } from './features/welcome/welcome.page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
    canActivate: [guestGuard],
  },
  {
    path: 'app',
    component: ShellLayout,
    canActivate: [authGuard],
    children: [
      { path: 'welcome', component: WelcomePage },
      { path: 'account', component: AccountPage },
      { path: 'agenda', component: AgendaPage },
      { path: 'clients', component: ClientsPage },
      { path: 'history', component: HistoryPage },
      { path: 'users/new', component: UserCreatePage, canActivate: [managerGuard] },
      { path: 'access-denied', component: AccessDeniedPage },
      { path: '', pathMatch: 'full', redirectTo: 'welcome' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
