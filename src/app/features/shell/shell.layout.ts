import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
import { firstNameFrom } from '../../shared/user-display-name';

interface QuickLink {
  label: string;
  path: string;
  symbol: string;
}

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.layout.html',
  styleUrl: './shell.layout.scss',
})
export class ShellLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userApi = inject(UserApiService);

  protected readonly menuOpen = signal(false);
  protected readonly username = signal('');
  protected readonly user = this.authService.currentUser;
  protected readonly displayName = computed(() =>
    firstNameFrom(this.username() || this.user()?.sub, 'Usuario'),
  );
  protected readonly role = computed(() => this.user()?.role ?? 'ADMIN');
  protected readonly isManager = computed(() => this.role() === 'MANAGER');

  protected readonly quickLinks: QuickLink[] = [
    { label: 'Agenda', path: '/app/agenda', symbol: 'A' },
    { label: 'Historico', path: '/app/history', symbol: 'H' },
    { label: 'Cliente', path: '/app/clients', symbol: 'C' },
  ];

  protected readonly managerLink: QuickLink = {
    label: 'Novo usuario',
    path: '/app/users/new',
    symbol: 'U',
  };

  ngOnInit(): void {
    const userId = this.user()?.userId;

    if (!userId) {
      return;
    }

    this.userApi.findById(userId).subscribe({
      next: (user) => this.username.set(user.username),
      error: () => this.username.set(''),
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
