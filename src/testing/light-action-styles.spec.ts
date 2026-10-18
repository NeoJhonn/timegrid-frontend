import { Component, CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Exercise the actual global stylesheet without login or production API calls.
@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<app-login-page><button type="submit" disabled>Entrar no TimeGrid</button></app-login-page>
    <article class="appointment-card">
      <button class="text-slate-100">Editar</button>
      <button class="agenda-delete-button">Excluir</button>
    </article>`,
})
class ActionStyleHost {}

describe('Light theme action contrast', () => {
  let previousTheme: string | null;
  beforeEach(() => {
    previousTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    TestBed.configureTestingModule({
      imports: [ActionStyleHost], providers: [provideZonelessChangeDetection()],
    });
  });
  afterEach(() => {
    if (previousTheme === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', previousTheme);
  });
  it('keeps the login action green with dark text, including the disabled state', () => {
    const fixture = TestBed.createComponent(ActionStyleHost); fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const style = getComputedStyle(button);
    expect(style.color).toBe('rgb(0, 0, 0)');
    expect(style.backgroundColor).toBe('rgb(34, 197, 94)');
    expect(style.opacity).toBe('0.8');
    expect(button.disabled).toBeTrue();
  });
  for (const theme of ['dark', 'violet']) {
    it('keeps login text black in ' + theme, () => {
      document.documentElement.setAttribute('data-theme', theme);
      const fixture = TestBed.createComponent(ActionStyleHost); fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]')!;
      expect(getComputedStyle(button).color).toBe('rgb(0, 0, 0)');
    });
  }

  it('distinguishes edit and delete using translucent backgrounds without fading their text', () => {
    const fixture = TestBed.createComponent(ActionStyleHost); fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('article button');
    const edit = getComputedStyle(buttons[0]); const remove = getComputedStyle(buttons[1]);
    expect(edit.color).toBe('rgb(30, 64, 175)');
    expect(edit.backgroundColor).toBe('rgba(37, 99, 235, 0.12)');
    expect(remove.backgroundColor).toBe('rgba(185, 28, 28, 0.88)');
    expect(remove.color).toBe('rgb(255, 255, 255)');
    expect(edit.opacity).toBe('1'); expect(remove.opacity).toBe('1');
  });
});
