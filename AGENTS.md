# AGENTS.md

## Project: TimeGrid Frontend

Frontend do TimeGrid, aplicacao de agendamento que consome o backend Spring Boot
em `D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend`.

Atualizado em: 2026-10-26.

## Contexto mais recente - Botões de clientes e usuários no tema claro (2026-10-26)

- Ações Editar e Remover/Excluir nos cartões de clientes e usuários recebem
  classes específicas e compartilham as regras visuais dos botões da agenda:
  azul suave para edição, vermelho suave para remoção, bordas e sombras discretas,
  com texto escuro, hover e foco visível. Aplicação restrita ao tema claro.
- Testes dos componentes reais verificam fundo, texto, borda e sombra nas duas
  páginas; também verificam fundo original transparente nos temas escuro/violeta.
- Validação: 111 testes ChromeHeadless e build de produção aprovados. Permanece
  aviso de tamanho do pacote inicial acima de 500 kB. Sem conferência visual
  autenticada no localhost nesta etapa.
- Backend não alterado. Nenhum commit ou push. Sugestão:
  `style: unify light theme client and user action buttons`.

## Contexto anterior - Contraste do aviso de cliente não cadastrado (2026-10-26)

- Aviso no modal de agendamento recebeu classe específica. No tema claro usa
  fundo creme, texto marrom-escuro, borda âmbar e link escuro sublinhado, com
  foco visível. Regras restritas ao aviso no tema claro.
- Teste com o componente real abre o modal, pesquisa cliente inexistente e
  verifica cores calculadas do aviso/link e destino de cadastro de clientes.
- Validação: 105 testes ChromeHeadless e build de produção aprovados. Permanece
  aviso de tamanho do pacote inicial: 500,87 kB para limite de aviso de 500 kB.
  Não realizada conferência visual autenticada no localhost nesta etapa.
- Backend não alterado. Nenhum commit ou push executado. Sugestão:
  `fix: improve missing client notice contrast in light theme`.

Preferência de idioma: novos registros e atualizações de contexto neste arquivo,
incluindo títulos, devem ser escritos em português. Manter mensagens sugeridas
de commit em inglês, seguindo Conventional Commits. Nomes técnicos de arquivos,
comandos e identificadores permanecem como no código.

## Contexto mais recente - Correção de atualização de páginas na Vercel (2026-10-18)

- Relato de 404 ao atualizar página publicada. Build atual gera apenas
  `browser/index.csr.html`, sem arquivos HTML por rota; faltava fallback do host
  após a mudança para RenderMode.Client. A correção anterior estava incompleta
  quanto à hospedagem estática; ng serve não reproduz essa falta de configuração.
- Adicionado vercel.json: build npm run build, publicação de dist/timegrid-frontend/browser,
  framework null para hospedagem estática explícita e rewrite de rotas para
  /index.csr.html. Arquivos existentes têm precedência segundo documentação Vercel.
  Rewrite mantém a URL original e seus query parameters para o Angular.
- 104 testes ChromeHeadless e build aprovados (aviso existente de bundle 448 bytes
  acima de 500 kB). Checados fallback gerado, correspondência das rotas principais,
  bundles JS/CSS, tema inicial e imagem social. Sem deploy ou validação do edge Vercel.
- Após commit/push do usuário, aguardar novo deploy e conferir refresh nas rotas
  autenticadas. Backend não alterado; nenhum commit/push executado.
- Sugestão: `fix: configure Vercel fallback for page refreshes`.

## Previous Checkpoint - Matching edit and delete styling (2026-10-18)

- Botão Excluir no card da agenda em tema claro agora acompanha o estilo do
  Editar: fundo vermelho a 12%, texto vermelho-escuro, borda vermelha a 40% e
  sombra vermelha discreta. Hover a 20%. Substitui o ajuste anterior de alpha 0.8.
- Teste existente verifica fundo, texto, borda, sombra e opacidade integral do texto.
- 104 testes ChromeHeadless e build aprovados; permanece aviso de bundle inicial
  acima de 500 kB. Sem conferência visual autenticada no localhost nesta etapa.
- Backend não alterado. Sem commit/push. Sugestão:
  `style: match agenda delete button to subtle edit styling`.

## Previous Checkpoint - Softer agenda delete background (2026-10-18)

- Fundo vermelho do botão Excluir no card da agenda em tema claro suavizado:
  alpha de 0.88 para 0.8, mantendo o texto branco totalmente opaco.
- Teste de estilo existente atualizado; 104 testes ChromeHeadless aprovados e
  build de produção concluído com o aviso já existente de bundle acima de 500 kB.
  Sem conferência visual no localhost nesta etapa. Backend não alterado.
- Nenhum commit/push. Sugestão: `style: soften agenda delete button background`.

## Previous Checkpoint - Preserve agenda date on refresh (2026-10-18)

- Agenda passa a registrar a data selecionada no query parameter `date`, com
  replaceUrl e preservação dos demais parâmetros. Reload restaura a data antes
  da consulta inicial e mantém formulário/calendário sincronizados.
- Mudanças de query params são acompanhadas com assinatura encerrada no destroy.
  Valores ausentes/inválidos (inclusive dias inexistentes) usam a data de hoje.
- Não existe redirecionamento da agenda para welcome nas rotas atuais. O ajuste
  anterior RenderMode.Client deve estar publicado para evitar o redirect de login
  pré-renderizado para welcome durante reload; não foi reproduzido em produção.
- Novos testes de deep link, troca de data/URL, atualização dos parâmetros e datas
  inválidas. 104 testes ChromeHeadless aprovados; build de produção aprovado
  com aviso de bundle inicial 392 bytes acima do orçamento de aviso de 500 kB.
  Não realizado gesto pull-to-refresh em celular real nesta etapa.
- Backend não alterado, nenhum commit/push. Sugestão:
  `fix: preserve agenda date when refreshing the page`.

## Previous Checkpoint - Logout confirmation (2026-10-18)

- Removidos fundo e borda vermelhos permanentes da ação Sair da conta no drawer.
  Mantidos contraste do texto, badge vermelho e feedback de hover/foco.
- A ação agora abre um dialog nativo com a pergunta de confirmação, Cancelar e
  Sair da conta. Cancelar/Escape preservam a sessão; somente confirmar fecha o
  menu e executa o logout. Modal com rótulo/descrição acessíveis, foco inicial no
  Cancelar e contenção de foco/backdrop pelo dialog nativo.
- Testes nos três temas verificam fundo transparente, contraste, abertura,
  cancelamento sem logout e confirmação com fechamento do drawer.
- Validação: 100 testes ChromeHeadless e build de produção aprovados.
  Sem conferência visual autenticada no localhost nesta etapa.
- Somente frontend alterado; sem commit ou push. Sugestão:
  `feat: confirm logout before ending the session`.

