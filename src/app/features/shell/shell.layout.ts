import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
export class ShellLayout {
  private readonly authService = inject(AuthService);

  protected readonly menuOpen = signal(false);
  protected readonly user = this.authService.currentUser;
  protected readonly displayName = computed(() => this.user()?.sub ?? 'Usuario');
  protected readonly role = computed(() => this.user()?.role ?? 'ADMIN');

  protected readonly quickLinks: QuickLink[] = [
    { label: 'Agenda', path: '/app/agenda', symbol: 'A' },
    { label: 'Historico', path: '/app/history', symbol: 'H' },
    { label: 'Cliente', path: '/app/clients', symbol: 'C' },
  ];

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

