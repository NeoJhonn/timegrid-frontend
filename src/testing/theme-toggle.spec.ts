import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from '../app/shared/theme-toggle.component';
import { ThemeService } from '../app/core/services/theme.service';

@Component({
  imports: [ThemeToggleComponent],
  template: '<header class="shell-header"><app-theme-toggle /></header>',
})
class HeaderThemeHost {}

describe('Header theme toggle regression', () => {
  let previousTheme: string | null;
  let previousStored: string | null;
  let previousScheme: string;
  beforeEach(() => {
    previousTheme = document.documentElement.getAttribute('data-theme');
    previousStored = localStorage.getItem('timegrid-theme');
    previousScheme = document.documentElement.style.getPropertyValue('color-scheme');
    TestBed.configureTestingModule({
      imports: [HeaderThemeHost],
      providers: [provideZonelessChangeDetection()],
    });
  });
  afterEach(() => {
    if (previousTheme === null) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', previousTheme);
    if (previousStored === null) localStorage.removeItem('timegrid-theme');
    else localStorage.setItem('timegrid-theme', previousStored);
    document.documentElement.style.setProperty('color-scheme', previousScheme);
  });

  it('keeps a dark, large sun visible on the light header button', () => {
    TestBed.inject(ThemeService).setTheme('light');
    const fixture = TestBed.createComponent(HeaderThemeHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    const icon = button.querySelector<SVGElement>('svg')!;
    expect(icon.getAttribute('data-theme-icon')).toBe('light');
    const style = getComputedStyle(button);
    // This assertion needs the real global stylesheet, as loaded by ng test.
    expect(style.color).toBe('rgb(15, 23, 42)');
    expect(style.backgroundColor).not.toBe(style.color);
    expect(icon.getBoundingClientRect().width).toBe(34);
    expect(icon.getBoundingClientRect().height).toBe(34);
    expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
  });

  it('cycles all icons and preserves accessible names', () => {
    const service = TestBed.inject(ThemeService);
    service.setTheme('dark');
    const fixture = TestBed.createComponent(HeaderThemeHost);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    for (const theme of ['light', 'violet', 'dark']) {
      button.click();
      fixture.detectChanges();
      expect(button.querySelector('svg')!.getAttribute('data-theme-icon')).toBe(theme);
      expect(button.getAttribute('aria-label')).toContain('Clique para alternar tema.');
      expect(button.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