## Previous Checkpoint - Initial theme and session rendering (2026-10-18)

- Adicionado `public/theme-init.js`, carregado de forma síncrona no head antes
  dos estilos e do Angular. Restaura o tema salvo validado, color-scheme e fundo
  inicial; usa escuro para valor ausente/inválido ou storage indisponível.
  O fundo usa variável CSS para continuar acompanhando a troca de tema.
- Rotas alteradas de Prerender para RenderMode.Client. Os tokens estão no
  localStorage: os guards agora decidem a primeira tela no navegador, sem HTML
  de login pré-renderizado que seria substituído após restaurar a sessão.
  A URL protegida é preservada quando a sessão é válida; sessão expirada vai ao login.
- Metadados Open Graph/Twitter preservados no HTML inicial. As telas passam a
  depender do JavaScript para renderizar conteúdo, adequado ao estado de sessão local.
- Adicionados 10 testes de inicialização: temas antes do app, fallback, navegação
  com access/refresh válidos e expiração, sem instanciar login durante restauração.
- `npm.cmd run verify` aprovado: 100 testes ChromeHeadless e build de produção.
  Conferidos HTML de produção, cópia do script e metadados. Não realizada
  conferência visual de reload com sessão autenticada real nesta etapa.
- Backend não alterado. Nenhum commit ou push. Sugestão:
  `fix: restore saved theme and session before initial render`.

## Previous Checkpoint - Logout and login contrast (2026-10-18)

- Ação Sair da conta do drawer recebeu fundo vermelho suave, borda e foco visível.
  Texto vermelho-escuro no tema claro e vermelho-claro nos temas escuro/violeta;
  badge S com fundo vermelho vivo e letra branca nos três temas.
- Texto do botão Entrar no TimeGrid definido como preto nos três temas, mantendo
  o fundo e o comportamento de validação/submissão existentes.
- Novos testes em `src/testing/logout-contrast.spec.ts`: cor do texto/badge e
  execução do logout nos três temas. Testes de estilos do login atualizados para
  exigir texto preto também nos temas escuro e violeta.
- `npm.cmd run verify` aprovado: 90 testes ChromeHeadless e build de produção.
  Sem conferência visual autenticada no localhost nesta etapa; teste usa o
  componente real, CSS global e serviços simulados, sem chamadas à produção.
- Preservadas as alterações anteriores ainda não commitadas, incluindo o olho
  da senha. Backend não alterado. Nenhum commit ou push executado. Sugestão:
  `fix: improve logout visibility and login button text contrast`.

## Previous Checkpoint - Login password eye icon (2026-10-18)

- Substituídos os textos Mostrar/Ocultar no campo de senha do login por SVGs:
  olho fechado enquanto a senha está oculta; olho aberto quando está visível.
- Botão com largura de 48px, ícone de 24px, foco visível, aria-label dinâmico,
  aria-pressed e aria-controls. A ação continua type=button, sem enviar o login.
- Teste `src/testing/login-password.spec.ts` verifica estado inicial, alternância
  dos ícones/tipo de input, preservação da senha, rótulos e ausência de submissão.
- Validação: `npm.cmd run verify` aprovado com 85 testes e build de produção.
  Não foi realizada conferência visual no localhost nesta etapa.
- Backend não alterado. Nenhum commit ou push. Sugestão:
  `feat: replace login password text toggle with eye icons`.

## Previous Checkpoint - Light theme hamburger contrast (2026-10-18)

- Corrigido botão `Abrir menu` do cabeçalho no tema claro: fundo claro e
  `color: #334155` (cinza-escuro), herdado pelos três risquinhos via `bg-current`.
- Regra restrita ao botão do menu no tema claro; navegação, seletor de temas e
  temas escuro/violeta preservados.
- Adicionado `src/testing/shell-menu.spec.ts`, usando ShellLayout e CSS global reais.
  O teste reproduziu branco sobre branco antes da correção e passou depois; também
  verifica presença das três barras e abertura/fechamento do menu.
- Validação: `npm.cmd run verify` aprovado, com 84 testes ChromeHeadless e build de
  produção concluído. Nenhuma chamada à API de produção ou alteração no backend.
- Não foi realizado login/validação visual do menu autenticado no localhost nesta
  etapa; o cenário foi validado pelo teste do componente real no navegador headless.
- Nenhum commit ou push executado. Sugestão:
  `fix: restore hamburger menu contrast in light theme`.

## Context Checkpoint

Este arquivo reúne o contexto atual do projeto e o histórico de recuperação após
uma falha na conversa anterior da API. As seções de recuperação de 2026-10-01
são registros históricos; o checkpoint abaixo reflete a situação em 2026-10-11.

Importante:

- O backend nao deve ser tratado como area ativa de trabalho nesta etapa.
- O backend ja estava pronto em outra conversa e fica neste workspace apenas para
  consulta de contratos e para rodar localmente junto com o frontend.
- O foco atual e exclusivamente o frontend em `timegrid-frontend`.
- As correções de responsividade foram aprovadas e publicadas na `main` no commit
  `39b59fc` (`fix: improve responsive layouts across TimeGrid frontend`).
- O desenvolvimento segue na `dev`, com revisão por Pull Request para a `main`.
- O PR #1 (`dev` → `main`) integrou a documentação das branches no commit
  `57df7c5`. O PR #2 (`main` → `dev`) sincronizou a `dev` no commit `0745fb1`.
- Antes desta atualização de contexto, o workspace estava limpo; `main` e `dev`
  tinham o mesmo conteúdo, com histórico de merges diferente.
- Preferencia do usuario: sempre que uma alteracao for feita no frontend, atualizar
  tambem este `AGENTS.md` com o contexto/checkpoint da mudanca, sem precisar pedir
  confirmacao antes.

## Current Workspace

Root:
`D:\Projetos\Projetos-Java-Spring-Boot\timegrid-frontend`

Backend:
`D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend`

Backend local esperado:
`http://localhost:8080`

Frontend local esperado:
`http://localhost:4200`

Ambiente Kosuke:

- Workspace: `/app/project`, com trabalho atual na branch `dev`.
- Apenas o frontend está em execução; o backend Spring Boot não está disponível
  neste sandbox. Os caminhos Windows acima se referem ao ambiente local do usuário.
- A configuração de execução válida fica em `/tmp/kosuke.config.json`, fora do
  repositório. O Angular usa a porta 4200 e permite o hostname específico do Preview,
  calculado em cada sandbox, mantendo a verificação de hosts ativa.
- Os testes anteriores das telas internas no Preview usaram dados fictícios isolados
  no navegador e não validaram a integração real com o backend.

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

## Current Frontend Status

O frontend ja deixou de ser scaffold inicial e tem um MVP funcional com:

