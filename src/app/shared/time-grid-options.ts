import { TimeGrid } from '../core/models/appointment.model';

export interface TimeGridOption {
  value: TimeGrid;
  label: string;
}

export const TIME_GRID_OPTIONS: TimeGridOption[] = [
  { value: 'T0800', label: '08:00' },
  { value: 'T0830', label: '08:30' },
  { value: 'T0900', label: '09:00' },
  { value: 'T0930', label: '09:30' },
  { value: 'T1000', label: '10:00' },
  { value: 'T1030', label: '10:30' },
  { value: 'T1100', label: '11:00' },
  { value: 'T1130', label: '11:30' },
  { value: 'T1200', label: '12:00' },
  { value: 'T1230', label: '12:30' },
  { value: 'T1300', label: '13:00' },
  { value: 'T1330', label: '13:30' },
  { value: 'T1400', label: '14:00' },
  { value: 'T1430', label: '14:30' },
  { value: 'T1500', label: '15:00' },
  { value: 'T1530', label: '15:30' },
  { value: 'T1600', label: '16:00' },
  { value: 'T1630', label: '16:30' },
  { value: 'T1700', label: '17:00' },
  { value: 'T1730', label: '17:30' },
  { value: 'T1800', label: '18:00' },
  { value: 'T1830', label: '18:30' },
  { value: 'T1900', label: '19:00' },
  { value: 'T1930', label: '19:30' },
  { value: 'T2000', label: '20:00' },
  { value: 'T2030', label: '20:30' },
  { value: 'T2100', label: '21:00' },
  { value: 'T2130', label: '21:30' },
  { value: 'T2200', label: '22:00' },
];

export function timeGridLabel(value: TimeGrid): string {
  return TIME_GRID_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

