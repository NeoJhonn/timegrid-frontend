# TimeGrid Frontend

Interface do TimeGrid, aplicação de gerenciamento de clientes e agendamentos,
desenvolvida com Angular 20 e Tailwind CSS 4 e integrada à API Spring Boot.

O projeto já possui um MVP funcional. O contexto de desenvolvimento e o histórico
das mudanças estão no [AGENTS.md](AGENTS.md).

## Funcionalidades implementadas

- Login com JWT, refresh token e envio automático do token nas requisições.
- Rotas protegidas por autenticação e permissão `MANAGER`.
- Página de boas-vindas e navegação com menu responsivo.
- Agenda por data, com criação, edição e exclusão de agendamentos em modais.
- Busca e autocomplete de clientes durante o agendamento.
- Cadastro, busca, edição e exclusão de clientes, com máscara de telefone.
- Histórico por cliente dentro de uma janela de datas selecionada.
- Página `Minha conta`, com troca de senha mediante validação da senha atual.
- Gerenciamento de usuários ativos para `MANAGER`: cadastro, edição,
  desativação e redefinição de senha.
- Tela de acesso negado e mensagens de validação e erro em português.
- Temas escuro com verde, claro e violeta escuro, com preferência persistida
  no navegador e alternância por um botão no login e no layout autenticado.
- Metadados de título, descrição, idioma `pt-BR`, Open Graph e Twitter summary.

As telas e os modais receberam ajustes de responsividade para desktop, tablet e
celular, incluindo rolagem, quebra de textos longos e áreas de toque.

## Tecnologias

- Angular 20 e TypeScript 5.9.
- Componentes standalone e detecção de mudanças zoneless.
- Angular Router, Angular Forms e RxJS.
- Tailwind CSS 4 via `@tailwindcss/postcss` e SCSS.
- SSR e hidratação configurados pelo scaffold Angular.
- Jasmine e Karma na configuração de testes.

## Branches

- `main`: versão principal, com as alterações aprovadas.
- `dev`: branch de desenvolvimento.

As alterações da `dev` devem ser revisadas em um Pull Request para a `main`
antes de serem integradas.

## Integração com o backend

O endereço da API é definido em `src/app/core/config/api.config.ts`.
Atualmente, o frontend aponta para o backend de produção no Railway:

```text
https://timegrid-backend-production-b8dc.up.railway.app
```

Assim, executar o frontend localmente também utiliza essa API e seus dados.
Para trabalhar com uma API local, ajuste explicitamente `API_BASE_URL` para
`http://localhost:8080` e execute o backend com o perfil `dev`. A seleção de
ambiente não é automática.

O backend fica no projeto relacionado:

```text
D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend
```

### Autenticação e permissões

- `POST /auth/login` recebe `email` e `password` e retorna `accessToken` e
  `refreshToken`.
- `POST /auth/refresh` recebe `refreshToken` e renova o access token.
- Requisições protegidas enviam `Authorization: Bearer <accessToken>`.
- O access token expira em 60 minutos por padrão; o refresh token, em 24 horas.
- Os tokens são armazenados localmente no navegador. Se a renovação falhar,
  a aplicação retorna ao login.
- `MANAGER` possui acesso administrativo, incluindo criação, desativação e reset
  de senha de usuários. `ADMIN` acessa as funcionalidades autenticadas permitidas
  pelo backend. A API é responsável pela autorização final.

### Endpoints principais

Usuários:

```http
POST /users
GET /users
GET /users/{id}
PUT /users/{id}
DELETE /users/{id}
PATCH /users/{id}/active?active=true
PATCH /users/me/password
PATCH /users/{id}/password
```

O update geral envia `username`, `email` e `role`, sem alterar senha.
A troca da própria senha envia `currentPassword` e `newPassword`; o reset
administrativo envia apenas `newPassword`. A exclusão de usuário é lógica
(`active=false`), e a listagem retorna usuários ativos.

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

## Regras de funcionamento

