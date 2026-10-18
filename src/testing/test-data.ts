import { JwtClaims } from '../app/core/models/auth.model';
import { UserResponse } from '../app/core/models/user.model';
import { ClientResponse } from '../app/core/models/client.model';
import { AppointmentResponse } from '../app/core/models/appointment.model';

export const claims: JwtClaims = { sub: 'ana@example.test', userId: 'user-1', role: 'MANAGER', type: 'access', iat: 0, exp: 9999999999 };
export const user: UserResponse = { id: 'user-1', username: 'Ana Silva', email: claims.sub, role: 'MANAGER', active: true, createdAt: '2026-10-18T15:00:00Z' };
export const client: ClientResponse = { id: 'client-1', name: 'Maria Souza', phone: '47999998888', userId: user.id, createdAt: user.createdAt };
export const appointment: AppointmentResponse = { id: 'appointment-1', userId: user.id, clientId: client.id, clientName: client.name, service: 'Consulta', appointmentDate: '2099-10-18', startTime: 'T0900', endTime: 'T1000', createdAt: user.createdAt };