- login com JWT e refresh token
- armazenamento local simples de tokens para desenvolvimento
- interceptor HTTP para `Authorization: Bearer <token>`
- guards de autenticacao, visitante e permissao `MANAGER`
- layout autenticado com menu responsivo
- pagina inicial autenticada
- agenda por data
- criacao, edicao e remocao de agendamentos
- gerenciamento de clientes
- historico
- tela de acesso negado
- gerenciamento de usuarios restrito a `MANAGER`
- pagina de conta do usuario logado

Configuracoes importantes continuam validas:

- `src/styles.scss` importa Tailwind com `@use 'tailwindcss';`
- `app.config.ts` usa `provideZonelessChangeDetection()`
- `app.config.ts` usa `provideRouter(routes)`
- `app.config.ts` usa `provideClientHydration(withEventReplay())`

Rotas atuais principais:

- `/login`
- `/app/welcome`
- `/app/agenda`
- `/app/clients`
- `/app/history`
- `/app/account`
- `/app/users/new`, protegida por `managerGuard`
- `/app/access-denied`

Arquivos centrais do frontend:

- `src/app/core/config/api.config.ts`
- `src/app/core/interceptors/auth.interceptor.ts`
- `src/app/core/guards/auth.guard.ts`
- `src/app/core/guards/guest.guard.ts`
- `src/app/core/guards/manager.guard.ts`
- `src/app/core/services/auth.service.ts`
- `src/app/core/services/token-storage.service.ts`
- `src/app/core/services/user-api.service.ts`
- `src/app/core/services/client-api.service.ts`
- `src/app/core/services/appointment-api.service.ts`
- `src/app/shared/api-error-message.ts`
- `src/app/shared/time-grid-options.ts`
- `src/app/shared/user-display-name.ts`

## Backend Context

O backend ja esta finalizado para a etapa atual da aula e nao foi alterado nesta
recuperacao. Ele serve como contrato de API para o front, com:

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

Direcao atual:

1. Preservar os contratos existentes do backend.
2. Continuar lapidando UX e responsividade das telas ja criadas.
3. Validar manualmente fluxo completo com backend local: login, agenda, clientes,
   conta e usuarios.
4. Trabalhar na `dev` e submeter alterações à `main` por Pull Request, conforme
   autorização do usuário; conferir o estado remoto antes de iniciar novas mudanças.
5. Evitar mexer no backend salvo, exceto se o usuario pedir explicitamente.
6. Ao finalizar qualquer mudanca no frontend, registrar o que mudou neste arquivo.

## Recovered Worktree State On 2026-10-01

Backend:

- `timegrid-backend` estava limpo no Git.
- `mvn test` passou com sucesso: 73 testes, 0 falhas.
- Backend nao foi modificado.

Frontend:

- `npm.cmd run build` passou com sucesso.
- Havia alteracoes locais recuperadas, ainda nao commitadas.
- Arquivos modificados:
  - `src/app/app.routes.ts`
  - `src/app/core/services/user-api.service.ts`
  - `src/app/features/agenda/agenda.page.html`
  - `src/app/features/agenda/agenda.page.scss`
  - `src/app/features/agenda/agenda.page.ts`
  - `src/app/features/shell/shell.layout.ts`
  - `src/app/features/users/user-create.page.html`
  - `src/app/features/users/user-create.page.ts`
- Pasta nova nao rastreada:
  - `src/app/features/account/`

Resumo do que as alteracoes locais fazem:

- adicionam rota e menu de `Conta`
- adicionam tela `Minha conta` com dados do usuario logado e formulario de senha
- expandem `UserApiService` com `update` e `delete`
- transformam a tela de usuarios em gerenciamento de usuarios ativos
- adicionam listagem, edicao e exclusao/desativacao de usuarios para `MANAGER`
- melhoram a agenda com modal de criar agendamento por horario
- adicionam edicao e exclusao de agendamentos
- calculam horarios ocupados e opcoes de termino disponiveis na UI

## Recovered Conversation Notes From Previous Thread

O usuario conseguiu copiar parte da conversa anterior, com detalhes de UX que nao
aparecem claramente so pelo diff. Esses pontos devem orientar a continuidade:

- Na agenda em mobile, o usuario pediu para reaproveitar os efeitos bonitos de hover
  feitos nos cards da versao desktop, mas adaptados para toque.
- Foi implementado feedback de toque nos cards e botoes da agenda:
  - `active:scale` para sensacao de pressionar
  - leve realce de fundo ao tocar
  - hover mantido para desktop
  - `npm.cmd run build` passou depois dessa etapa
- No modal de novo agendamento, o usuario pediu destaque maior para o botao
  `Confirmar agendamento`, deixando `Cancelar` e acoes secundarias mais discretas.
- O botao `Confirmar agendamento` foi aumentado, ganhou fonte mais forte, verde mais
  vivo, sombra e feedback de hover/toque.
- Em seguida, o usuario achou o verde ainda apagado. O botao foi ajustado para alto
  contraste, com fundo claro/branco e hover verde claro.
- Tambem foi pedido que o formulario de agendamento nao falhasse silenciosamente.
  Ao clicar em confirmar sem preencher campos obrigatorios, deve aparecer a mensagem:
  `Preencha todos os campos obrigatorios para confirmar o agendamento.`
- Campos obrigatorios vazios no modal de agendamento devem ficar com borda vermelha
  apos a tentativa de envio.
- Depois desses ajustes de validacao visual no modal, `npm.cmd run build` passou.
- Ultimo pedido antes da conversa cair:
  - adicionar efeito hover/toque suave nos horarios livres da agenda, mesmo antes de
    abrir/agendar
  - fazer uma revisao ortografica dos textos visiveis do frontend todo
- A conversa caiu depois de o assistente anterior dizer que iria iniciar essa varredura
  de hover/toque nos horarios livres e correcao ortografica. Portanto, antes de assumir
  que essa ultima etapa foi concluida, conferir o diff atual e os textos visiveis.

Observacao importante:

- O backend atual aceita `PUT /users/{id}` com `username`, `email`, `password` e `role`.
- Ainda nao existe no contrato do backend um campo `currentPassword`.
- As telas recuperadas possuem campos visuais de senha atual em conta/edicao, mas esse
  valor nao e enviado pela API atual. Antes de tratar isso como regra de negocio,
  decidir se a UI deve remover esse campo ou se o backend recebera um endpoint proprio
  de troca de senha.

## Frontend Change Log

### 2026-10-01 - Agenda end-time selector

- Corrigido problema no modal de agendamento em que o dropdown nativo de `Horario fim`
  podia ficar cortado no final da tela, dificultando selecionar o ultimo horario
  (`22:00`).
- O `select` nativo de horario final foi substituido por uma grade rolavel de botoes
  dentro do proprio modal.
- A mesma solucao foi aplicada ao modal de edicao de agendamento para manter o padrao.
- Foram adicionados metodos em `agenda.page.ts` para definir `endTime` nos formularios
  de criacao e edicao marcando o campo como tocado.