- Um cliente deve estar cadastrado e pertencer ao usuário antes do agendamento.
- Telefones são exibidos com máscara, mas enviados à API somente com dígitos.
- A lista de clientes possui cache em memória por usuário durante a sessão;
  a agenda busca os dados da API ao consultar uma data.
- Os horários usam intervalos de 30 minutos, de `08:00` a `22:00`, e são enviados
  no formato do enum da API, como `T0800` e `T0830`.
- Horários encostados são considerados conflito: após `09:00–10:00`, o próximo
  início permitido é `10:30`.
- A edição de um agendamento altera somente o serviço e o horário final.
- Datas passadas não permitem a criação de novos agendamentos na interface.
- O histórico é montado no frontend a partir das consultas por data e filtrado
  pelo cliente escolhido; não existe um endpoint específico de histórico.

## Rotas

| Rota | Tela |
| --- | --- |
| `/login` | Login |
| `/app/welcome` | Boas-vindas |
| `/app/agenda` | Agenda |
| `/app/clients` | Clientes |
| `/app/history` | Histórico |
| `/app/account` | Minha conta |
| `/app/users/new` | Gerenciamento de usuários (`MANAGER`) |
| `/app/access-denied` | Acesso negado |

## Estrutura principal

```text
src/app/
  core/
    config/          # Endereço da API
    guards/          # Autenticação, visitante e MANAGER
    interceptors/    # Autenticação das requisições
    models/          # Contratos TypeScript da API
    services/        # Autenticação, API, tokens e temas
  features/          # Páginas e layout autenticado
  shared/            # Erros, horários, nomes e seletor de tema
```

## Como executar

Com Node.js e npm compatíveis com Angular 20 instalados, execute na pasta do frontend:

```bash
npm install
npm start
```

Acesse [http://localhost:4200](http://localhost:4200).
No PowerShell, se a execução de `npm.ps1` estiver bloqueada, use `npm.cmd`.

## Build e testes

Gerar o build de produção:

```bash
npm run build
```

Executar os testes configurados com Jasmine/Karma:

```bash
npm test
```

O comando acima mantém os testes em execução e repete a suíte quando os arquivos
mudam. Para uma execução única no Chrome sem interface:

```bash
npm run test:ci
```

Verificar testes e, se passarem, gerar o build de produção:

```bash
npm run verify
```

Gerar o relatório de cobertura em `coverage/`:

```bash
npm run test:coverage
```

É necessário ter Chrome instalado para os comandos headless. Se o Karma não
encontrar o executável, configure `CHROME_BIN` com o caminho da instalação local.
Não são necessárias credenciais, banco ou backend em execução: os testes usam
dados fictícios e respostas HTTP simuladas, sem acessar a API de produção.

A suíte cobre autenticação e renovação de sessão, permissões, agenda, clientes,
login, senha da conta, gerenciamento de usuários, histórico, exibição de nomes,
cache de clientes, contratos HTTP, temas e mensagens de erro. Os novos casos
estão em `src/testing/`, junto de dados fictícios compartilhados; os testes
anteriores permanecem junto dos componentes e do interceptor.

Em 18/10/2026, `npm run verify` passou pelo pipeline padrão: 83 testes aprovados
em ChromeHeadless e build Angular de produção concluído. A suíte inclui regressões
de contraste do seletor de temas, login e ações da agenda com os estilos globais.
Os bloqueios anteriores de execução foram contornados usando `cmd.exe` como shell,
sem alterar a política de execução do PowerShell ou outras configurações de segurança.

Testes de unidade e componentes não substituem a conferência visual em telas
mobile/desktop nem testes completos com o backend. A cada correção de bug,
adicione um caso de regressão quando aplicável e execute a suíte antes de concluir.

## Continuidade

O foco atual é refinar a experiência e validar os fluxos completos com a API:
login, agenda, clientes, histórico, conta e usuários. Os contratos existentes do
backend devem ser preservados. Consulte o `AGENTS.md` antes de novas mudanças,
pois ele também contém registros históricos de etapas já superadas.
