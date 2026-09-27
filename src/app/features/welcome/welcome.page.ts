import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-welcome-page',
  imports: [RouterLink],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
})
export class WelcomePage {
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.currentUser;
  protected readonly email = computed(() => this.user()?.sub ?? 'usuario');
  protected readonly role = computed(() => this.user()?.role ?? 'ADMIN');
}