- Ajuste posterior do usuario: os horarios finais devem aparecer um embaixo do outro,
  como um dropdown vertical rolavel, tanto no desktop quanto no mobile.

### 2026-10-02 - Account password modal

- A pagina `Minha conta` foi simplificada para exibir os dados da conta em um card
  unico, sem o card fixo lateral de atualizacao de senha.
- A acao de senha agora fica em um botao `Alterar senha` abaixo dos dados da conta.
- O formulario de senha foi movido para um modal, deixando a pagina mais limpa.
- Ao atualizar a senha com sucesso, o modal fecha, o formulario e limpo e a mensagem
  de sucesso aparece na pagina da conta.

### 2026-10-02 - Client form validation and phone mask

- A tela de clientes agora mostra validacao visual por campo quando o usuario tenta
  cadastrar ou editar com `Nome` ou `Telefone` invalidos.
- O telefone recebe mascara durante a digitacao no formato `(DD) 00000-0000` ou
  `(DD) 0000-0000`, aceitando 10 ou 11 digitos.
- A lista de clientes exibe telefones formatados.
- Ao salvar, o frontend remove a mascara e envia somente os digitos para o backend.

### 2026-10-02 - Client form modal

- A pagina de clientes foi simplificada para priorizar a listagem e busca de clientes.
- O card fixo de cadastro/edicao foi removido da tela principal.
- A acao `Cadastrar cliente` agora fica em um botao no topo da pagina.
- O formulario de cadastro e edicao de cliente abre em um modal reutilizando as mesmas
  validacoes e mascara de telefone.

### 2026-10-02 - Past-date scheduling guard

- A agenda agora trata data passada como somente leitura para criacao de novos
  agendamentos.
- Quando a data selecionada e anterior a data local de hoje, os horarios livres deixam
  de exibir o botao `Agendar` e mostram um indicador discreto de `Data passada`.
- A protecao tambem existe no componente: o modal de novo agendamento nao abre para
  data passada e o submit exibe mensagem caso seja acionado indevidamente.
- A comparacao usa data local no formato `yyyy-MM-dd`, evitando diferenca por UTC/fuso.

### 2026-10-02 - User management create modal

- A tela de gerenciamento de usuarios foi simplificada para priorizar a conta logada
  e a lista de usuarios ativos.
- O formulario fixo de cadastro de usuario foi movido para um modal aberto pelo botao
  `Cadastrar usuario`.
- A validacao de e-mail ja existia via `Validators.email`; agora ela tambem aparece
  visualmente no cadastro e na edicao com mensagem `Informe um e-mail valido.`
- Campos obrigatorios de nome, e-mail e senha inicial exibem mensagens no modal de
  cadastro quando o usuario tenta salvar sem preencher corretamente.

### 2026-10-02 - Form submit trimming

- Antes de validar/enviar formularios principais, o frontend agora remove espacos no
  inicio e no fim de campos textuais.
- Aplicado em login, cadastro/edicao de usuarios, cadastro/edicao de clientes,
  criacao/edicao de agendamentos e alteracao de senha da conta.
- A normalizacao acontece antes da validacao para que campos preenchidos apenas com
  espacos sejam tratados como invalidos.
- Telefone continua sendo salvo somente com digitos; a mascara fica apenas na UI.

### 2026-10-02 - Client list cache

- `ClientApiService` agora mantém um cache em memória da lista de clientes por `userId`.
- Chamadas repetidas a `list(userId)` reutilizam os clientes já carregados durante a
  sessão da aplicação, evitando novas idas ao backend para autocomplete/listagens.
- O cache é atualizado quando um cliente é criado ou editado e remove o cliente quando
  ele é excluído.
- O cache não é persistido em `localStorage`; ao recarregar a página, a lista é buscada
  novamente.
- A agenda por data não foi cacheada de propósito: ao trocar a data, a tela deve buscar
  os agendamentos atuais daquela data no backend.

### 2026-10-02 - Blank login form

- Removidos os valores fixos de desenvolvimento do formulario de login.
- Os campos de e-mail e senha agora iniciam em branco ao abrir a tela de login.

### 2026-10-02 - Login submit button state

- Corrigido o estado do botao de login apos remover os valores padrao.
- O botao usava um `computed()` lendo `form.valid`, mas Reactive Forms nao expõe esse
  estado como signal; com campos vazios iniciais, o botao podia permanecer desabilitado
  mesmo apos preencher e-mail e senha.
- `canSubmit` agora e um metodo que lê o estado atual do formulario e do loading.

### 2026-10-02 - Agenda header cleanup

- O cabecalho da agenda foi simplificado.
- Removidos o eyebrow `Agenda`, o titulo `Agenda por horarios` e a descricao auxiliar.
- A tela agora exibe apenas um titulo grande `Agenda` no card superior, mantendo o date
  picker e o restante da experiencia sem mudancas.

### 2026-10-03 - Client delete confirmation

- A remocao de clientes na pagina `Base de clientes` agora exige confirmacao em modal.
- O clique em `Remover` abre uma mensagem com o nome do cliente e avisa que a acao nao
  pode ser desfeita.
- A exclusao so e enviada para o backend quando o usuario confirma em `Remover cliente`.

### 2026-10-03 - Blank history initial state

- A pagina `Historico` nao seleciona mais automaticamente o primeiro cliente carregado.
- Ao abrir a tela, o campo de cliente fica em branco e nenhum historico e buscado.
- O painel de resultados orienta o usuario a digitar ou escolher um cliente antes de
  carregar registros.
- O botao `Atualizar` fica desabilitado enquanto nao houver cliente selecionado.
- O autocomplete de cliente no historico so abre sugestoes depois que o usuario digita
  algum texto, evitando mostrar os primeiros clientes apenas ao focar o campo.
- Os botoes de janela do historico agora destacam visualmente o periodo selecionado
  conforme `daysBack` e `daysForward`, em vez de deixar `30 + 30` fixo.

### 2026-10-03 - Mobile menu logout visibility

- O menu sanduiche do layout autenticado agora usa altura dinamica (`h-dvh`) e layout
  em coluna para funcionar melhor em viewports mobile como Galaxy A55.
- A navegacao interna do menu ganhou rolagem propria quando faltar espaco vertical.
- O botao `Sair da conta` deixou de ficar posicionado de forma absoluta no rodape e
  passou a ficar no fluxo do drawer, respeitando `safe-area-inset-bottom`.
- Ajuste posterior: o drawer passou a usar classes proprias em SCSS com grid
  `auto / minmax(0, 1fr) / auto`, mantendo o rodape de logout sempre visivel e
  deixando somente a lista de navegacao rolar.
- Ajuste final apos teste no Galaxy A55: o botao `Sair da conta` foi movido para o
  topo do drawer, logo abaixo do cabecalho, garantindo que apareca assim que o menu
  sanduiche abrir no mobile.
