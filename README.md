# TimeGrid Frontend

Frontend da aplicacao TimeGrid, desenvolvido com Angular 20 e Tailwind CSS.

O objetivo deste projeto e entregar uma interface moderna, responsiva e elegante
para consumir a API do TimeGrid Backend, permitindo login, cadastro de clientes,
agendamento, consulta de agenda e historico de atendimentos.

## Tecnologias

- Angular 20
- TypeScript
- Angular Router
- Angular Forms
- RxJS
- Tailwind CSS 4
- SCSS

## Projeto Relacionado

Backend:

```text
D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend
```

Frontend:

```text
D:\Projetos\Projetos-Java-Spring-Boot\timegrid-frontend
```

URLs esperadas em desenvolvimento:

```text
Backend:  http://localhost:8080
Frontend: http://localhost:4200
```

## Objetivo do Frontend

O TimeGrid Frontend deve ser a interface principal para o usuario gerenciar sua
rotina de agendamentos.

A primeira tela da aplicacao deve ser a tela de login. Depois da autenticacao,
o usuario deve visualizar uma pagina de boas-vindas com uma animacao marcante,
moderna e coerente com o tema escuro do sistema.

## Requisitos de Interface

- A aplicacao deve ser responsiva.
- Deve funcionar bem em desktops, laptops, tablets e celulares Android/iOS.
- O tema visual deve ser escuro, elegante e com animacoes.
- A experiencia deve parecer uma aplicacao real de agenda, nao uma landing page.
- O menu principal deve ficar dentro de um menu sanduiche.
- Devem existir links rapidos visiveis para:
  - Agenda
  - Historico
  - Cadastro de cliente

## Requisitos Funcionais

- Exibir tela de login como primeira tela da aplicacao.
- Autenticar o usuario consumindo o backend.
- Exibir tela de boas-vindas apos login.
- Permitir cadastro de clientes.
- Exigir que clientes sejam cadastrados antes de criar agendamentos.
- Permitir criacao de agendamentos para clientes cadastrados.
- Permitir consulta da agenda por data.
- Permitir consulta do historico de agendamentos de cada cliente.
- Permitir busca/autocomplete de cliente durante o agendamento.
- Ao digitar as primeiras letras do nome do cliente, sugerir clientes ja cadastrados.
- Quando o cliente nao existir, orientar o usuario a cadastrar o cliente antes do agendamento.

## Fluxo Principal Esperado

1. Usuario acessa o frontend.
2. Aplicacao exibe a tela de login.
3. Usuario informa email e senha.
4. Backend retorna access token e refresh token.
5. Aplicacao exibe uma tela de boas-vindas animada.
6. Usuario acessa agenda, historico ou cadastro de clientes.
7. Usuario cadastra clientes quando necessario.
8. Usuario cria agendamentos somente para clientes existentes.
9. Usuario consulta a agenda e o historico por cliente.

## Integracao com Backend

O backend usa autenticacao JWT.

Endpoint de login:

```http
POST /auth/login
```

Exemplo de request:

```json
{
  "email": "john.manager@timegrid.test",
  "password": "123456"
}
```

Exemplo de response:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Rotas protegidas devem enviar:

```http
Authorization: Bearer <accessToken>
```

Endpoint de refresh:

```http
POST /auth/refresh
```

## Endpoints Principais

Usuarios:

```http
POST /users
GET /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
PATCH /users/{id}/active?active=true
```

Clientes:

```http
POST /users/{userId}/clients
GET /users/{userId}/clients
GET /users/{userId}/clients/{clientId}
PUT /users/{userId}/clients/{clientId}
DELETE /users/{userId}/clients/{clientId}
```

Agendamentos:

```http
POST /users/{userId}/appointments
GET /users/{userId}/appointments?date=yyyy-MM-dd
PUT /users/{userId}/appointments/{appointmentId}
DELETE /users/{userId}/appointments/{appointmentId}
```

## Regras Importantes

- Clientes precisam existir antes de um agendamento ser criado.
- O autocomplete de clientes deve usar a lista de clientes cadastrados do usuario.
- O backend valida se o cliente pertence ao usuario informado.
- Agendamentos sao consultados por data.
- O historico por cliente deve ser construido a partir dos agendamentos vinculados ao cliente.
- Horarios devem ser enviados para a API usando o enum `TimeGrid`.
- Na interface, os horarios devem aparecer em formato amigavel, como `08:00` ou `08:30`.

## Direcao de Implementacao

Ordem sugerida para desenvolver o frontend:

1. Estruturar modelos TypeScript da API.
2. Criar configuracao base de ambiente/API.
3. Criar tela de login.
4. Criar servico de autenticacao.
5. Criar interceptor para enviar o token JWT.
6. Criar rotas publicas e protegidas.
7. Criar layout autenticado com menu sanduiche e links rapidos.
8. Criar tela de boas-vindas animada.
9. Criar cadastro/listagem de clientes.
10. Criar agenda por data.
11. Criar formulario de agendamento com autocomplete de clientes.
12. Criar historico de agendamentos por cliente.

## Como Rodar

Instalar dependencias:

```bash
npm install
```

Subir o servidor de desenvolvimento:

```bash
npm start
```

Acessar:

```text
http://localhost:4200
```

## Build

Gerar build de producao:

```bash
npm run build
```

## Testes

Executar testes:

```bash
npm test
```

## Status Atual

Projeto Angular 20 criado e Tailwind CSS configurado.

Implementacao das telas e integracao com backend ainda nao iniciada.
