import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AgendaDatePickerComponent } from './agenda-date-picker.component';

describe('AgendaDatePickerComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AgendaDatePickerComponent],
    providers: [provideZonelessChangeDetection()],
  }));

  it('closes and emits the selected local date immediately, without confirmation', () => {
    const fixture = TestBed.createComponent(AgendaDatePickerComponent);
    fixture.componentRef.setInput('value', '2026-10-15');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('dialog')!;
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.dateSelected.subscribe(selected);
    element.querySelector<HTMLButtonElement>('.trigger')!.click();
    fixture.detectChanges();
    expect(dialog.open).toBeTrue();
    const day = [...element.querySelectorAll<HTMLButtonElement>('.days button')]
      .find(button => button.textContent?.trim() === '20')!;
    day.click();
    expect(dialog.open).toBeFalse();
    expect(selected).toHaveBeenCalledOnceWith('2026-10-20');
  });

  it('navigates across years without changing the date until a day is selected', () => {
    const fixture = TestBed.createComponent(AgendaDatePickerComponent);
    fixture.componentRef.setInput('value', '2026-12-31');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.dateSelected.subscribe(selected);
    element.querySelector<HTMLButtonElement>('.trigger')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[aria-label="Próximo mês"]')!.click();
    fixture.detectChanges();
    expect(selected).not.toHaveBeenCalled();
    element.querySelector<HTMLButtonElement>('.days button')!.click();
    expect(selected).toHaveBeenCalledOnceWith('2027-01-01');
  });
});
