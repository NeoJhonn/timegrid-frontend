export type TimeGrid =
  | 'T0800'
  | 'T0830'
  | 'T0900'
  | 'T0930'
  | 'T1000'
  | 'T1030'
  | 'T1100'
  | 'T1130'
  | 'T1200'
  | 'T1230'
  | 'T1300'
  | 'T1330'
  | 'T1400'
  | 'T1430'
  | 'T1500'
  | 'T1530'
  | 'T1600'
  | 'T1630'
  | 'T1700'
  | 'T1730'
  | 'T1800'
  | 'T1830'
  | 'T1900'
  | 'T1930'
  | 'T2000'
  | 'T2030'
  | 'T2100'
  | 'T2130'
  | 'T2200';

export interface AppointmentRequest {
  clientId: string;
  service: string;
  appointmentDate: string;
  startTime: TimeGrid;
  endTime: TimeGrid;
}

export interface AppointmentUpdateRequest {
  endTime: TimeGrid;
  service: string;
}

export interface AppointmentResponse {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  service: string;
  appointmentDate: string;
  startTime: TimeGrid;
  endTime: TimeGrid;
  createdAt: string;
}

