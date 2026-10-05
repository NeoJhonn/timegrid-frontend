# AGENTS.md

## Project: TimeGrid Frontend

Frontend do TimeGrid, aplicacao de agendamento que consome o backend Spring Boot
em `D:\Projetos\Projetos-Java-Spring-Boot\timegrid-backend`.

Atualizado em: 2026-10-01.

## Context Checkpoint

Este arquivo foi atualizado depois de uma falha fatal na conversa anterior da API.
O historico conversado foi perdido, mas o estado do projeto foi recuperado pelo Git
e pelo workspace local.

Importante:

- O backend nao deve ser tratado como area ativa de trabalho nesta etapa.
- O backend ja estava pronto em outra conversa e fica neste workspace apenas para
  consulta de contratos e para rodar localmente junto com o frontend.
- O foco atual e exclusivamente o frontend em `timegrid-frontend`.
- Em 2026-10-01, o frontend tem alteracoes locais ainda nao commitadas que devem ser
  salvas em commit pelo usuario.
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
4. Commitar o checkpoint recuperado do frontend antes de novas mudancas grandes.
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
