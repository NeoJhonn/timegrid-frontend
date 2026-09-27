import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserApiService } from '../../core/services/user-api.service';
import { firstNameFrom } from '../../shared/user-display-name';

@Component({
  selector: 'app-welcome-page',
  imports: [RouterLink],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
})
export class WelcomePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userApi = inject(UserApiService);

  protected readonly user = this.authService.currentUser;
  protected readonly username = signal('');
  protected readonly animationVisible = signal(true);
  protected readonly displayName = computed(() =>
    firstNameFrom(this.username() || this.user()?.sub, 'usuario'),
  );
  protected readonly role = computed(() => this.user()?.role ?? 'ADMIN');

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

  protected hideAnimation(): void {
    this.animationVisible.set(false);
  }
}