- Refinamento posterior: para ficar mais natural, `Sair da conta` passou a ser o ultimo
  item da lista de navegacao do menu; para `MANAGER`, aparece depois de `Gerenciar
  usuarios`, e para `ADMIN`, depois de `Conta`.

### 2026-10-03 - User password validation

- O cadastro de usuarios agora exige senha com no minimo 8 caracteres, pelo menos uma
  letra maiuscula e uma letra minuscula.
- A mesma regra foi aplicada ao campo `Nova senha` no modal de edicao de usuario.
- A tela exibe mensagens especificas de validacao para senha obrigatoria ou fraca.
- O campo visual `Senha atual` foi removido da edicao de usuario porque o backend atual
  nao recebe nem valida `currentPassword`; a tela mantem apenas `Nova senha` ate existir
  um endpoint proprio de troca de senha.
- O botao `Salvar alteracoes` do modal de edicao de usuario ganhou mais destaque visual,
  altura alinhada ao `Cancelar`, texto branco e verde mais forte.
- Ajuste posterior: o botao `Salvar alteracoes` passou a reutilizar o tratamento verde
  vivo aprovado na Agenda (`bg-emerald-400`, texto escuro, hover `emerald-300` e sombra).
- Ao tentar salvar a edicao de usuario com `Nova senha` vazia, a tela agora marca o
  campo e exibe a mensagem `Informe a nova senha.`.

### 2026-10-03 - Login column balance

- A tela de login passou a usar duas colunas iguais no desktop (`lg:grid-cols-2`) para
  deixar o card de acesso visualmente mais centralizado e equilibrado em relacao as
  laterais.
- Ajuste posterior no mobile: o bloco do formulario agora usa largura explicita
  `w-[calc(100vw-2rem)]`, `mx-auto` e `max-w-md`, evitando depender do padding lateral
  do container para parecer centralizado em viewports como Galaxy A55.

### 2026-10-05 - Mobile viewport spacing

- O layout autenticado ganhou mais padding inferior em mobile/tablet para evitar que o
  final das paginas fique encoberto ou apertado em viewports menores.
- A tela de login passou a usar `min-h-dvh` e alinhar o card no topo no mobile
  (`items-start`, `pt-6`), mantendo centralizacao vertical somente no desktop.
- O padding inferior mobile do layout autenticado foi reforcado para o preset Galaxy
  A55 do DevTools (`14rem` no mobile base e `10rem` em `sm`).
- A animacao orbital da pagina de boas-vindas foi removida temporariamente para reduzir
  poluicao visual e evitar sobreposicao com o conteudo principal.
- Os modais de criacao e edicao de agendamento agora usam altura maxima baseada em
  `100dvh`, rolagem interna e lista de horarios finais mais compacta no mobile, deixando
  os botoes de acao acessiveis no preset Galaxy A55.
- Ajuste posterior: os modais de agendamento passaram a usar `100svh` e rodape de acoes
  sticky dentro do formulario, mantendo `Confirmar agendamento`/`Salvar` visiveis mesmo
  quando o conteudo precisa rolar.
- Refinamento posterior: o rodape sticky foi removido porque no preset Galaxy A55 a
  rolagem precisava incluir tambem os botoes de acao. Agora o overlay rola o modal
  inteiro, incluindo `Confirmar agendamento` e `Cancelar`.

### 2026-10-11 - Responsive review in Kosuke Preview

- Revisadas as telas em 360px, 390px, 768px e 1920px, incluindo nomes, e-mails e
  descrições longas sem espaços. Corrigidos transbordamentos em clientes, conta,
  usuários e histórico, além de conteúdo cortado na agenda e nas boas-vindas.
- Aplicados `wrap-anywhere` (Tailwind 4), `min-w-0` e colunas `minmax(0,1fr)` para
  respeitar a largura disponível sem ocultar os dados. Nomes de clientes agora
  quebram linha em vez de serem truncados.
- Horários livres da agenda empilham texto e ação no mobile; ações de edição e
  exclusão mantêm altura mínima de 44px, inclusive quando dispostas em coluna.
- Sugestões de cliente separam nome e telefone em duas linhas. Botões de ação e
  fechamento receberam áreas de toque maiores; navegação do cabeçalho não encolhe.
- Modais usam um overlay compartilhado com rolagem completa, margens automáticas
  e padding que respeita safe areas. Confirmações de exclusão também podem rolar;
  ações ficam em coluna no mobile quando necessário.
- Reduzido o excesso de espaço inferior do layout autenticado, preservando safe
  area. Campos usam fonte de 16px no mobile para evitar zoom automático ao focar.
- Validação: `npm run build` aprovado; verificações de geometria e interação no
  navegador com dados fictícios isolados na sessão de teste. Modais e menu também
  verificados em 360x320, com acesso ao início e às ações finais por rolagem; login
  e autocomplete conferidos nas quatro larguras solicitadas. O ambiente possui
  apenas o frontend: não foi validado o fluxo real com o backend Spring Boot.
- Alterações restritas a HTML/SCSS e a este checkpoint. Lógica de negócio,
  autenticação, contratos de API e credenciais não foram alterados.
- As correções foram apresentadas no Preview sem commits ou push inicialmente.
- O usuário aprovou as alterações e autorizou explicitamente o commit e o push na
  `main`. Resumo dos arquivos e mensagem de commit em inglês apresentados antes
  da publicação: `fix: improve responsive layouts across TimeGrid frontend`.

### 2026-10-11 - Branch documentation

- README atualizado para documentar as branches `main` e `dev` e o fluxo de
  revisão por Pull Request de `dev` para `main`.
- Alteração de documentação feita na `dev`, com commit, push e abertura de PR
  autorizados pelo usuário. O PR #1 foi integrado pelo usuário à `main` em
  2026-10-11, no commit `57df7c5`.

### 2026-10-11 - Context refresh after branch merges

- Atualizados a data e o checkpoint para distinguir o estado atual dos registros
  históricos de recuperação que mencionam alterações ainda não commitadas.
