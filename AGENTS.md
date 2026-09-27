# AGENTS.md

## Project: TimeGrid Frontend

Frontend do TimeGrid, aplicacao de agendamento que consome o backend Spring Boot
em `D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend`.

Atualizado em: 2026-09-27.

## Current Workspace

Root:
`D:\Projetos\Projetos-Java-Spring-Boot\timegrid-frontend`

Backend:
`D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend`

Backend local esperado:
`http://localhost:8080`

Frontend local esperado:
`http://localhost:4200`

## Tech Stack

- Angular 20
- TypeScript 5.9
- Angular standalone components
- Angular zoneless change detection
- Angular SSR configurado pelo scaffold inicial
- Angular Router
- Angular Forms disponivel no projeto
- RxJS
- Tailwind CSS 4 via `@tailwindcss/postcss`
- SCSS

## Current Frontend Structure

Estado inicial do projeto:

- `src/app/app.ts`
- `src/app/app.html`
- `src/app/app.scss`
- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/styles.scss`

Configuracoes importantes:

- `src/styles.scss` importa Tailwind com `@use 'tailwindcss';`
- `app.config.ts` usa `provideZonelessChangeDetection()`
- `app.config.ts` usa `provideRouter(routes)`
- `app.config.ts` usa `provideClientHydration(withEventReplay())`
- `app.routes.ts` ainda esta vazio

## Backend Context

O backend ja esta finalizado para a etapa atual da aula, com:

- API REST em Spring Boot
- JWT access token
- refresh token
- autorizacao por roles
- CORS liberado por padrao para `http://localhost:4200`
- Swagger em `http://localhost:8080/swagger-ui/index.html`
- PostgreSQL local no perfil `dev`
- seed de usuarios, clientes e agendamentos via Flyway

Arquivo de contexto principal do backend:
`D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend\AGENTS.md`

Antes de mudar contratos do front, consultar tambem:

- `timegrid-backend/src/main/java/br/com/jhonnyazevedo/timegrid_backend/auth`
- `timegrid-backend/src/main/java/br/com/jhonnyazevedo/timegrid_backend/user`
- `timegrid-backend/src/main/java/br/com/jhonnyazevedo/timegrid_backend/client`
- `timegrid-backend/src/main/java/br/com/jhonnyazevedo/timegrid_backend/appointment`

## Authentication

Endpoint publico:

```http
POST /auth/login
```

Request:

```json
{
  "email": "john.manager@timegrid.test",
  "password": "123456"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Refresh:

```http
POST /auth/refresh
```

Request:

```json
{
  "refreshToken": "..."
}
```

Todas as rotas protegidas devem enviar:

```http
Authorization: Bearer <accessToken>
```

Regras:

- access token expira em 60 minutos por padrao
- refresh token expira em 24 horas por padrao
- refresh retorna novo access token e mantem o mesmo refresh token ate expirar
- usuario inativo nao consegue fazer login nem refresh

## Roles

Roles atuais:

- `MANAGER`: super usuario/root, acessa todos os endpoints, incluindo criacao de usuarios
- `ADMIN`: acessa rotas autenticadas, exceto criacao de usuarios

Endpoint restrito:

- `POST /users` exige `MANAGER`

Demais endpoints de users, clients e appointments exigem JWT valido.

## API Contracts

### Users

Endpoints:

```http
POST /users
GET /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
PATCH /users/{id}/active?active=true
```

`UserRequest`:

```ts
{
  username: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER';
}
```

`UserResponse`:

```ts
{
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
  active: boolean;
  createdAt: string;
}
```

Observacoes:

- `DELETE /users/{id}` e soft delete, define `active=false`
- `GET /users` lista somente usuarios ativos

### Clients

Endpoints:

```http
POST /users/{userId}/clients
GET /users/{userId}/clients
GET /users/{userId}/clients/{clientId}
PUT /users/{userId}/clients/{clientId}
DELETE /users/{userId}/clients/{clientId}
```

`ClientRequest`:

```ts
{
  name: string;
  phone: string;
}
```

`ClientResponse`:

```ts
{
  id: string;
  name: string;
  phone: string;
  userId: string;
  createdAt: string;
}
```

Observacoes:

- todos os endpoints de cliente usam `userId` no path
- backend valida se o cliente pertence ao usuario informado
- telefone duplicado para o mesmo usuario e bloqueado

### Appointments

Endpoints:

```http
POST /users/{userId}/appointments
GET /users/{userId}/appointments?date=yyyy-MM-dd
PUT /users/{userId}/appointments/{appointmentId}
DELETE /users/{userId}/appointments/{appointmentId}
```

`AppointmentRequest`:

```ts
{
  clientId: string;
  service: string;
  appointmentDate: string;
  startTime: TimeGrid;
  endTime: TimeGrid;
}
```

`AppointmentUpdateRequest`:

```ts
{
  endTime: TimeGrid;
  service: string;
}
```

`AppointmentResponse`:

```ts
{
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
```

Observacoes:

- listagem por data usa `date` em formato ISO, exemplo `2026-10-20`
- criacao exige cliente pertencente ao usuario
- update altera somente `service` e `endTime`
- backend considera horarios encostados como conflito

## TimeGrid Enum

Valores aceitos pelo backend:

```ts
type TimeGrid =
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
```

Na UI, mostrar labels amigaveis como `08:00`, `08:30`, `09:00`, etc., mas enviar
os valores enum (`T0800`, `T0830`) para a API.

## Error Handling

O backend usa tratamento global de excecoes e retorna JSON padronizado.

Erros esperados:

- `400 Bad Request` para regra de negocio e validacao
- `401 Unauthorized` para token ausente/invalido
- `403 Forbidden` para usuario sem permissao
- `404 Not Found` para rota inexistente
- `500 Internal Server Error` para fallback

Ao implementar o front:

- exibir mensagens claras de validacao/regra de negocio
- tratar expiracao de access token com refresh quando possivel
- redirecionar para login se refresh falhar

## Recommended Frontend Direction

Fluxo inicial recomendado:

1. Criar pagina de login.
2. Criar servico de autenticacao.
3. Armazenar access token e refresh token de forma simples para desenvolvimento.
4. Criar interceptor HTTP para `Authorization: Bearer <token>`.
5. Criar models TypeScript para responses/requests do backend.
6. Criar layout autenticado da aplicacao.
7. Criar tela principal de agenda por data.
8. Criar gerenciamento de clientes.
9. Criar criacao/edicao/remocao de agendamentos.
10. Criar gerenciamento de usuarios, respeitando role `MANAGER`.

## Development Rules For Future Agents

1. Manter o front alinhado ao backend atual; nao inventar endpoints.
2. Antes de implementar features que consomem API, conferir os DTOs no backend.
3. Usar tipos TypeScript para requests, responses, roles e `TimeGrid`.
4. Manter valores enviados para horarios como enum do backend.
5. Usar labels amigaveis somente na camada visual.
6. Preservar Angular standalone components e configuracao zoneless.
7. Usar Tailwind 4 ja configurado em `src/styles.scss`.
8. Evitar refatoracoes grandes sem necessidade.
9. Preferir componentes pequenos por feature quando a tela crescer.
10. Implementar autenticacao antes de telas protegidas.
11. Nao colocar tokens hardcoded em codigo.
12. Respeitar CORS esperado: front em `localhost:4200`, backend em `localhost:8080`.
13. Rodar build/testes do Angular apos mudancas relevantes.
14. Para UX, construir a aplicacao real como primeira tela apos login; nao criar landing page.
15. Antes de alterar backend por necessidade do front, confirmar se a mudanca faz sentido para a aula.
