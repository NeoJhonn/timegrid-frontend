import { Component, computed, input, output, signal } from '@angular/core';
@Component({
  selector: 'app-agenda-date-picker',
  template: `
    <button type="button" class="trigger" aria-haspopup="dialog" (click)="open(calendar)">Data: {{ formattedDate() }} ▦</button>
    <dialog #calendar aria-label="Selecionar data da agenda">
      <div class="heading">
        <button type="button" aria-label="Mês anterior" (click)="move(-1)">‹</button>
        <strong aria-live="polite">{{ monthLabel() }}</strong>
        <button type="button" aria-label="Próximo mês" (click)="move(1)">›</button>
      </div>
      <div class="days">
        @for (label of weekdays; track $index) { <span aria-hidden="true">{{ label }}</span> }
        @for (day of days(); track $index) {
          @if (day) {
            <button type="button" [class.selected]="iso(day) === value()" [attr.aria-label]="dayLabel(day)"
              [attr.aria-current]="iso(day) === value() ? 'date' : null"
              (click)="choose(day, calendar)">{{ day }}</button>
          } @else { <span></span> }
        }
      </div>
      <button type="button" class="close" (click)="calendar.close()">Fechar</button>
    </dialog>`,
  styles: `
    :host { display: block; }
    button { min-height: 44px; border: 1px solid var(--tg-border); border-radius: .5rem; }
    button:focus-visible { outline: 3px solid var(--tg-primary-strong); outline-offset: 2px; }
    button:hover { background: var(--tg-primary-soft); }
    .trigger { width: 100%; height: 48px; padding: 0 1rem; background: var(--tg-panel-strong); color: var(--tg-text-strong); font-size: 1rem; }
    dialog { margin: auto; width: min(22rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--tg-border); border-radius: .75rem; background: var(--tg-background-soft); color: var(--tg-text-strong); box-shadow: 0 24px 70px #0005; }
    dialog::backdrop { background: #0009; }
    .heading { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; gap: .5rem; text-align: center; margin-bottom: .75rem; }
    .days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: .25rem; }
    .days button { padding: 0; }
    .days span { text-align: center; font-size: .8rem; padding: .5rem 0; }
    .days .selected { background: var(--tg-primary); color: #111827; font-weight: 800; }
    .close { width: 100%; margin-top: .75rem; }`,
})
export class AgendaDatePickerComponent {
  readonly value = input.required<string>();
  readonly dateSelected = output<string>();
  protected readonly month = signal(new Date());
  protected readonly weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  protected readonly formattedDate = computed(() => new Intl.DateTimeFormat('pt-BR').format(new Date(`${this.value()}T00:00:00`)));
  protected readonly monthLabel = computed(() => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.month()));
  protected readonly days = computed(() => {
    const date = this.month();
    const offset = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    return [...Array<number>(offset).fill(0), ...Array.from({ length: count }, (_, i) => i + 1)];
  });
  protected open(dialog: HTMLDialogElement): void {
    this.month.set(new Date(`${this.value()}T00:00:00`));
    dialog.showModal();
  }
  protected move(offset: number): void {
    const date = this.month();
    this.month.set(new Date(date.getFullYear(), date.getMonth() + offset, 1));
  }
  protected iso(day: number): string {
    const date = this.month();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  protected dayLabel(day: number): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(`${this.iso(day)}T00:00:00`));
  }
  protected choose(day: number, dialog: HTMLDialogElement): void {
    dialog.close();
    this.dateSelected.emit(this.iso(day));
  }
}