- Registrados os merges do [PR #1](https://github.com/NeoJhonn/timegrid-frontend/pull/1)
  (`dev` → `main`) e do [PR #2](https://github.com/NeoJhonn/timegrid-frontend/pull/2)
  (`main` → `dev`), além do fluxo de desenvolvimento e revisão entre as branches.
- Documentados o workspace Kosuke, a configuração temporária de hosts do Preview
  e a ausência do backend neste ambiente.
- Esta atualização é restrita ao `AGENTS.md`; o usuário autorizou sua publicação
  em novo PR. Não há mudanças na aplicação ou nos contratos de API.

### 2026-10-12 - SEO metadata and agenda mobile action

- `src/index.html` recebeu metadados principais do TimeGrid: titulo, descricao,
  idioma `pt-BR`, `theme-color`, robots, Open Graph e Twitter summary.
- No card de horario livre da Agenda em viewport mobile, o botao `Agendar` voltou a
  ficar alinhado a direita dentro do card, ao lado do texto do horario livre.
- Contexto do backend foi relido. Foram identificados contratos novos relacionados a
  update de usuario e troca/reset de senha, mas as adaptacoes no front ainda aguardam
  explicacao do usuario antes de qualquer implementacao.

### 2026-10-12 - Password endpoint alignment

- Frontend alinhado aos novos contratos de senha do backend.
- A pagina `Minha conta` passou a trocar a propria senha via `PATCH /users/me/password`,
  enviando `currentPassword` e `newPassword`.
- A tela `Gerenciar usuarios` passou a atualizar os dados gerais via `PUT /users/{id}`
  sem senha e redefinir a senha via `PATCH /users/{id}/password`, enviando somente
  `newPassword`.
- `UserApiService` e os modelos TypeScript foram atualizados com `UserUpdateRequest`,
  `ChangePasswordRequest` e `ResetPasswordRequest`.

### 2026-10-12 - Account password modal errors

- Na pagina `Minha conta`, erros da troca de senha agora aparecem dentro do modal de
  alteracao de senha, logo acima da acao principal.
- A mensagem de sucesso continua aparecendo no card principal da pagina depois que o
  modal fecha.

### 2026-10-12 - Metadata Portuguese copy

- Corrigidas as descricoes das meta tags em `src/index.html` para portugues do Brasil
  com acentuacao adequada.

### 2026-10-14 - Production backend URL

- `src/app/core/config/api.config.ts` passou a apontar para o backend em producao:
  `https://timegrid-backend-production-b8dc.up.railway.app`.
- Backend mantido somente leitura nesta conversa; nenhuma alteracao foi feita em
  `timegrid-backend`.

### 2026-10-14 - Frontend theme selector

- Criado suporte a tres temas no frontend: escuro verde padrao, claro e violeta
  escuro.
- Adicionado `ThemeService` com persistencia em `localStorage` e aplicacao via
  atributo `data-theme` no documento.
- Criado `ThemeToggleComponent`, usado na tela de login e no canto superior direito
  do layout autenticado.
- `src/styles.scss` recebeu a camada global de variaveis e overrides para adaptar as
  classes Tailwind existentes sem refatorar tela por tela.
- Validado com `npm.cmd run build` e verificacao visual no navegador local servindo o
  build gerado; alternancia entre claro e violeta e persistencia apos reload passaram.

### 2026-10-14 - Light theme card elevation

- Tema claro recebeu sombras suaves nos cards, modais, blocos internos e header para
  melhorar a separacao visual entre superficies brancas.
- Temas escuro e violeta foram preservados sem alteracoes visuais nessa etapa.
- Ajuste posterior: contraste do tema claro foi reforcado com bordas mais visiveis,
  fundos internos em tom off-white/azulado e sombras mais marcadas.

### 2026-10-14 - Compact theme toggle

- O seletor de tema deixou de exibir tres botoes ao mesmo tempo.
- `ThemeToggleComponent` agora mostra apenas o icone do tema atual e alterna em ciclo
  entre escuro, claro e violeta a cada clique.

### 2026-10-14 - Portuguese network errors

- `apiErrorMessage` passou a tratar erros de rede/status `0` antes de exibir qualquer
  texto cru vindo do navegador.
- Mensagens como `Failed to fetch`, `NetworkError` e `Load failed` agora aparecem para
  o usuario em portugues do Brasil: `Nao foi possivel conectar ao backend. Verifique
  sua conexao e tente novamente.`

## Development Rules For Future Agents

Preferências confirmadas pelo usuário em 2026-10-15:

- Nesta conversa, o backend é somente leitura; alterações são restritas ao frontend.
- Pedir confirmação antes de qualquer nova alteração. A atualização do contexto
  ao concluir uma alteração autorizada já está autorizada pelo usuário.
- Ao finalizar, registrar neste arquivo o que mudou e como foi validado.
- Sugerir uma mensagem de commit em inglês no padrão Conventional Commits.
- O usuário fará os commits; não executar commit ou push por iniciativa própria.

### 2026-10-15 - README aligned with current frontend

- README atualizado com o MVP implementado, tecnologias, temas, rotas, regras de
  agendamento e integração com a API de produção no Railway.
- Documentados os contratos atuais de troca/reset de senha, o fluxo de branches,
  os comandos de execução e as limitações das validações históricas.
- Removida a descrição desatualizada de que as telas e a integração ainda não
  haviam sido iniciadas.
- Validação: revisão documental contra este contexto e os arquivos de rotas,
  configuração da API, serviço de usuários, histórico, temas e package.json.
  Build e testes não executados, pois a alteração foi somente documental.
- Backend e código da aplicação não foram alterados. Commit fica a cargo do usuário.

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

### 2026-10-15 - Agenda date selection and light theme contrast

- Substituído o input de data nativo da Agenda por um calendário em componente
  standalone, com diálogo modal, navegação de mês e datas em português.
- Selecionar um dia fecha o calendário e chama imediatamente `changeDate`, que
  carrega os agendamentos do dia sem confirmação adicional. Datas usam formato
  local, sem conversão UTC. Diálogo permite fechar sem selecionar e usar Escape.
- Tema claro: botões de excluir da Agenda e de confirmar exclusão receberam fundo
  vermelho escuro, texto branco, borda e sombra, além de estados hover e foco.
- Cabeçalho autenticado identificado por `shell-header`; no tema claro, seus
  links e controles usam texto branco sobre fundo escuro. Estilos restritos ao
  tema claro e aos elementos identificados, preservando os outros temas.
- Adicionados testes do calendário: fechamento/emissão imediatos ao escolher dia
  e navegação entre dezembro/janeiro sem emissão prematura.
- Validação: `npm.cmd run build` aprovado; `npm.cmd test -- --watch=false
  --browsers=ChromeHeadless` aprovado (4 testes). Não houve validação visual em
  celular físico nem chamadas de teste à API de produção.
- Backend não alterado. Commit e push ficam a cargo do usuário.
- Sugestão de commit: `fix: auto-select agenda dates and improve light theme contrast`.

### 2026-10-15 - Reliable session renewal

- Consultados somente para leitura o filtro JWT, SecurityConfig, JwtService e
  AuthServiceImpl do backend. Contrato: access token de 60 minutos e refresh token
  de 24 horas, cuja validade original não é estendida pelas renovações.
- Interceptor mantido e atualizado: verifica expiração antes das chamadas protegidas
  à API, com margem de 30 segundos, e espera pela renovação antes de enviar a chamada.
- Login e refresh não recebem mais o bearer antigo. URLs externas não recebem token.
- AuthService compartilha uma única renovação entre requisições simultâneas.
- Autenticação local considera refresh válido para retomar a sessão após inatividade
  ou reload e reavalia a validade pelo relógio, sem computed que memorize expiração.
- HTTP 401 ainda permite uma única tentativa após renovação; um segundo 401 encerra
  a sessão. HTTP 403 das rotas protegidas não causa renovação ou logout indevidos.
- Refresh ausente/expirado ou recusado com 400/401/403 limpa a sessão e volta ao login.
  Erros de rede e 5xx preservam a sessão para uma nova tentativa.
- Resposta tardia de refresh não restaura a sessão após logout ou novo login.
- A renovação acontece sob demanda antes da API; não depende de timer em segundo
  plano, que pode ser suspenso em celulares. Não há promessa de atividade da API
  enquanto a aplicação está fechada.
- Validação: build de produção aprovado; suíte ChromeHeadless aprovada (15 testes,
  incluindo 11 novos casos de sessão com API e expiração simuladas). Não foi feito
  teste de uma sessão real de 24 horas nem reproduzida a falha em produção; erros
  de CORS/rede ainda podem exigir investigação no backend se persistirem.
- Backend não alterado. Nenhum commit ou push executado.
- Sugestão: `fix: reliably refresh access tokens and handle session expiration`.

### 2026-10-15 - Agenda feedback and user-facing copy

- Removida a mensagem de sucesso após criar agendamento. O modal continua fechando
  e a agenda é recarregada para mostrar o novo atendimento. Erros de criação e
  mensagens das outras operações foram preservados.
- Rótulos visíveis `Role` substituídos por `Perfil` em Minha conta e nos formulários
  de cadastro/edição de usuários. Propriedades `role`, enums e contratos da API
  permanecem com os nomes originais.
- Boas-vindas e cabeçalho deixaram de usar o `sub` do JWT (e-mail) como nome provisório.
  O primeiro nome é exibido somente após carregar `username` pela API; enquanto isso,
  as boas-vindas usam uma frase neutra e o cabeçalho não exibe nome provisório.
  Em caso de falha no carregamento, o e-mail não é usado como fallback.
- Validação: `npm.cmd run build` aprovado e busca pelos textos antigos nas features.
  Não realizada validação visual no navegador nesta etapa.
- Somente frontend alterado; nenhum commit ou push executado.
- Sugestão: `fix: refine agenda feedback and user profile display`.

### 2026-10-15 - Social sharing preview image

- `src/index.html` atualizado com Open Graph completo: URL canônica de produção,
  título, descrição, idioma, site e imagem HTTPS absoluta, com MIME, dimensões
  reais (1536x1024) e texto alternativo. Twitter/X usa `summary_large_image` com
  a mesma imagem e descrição.
- Imagem fornecida pelo usuário preservada em `src/assets/TimeGrid_thumb.png`.
  URL após deploy: `https://timegrid-frontend.vercel.app/assets/TimeGrid_thumb.png`.
- `angular.json` configurado para copiar `src/assets` para `/assets/` nos alvos
  de build e teste, preservando também os arquivos de `public`.
- Validação: `npm.cmd run build` aprovado; imagem encontrada no diretório de saída
  com SHA256 idêntico à origem; tags verificadas no HTML de login pré-renderizado
  e no index CSR. Não foi realizado deploy nem teste de preview nas redes sociais.
- O domínio utilizado é o de produção registrado no contexto do backend. Se mudar,
  atualizar canonical, og:url, og:image, og:image:secure_url e twitter:image.
- Para publicar, incluir também a pasta `src/assets/` no commit; ela estava não
  rastreada no Git durante a verificação. Commit e push ficam com o usuário.
- Sugestão: `feat: add social sharing metadata and preview image`.

### 2026-10-18 - Frontend regression suite

- Usuário solicitou ampliar os testes automatizados antes das próximas correções.
  A cobertura anterior era de 15 testes em 3 arquivos: app, calendário e sessão.
- Adicionados 64 casos em 7 arquivos `src/testing/*.spec.ts` e fixtures tipadas em
  `src/testing/test-data.ts`, totalizando 79 testes. Arquivos e regras da aplicação
  e backend não foram alterados.
- Agenda: integração do evento do calendário, datas passadas, validações, payload
  com enums, criação sem banner, duplicidade de submit, erros recuperáveis, limites
  ocupados, edição restrita, confirmação de exclusão e seleção de cliente.
- Clientes: carga por usuário, validações, máscara removida no envio, edição,
  duplicidade de submit, falhas, busca e confirmação/cancelamento de exclusão.
- Login/conta: credenciais, navegação após sucesso, erros, submissão concorrente,
  contrato de senha atual/nova, mensagens no modal e limpeza de dados sensíveis.
- Usuários: força de senha, cadastro, contratos separados de update/reset,
  sequência das operações, falha de update e confirmação/cancelamento de exclusão.
- Histórico: consulta somente após seleção, autocomplete, filtro por cliente,
  ordenação e janela de datas. Boas-vindas e cabeçalho: primeiro nome após resposta
  assíncrona, sem fallback para e-mail mesmo se a consulta falhar.
- Guards: acesso autenticado, visitante e MANAGER. Serviços: contratos HTTP,
  isolamento/manutenção do cache por usuário, falha sem corromper cache e agenda
  sem cache. Temas: ciclo, persistência, restauração, valor inválido e SSR. Erros:
  mensagens de rede, validação e negócio.
- Scripts adicionados: `test:ci` (ChromeHeadless, execução única), `test:coverage`
  (relatório em coverage/) e `verify` (testes seguidos de build se passarem).
  README atualizado com comandos, escopo e limitações.
- Validação: TypeScript `tsc --noEmit -p tsconfig.spec.json` e compilação completa
  Angular AOT (`ngc`, configuração temporária) aprovados. Os 79 testes passaram
  em Karma/Chrome 155 pelo navegador integrado, com bundle temporário do código
  compilado AOT e templates reais; sem stylesheet global e sem chamadas à produção.
- Limitação do ambiente: executor de shell falha com erro CET; Angular CLI test e
  build encerram com código 3221225477 antes de concluir a compilação. Chrome
  externo também falhou ao iniciar processos gráficos. O teste no navegador
  integrado confirmou os casos, mas não valida o pipeline padrão, build de produção,
  coverage ou aparência/responsividade. Nenhum resultado de coverage foi medido.
  Não adicionar ao repositório os scripts/bundles temporários de diagnóstico.
- Para próximas mudanças: executar `npm run verify` em ambiente funcional e criar
  regressões para bugs corrigidos quando aplicável. Se houver bloqueio de execução,
  informar o bloqueio e distinguir testes aprovados de checagens não realizadas.
  Mudanças visuais também precisam de conferência visual nas larguras relevantes.
- Preferência reforçada pelo usuário: abrir e testar a interface sempre no Angular
  local em `http://localhost:4200/` (ng serve). Não usar o deploy para testes de telas.
  O servidor interno do Jasmine/Karma é independente do ng serve; os testes unitários
  não dependem da aplicação na porta 4200 e simulam as APIs, sem acessar produção.
- Nenhum commit ou push executado; continuam a cargo do usuário.
- Sugestão: `test: expand frontend regression coverage and verification scripts`.

### 2026-10-18 - Theme toggle fix preparation (historical; applied below)

- Usuário relatou ícone do sol invisível no cabeçalho mobile em tema claro e pediu
  ícones maiores em todos os temas.
- Diagnóstico: a regra global do tema claro em `.shell-header` força `button` para
  branco, enquanto o seletor recebe fundo claro pelo override de `bg-white/[0.06]`.
  Os símbolos atuais também dependem do tamanho/renderização de glifos da fonte.
- Preparado `theme-toggle-fix.patch`: exclui `.theme-toggle` da regra genérica de
  cor dos botões, usa cores próprias por variáveis do tema e substitui glifos por
  SVGs de 34px dentro do botão de 44px, preservando ciclo e rótulos acessíveis.
- O patch inclui dois testes de regressão: contraste/tamanho do sol no cabeçalho
  claro com stylesheet global real e alternância dos três ícones/rótulos.
- NÃO APLICADO: editor recusou o arquivo por ponto de nova análise no caminho;
  gravação direta retornou EPERM; executor escalado falhou ao iniciar com erro CET
  do Windows. Os arquivos da aplicação permanecem intactos.
- `git apply --check theme-toggle-fix.patch` aprovado (somente validação do patch).
  Testes novos, build e visual em `http://localhost:4200/` ainda não executados.
  Retomar aplicação e verificação quando houver executor com gravação funcional.
- Nenhum commit ou push. Sugestão APÓS aplicar e validar:
  `fix: improve theme toggle icon size and light mode contrast`.

### 2026-10-18 - Retry interrupted (historical; recovery completed below)

- Usuário pediu nova tentativa e reafirmou autorização para a correção.
- Executor escalado continua falhando antes do comando com mensagem CET do Windows.
- `git apply` pelo executor alternativo falhou na gravação e removeu os dois arquivos
  que pretendia substituir. `src/styles.scss` foi recuperado com a alteração
  `button:not(.theme-toggle)`; a gravação do componente continua bloqueada por EPERM.
- Naquela tentativa, `src/app/shared/theme-toggle.component.ts` ficou ausente.
  O usuário depois o restaurou; ver a validação e o estado atual abaixo.
- O conteúdo corrigido completo está preservado na raiz em
  `theme-toggle.component.recovery.ts`. Copiar esse arquivo para
  `src/app/shared/theme-toggle.component.ts` em um terminal com permissão de escrita.
- `git restore` e tentativa de gravação atômica também foram recusados. Nenhuma
  permissão de sistema foi alterada. Nenhum commit ou push foi executado.
- O patch anterior não deve ser reaplicado cegamente: o stylesheet já foi ajustado.
  Depois de recuperar o componente, adicionar o teste de regressão preparado no
  patch e validar suíte, build e visual no localhost:4200.

### 2026-10-18 - Theme toggle recovered, applied and tested

- Recuperação concluída pelo usuário via PowerShell e confirmada por leitura.
  `src/app/shared/theme-toggle.component.ts` existe e contém os SVGs de 34px,
  botão de 44px, cores via variáveis do tema, foco e rótulos acessíveis.
- `src/styles.scss` exclui `.theme-toggle` da regra de texto branco do cabeçalho
  claro. O sol usa texto escuro sobre fundo claro e não depende mais de glifo.
- Adicionado `src/testing/theme-toggle.spec.ts` com dois testes: contraste real
  e dimensões do sol dentro de `.shell-header` claro; ciclo dos três ícones e
  preservação dos nomes acessíveis.
- Validação: TypeScript sem emissão e compilador Angular AOT aprovados. Suíte
  completa de 81 testes aprovada no Karma/Chrome integrado com stylesheet global
  compilado pelo Sass, incluindo a regressão de contraste. Continuou sendo usado
  o pipeline temporário de diagnóstico; não confundir com build Angular CLI aprovado.
- Interface local abriu normalmente em `http://localhost:4200/login`, em viewport
  mobile de 390x844. Não foi realizado login nem teste visual do cabeçalho autenticado;
  esse cenário foi exercitado pelo componente de teste com a classe real do header.
- Patch e cópia de recuperação temporários removidos após confirmar os fontes.
- Arquivos para commit: este AGENTS.md, `src/app/shared/theme-toggle.component.ts`,
  `src/styles.scss` e `src/testing/theme-toggle.spec.ts`. Backend não alterado.
- Nenhum commit ou push executado. Sugestão:
  `fix: improve theme toggle icon size and light mode contrast`.

### 2026-10-18 - Moon and light action refinements prepared, not applied

- Usuário aprovou o tamanho dos ícones e pediu uma lua mais marcada, login claro
  com verde mais forte/texto escuro e botões Editar/Excluir com leve transparência.
- Nenhum arquivo da aplicação foi removido ou alterado nesta tentativa: editor
  recusou o caminho por ponto de nova análise; gravação pontual retornou EPERM;
  executor escalado continua falhando com CET.
- Preparado `apply-theme-refinements.ps1` na raiz. O script aplica somente ajustes
  visuais no seletor/stylesheet, adiciona dois testes de contraste e registra a
  aplicação no contexto. Não executa git apply, remoções, commit ou push.
- Aguardar execução pelo usuário em PowerShell e depois validar tipos, testes e
  interface no localhost:4200. Não considerar os refinamentos aplicados ainda.


### 2026-10-18 - Moon and light action refinements applied via cmd and Node

- Moon SVG changed to a more pronounced crescent; existing 34px icon size preserved.
- Light login button uses stronger green with dark text and disabled opacity 0.8.
  Login validation and disabled behavior unchanged.
- Agenda card delete background uses red at 88% opacity; text stays fully opaque.
  Edit uses translucent blue, dark blue text, border and subtle shadow.
  Delete confirmation modal and other themes are unchanged.
- Added two global stylesheet regression tests in src/testing/light-action-styles.spec.ts.
- Applied by the agent using the installed Node runtime through an escalated cmd.exe
  executor. The user's PowerShell script did not run because execution policy blocked it.
- Validation: standard `npm.cmd run verify` passed: 83 ChromeHeadless tests and the
  production Angular build. This supersedes earlier environment validation limitations.
- Windows execution policy and other security settings were not changed. For future
  commands prefer `shell: cmd.exe`, `login: false` if the PowerShell executor reports CET.
- No backend changes, commit or push. Suggested commit after validation:
  fix: refine moon icon and light theme action contrast
