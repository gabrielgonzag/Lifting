# LIFTING - Contexto Mestre do Sistema

Este arquivo e a referencia principal para novas sessoes de trabalho no projeto LIFTING. Leia este documento antes de alterar arquitetura, autenticacao, persistencia, rotas ou experiencia principal.

## Identidade do Produto

LIFTING, antes chamado internamente de CONTENT.ENV, e um app fitness premium para:

- criar fichas de treino;
- escolher exercicios por grupo muscular;
- registrar series, carga, repeticoes e RPE;
- calcular PRs e estimativas de 1RM;
- acompanhar progresso;
- preparar base para usuarios reais, planos, coaches e persistencia em backend.

Direcao de produto:

- menos interface, mais treino;
- mobile-first;
- visual escuro premium;
- simples, rapido e direto;
- inspirado em Hevy, Strong, Nike Training Club, Notion e Linear;
- evitar aparencia de dashboard tecnico generico.

## Stack

- React 19
- TypeScript
- Vite
- TailwindCSS
- Zustand
- Supabase JS
- Recharts
- Framer Motion
- Lucide React
- Vitest
- rollup-plugin-visualizer

Scripts principais:

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run build:analyze
npm run preview
npm run start
```

Neste ambiente, se `npm` global nao existir, usar o runtime local:

```powershell
$env:PATH=(Resolve-Path '.\.codex-node\node-v20.11.1-win-x64').Path + ';' + $env:PATH
& '.\.codex-node\node-v20.11.1-win-x64\npm.cmd' run lint
```

## Arquitetura Geral

Pastas importantes:

```txt
src/pages/                 Telas principais
src/components/            Componentes reutilizaveis
src/features/              Areas de dominio, como auth e fichas
src/store/                 Stores Zustand
src/services/              Regras de negocio e casos de uso
src/repositories/          Persistencia local/Supabase
src/guards/                Protecao de rotas
src/types/                 Tipos centrais
src/utils/                 Helpers, validadores e calculos
src/data/                  Base fixa de exercicios e mocks
supabase/migrations/       Schema, triggers, RLS e funcoes SQL
```

Regra de arquitetura:

- componentes nao devem acessar `localStorage` diretamente;
- componentes nao devem chamar Supabase direto para dados de dominio;
- persistencia passa por repositories;
- regras passam por services, guards ou validators;
- UI apenas consome stores/services e renderiza estados.

## Autenticacao Atual

Estado atual: somente Google OAuth via Supabase Auth.

Email/senha esta temporariamente desabilitado:

- nao aparece na interface;
- `authService.login()` retorna indisponivel;
- `authService.register()` retorna indisponivel;
- `authService.resetPassword()` retorna indisponivel;
- codigo antigo existe isolado em `disabledEmailPasswordAuth`, mas nao deve ser usado na UI.

Fluxo Google:

1. Usuario clica em `Entrar com Google`.
2. `authService.loginWithGoogle()` chama:

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

3. Supabase/Google retorna para `/auth/callback`.
4. `AuthCallback` chama `completeOAuthRedirect()`.
5. O codigo OAuth e trocado por session.
6. O profile e buscado/criado via `userRepository.ensureSupabaseProfile()`.
7. A conta e validada:
   - `suspended` bloqueia e faz logout;
   - `pending_verification` ou `emailVerified = false` vai para verificacao;
   - perfil ativo entra no app.

Arquivos principais:

```txt
src/services/authService.ts
src/store/useAuthStore.ts
src/features/auth/AuthProvider.tsx
src/pages/Login.tsx
src/pages/Register.tsx
src/pages/AuthCallback.tsx
src/pages/ResetPassword.tsx
src/pages/VerifyEmail.tsx
src/guards/routeGuards.ts
```

Observacao importante:

- `Login.tsx` e `Register.tsx` atualmente sao telas Google-only.
- `ResetPassword.tsx` apenas informa que senha esta indisponivel.
- `AuthCallback.tsx` deve sempre renderizar estados claros: carregando, erro, verificacao ou redirect.
- O callback OAuth tambem trata `error`, `error_code` e `error_description` vindos na URL.

## Supabase OAuth

Configuracao necessaria no Supabase:

```txt
Authentication > URL Configuration
Site URL:
https://lifting-production.up.railway.app

Redirect URLs:
https://lifting-production.up.railway.app/auth/callback
http://localhost:5173/auth/callback
http://localhost:4173/auth/callback
```

Configuracao necessaria no Google Cloud:

- o OAuth Client usado pelo Supabase deve conter a redirect URI do Supabase Auth;
- normalmente e algo como:

```txt
https://SEU_PROJECT_REF.supabase.co/auth/v1/callback
```

Erro conhecido:

```txt
Unable to exchange external code
```

Documentacao local:

```txt
LIFTING_GOOGLE_OAUTH_ERROR.md
```

Esse erro costuma indicar configuracao OAuth/Supabase/Google, nao bug de cadastro comum.

## Profile, Roles e Plans

Tipos:

```ts
UserRole = "casual" | "professional" | "enterprise_admin" | "instructor" | "admin";
UserPlan = "entry" | "core" | "coach" | "elite";
UserStatus = "pending_verification" | "active" | "suspended";
```

Usuario:

```ts
User {
  id;
  name;
  username?;
  email;
  emailVerified;
  avatarUrl?;
  role;
  plan;
  status;
  createdAt;
  updatedAt;
}
```

Regra de seguranca:

- frontend nao define role privilegiada;
- frontend nao define plan privilegiado;
- frontend nao define `status`;
- frontend nao define `email_verified`;
- upgrades futuros devem vir de backend, admin, pagamento confirmado ou processo interno seguro.

Migration mais recente:

```txt
supabase/migrations/20260525120000_google_only_profiles.sql
```

Ela:

- adiciona `profiles.username`;
- cria `lifting_username_from_email(email, user_id)`;
- atualiza `handle_new_user()`;
- atualiza `ensure_profile()`;
- novos usuarios Google nascem como:
  - `role = casual`
  - `plan = entry`
  - `status = active`
  - `email_verified = true`
  - `username = parte antes do @`

Fallback de username:

```txt
user_[primeiros_8_caracteres_do_id]
```

## Permissoes

Arquivo principal:

```txt
src/utils/validators/permissionValidator.ts
```

Regras:

- `admin` tem acesso total;
- usuarios suspensos ou sem email verificado nao tem permissoes;
- `entry` permite uso basico e limite de fichas;
- `core` libera recursos individuais premium;
- `coach` libera painel profissional;
- `elite` libera areas enterprise;
- role e plan sao avaliados juntos para coach.

Plan limits:

```txt
ENTRY: ate 20 fichas
CORE: fichas ilimitadas
COACH: ate 10 alunos ativos
ELITE: estrutura enterprise
```

Arquivo de planos:

```txt
src/utils/validators/planValidator.ts
src/services/planService.ts
```

## Rotas

Rotas principais:

```txt
home
plans
workout
progress
settings
login
register
reset-password
auth/callback
verify-email
professional
coach
coach/students
coach/invites
elite
admin
```

Rotas publicas:

```txt
login
register
reset-password
auth/callback
```

Redirecionamento apos login:

```txt
admin -> admin
elite -> elite
coach/professional -> coach
casual/core/entry -> home
```

Protecao:

- deslogado tentando area privada vai para `login`;
- logado tentando rota publica vai para rota correta do usuario;
- usuario pendente vai para `verify-email`;
- casual nao acessa `coach`, `elite` ou `admin`;
- coach nao acessa `elite`;
- admin acessa tudo.

Arquivo:

```txt
src/guards/routeGuards.ts
```

## Dados e Persistencia

Entidades principais usam `BaseEntity`:

```ts
BaseEntity {
  id;
  userId;
  createdAt;
  updatedAt;
}
```

Principais entidades:

- `WorkoutPlan`
- `WorkoutSession`
- `PersonalRecord`
- `SavedExercise`
- `CoachStudentRelation`
- `CoachInvite`
- `SharedWorkoutPlan`
- `CoachNote`

Store principal:

```txt
src/store/useAppStore.ts
```

Ela carrega dados por `userId`, cria/edita/deleta fichas, salva sessoes, importa snapshot e reseta dados.

Repository principal:

```txt
src/repositories/workoutRepository.ts
```

Com Supabase configurado:

- le `workout_plans`;
- le `workout_sessions`;
- le `personal_records`;
- salva via `upsert`;
- remove dados ausentes mantendo filtro por `user_id`.

Sem Supabase:

- usa `databaseClient` com localStorage;
- migra dados legados;
- semeia dados iniciais de `mockData`.

## Exercicios e Fichas

Base fixa:

```txt
src/data/exercises.ts
```

Direcao atual:

- exercicios organizados por grupo muscular;
- selecao dentro do editor de ficha;
- evitar biblioteca generica solta;
- mobile usa tabs/organizacao compacta.

Editor:

```txt
src/features/workoutPlans/PlanEditor.tsx
```

Planos/fichas:

- possuem titulo, descricao, cor, grupos musculares e blocos;
- nao devem usar icones de ficha;
- descricao deve ser compacta.

## Treino e PRs

Tela:

```txt
src/pages/Workout.tsx
src/components/workout/WorkoutSetRow.tsx
```

Regras de input:

- campos numericos devem usar string durante digitacao;
- nao deixar zero preso no inicio;
- permitir apagar campo totalmente;
- converter para numero apenas para salvar/calcular;
- impedir negativos.

PRs:

```txt
src/utils/records.ts
```

Tipos:

- `absolute_weight`
- `estimated_1rm`
- `set_volume`

Formula de 1RM:

```ts
estimated1RM = weight * (1 + reps / 30)
```

Somente series completas, com peso e reps validos, devem gerar PR.

## Progresso

Tela:

```txt
src/pages/Progress.tsx
src/components/charts/MetricCharts.tsx
```

Direcao de UX:

- no maximo 2 graficos principais;
- foco em recorde pessoal e frequencia;
- substituir excesso de dashboard por insights simples;
- Recharts deve ficar lazy/carregado so em telas que precisam de graficos.

## Painel Profissional

Tela:

```txt
src/pages/ProfessionalDashboard.tsx
```

Servicos/repositories:

```txt
src/services/coachService.ts
src/services/coachTrainingService.ts
src/services/inviteService.ts
src/services/sharedWorkoutService.ts
src/services/studentService.ts
src/repositories/coachRepository.ts
src/repositories/coachTrainingRepository.ts
src/repositories/inviteRepository.ts
src/repositories/sharedWorkoutRepository.ts
src/repositories/studentRepository.ts
```

Estado atual:

- painel existe como fundacao;
- dados de coach possuem mocks e estrutura;
- funcionalidades enterprise/coach completas ainda sao futuras.

## Configuracoes e Exportacao

Tela:

```txt
src/pages/Settings.tsx
```

Mantem:

- exportar PDF;
- exportar/importar JSON;
- limpar dados.

Exportacao:

```txt
src/services/pdfReport.ts
```

Removido/evitar:

- aparencia;
- densidade;
- dados locais expostos demais;
- excesso de controles.

## Bundle e Performance

Vite possui `manualChunks` em:

```txt
vite.config.ts
```

Chunks separados:

- react;
- recharts;
- framer-motion;
- supabase;
- lucide-react.

Analise:

```bash
npm run build:analyze
```

Regras:

- paginas pesadas devem usar lazy loading;
- componentes com graficos devem ser lazy quando fizer sentido;
- Recharts nao deve carregar na home/login.

## Testes

Testes existentes:

```txt
src/services/authService.test.ts
src/repositories/workoutRepository.test.ts
src/utils/records.test.ts
src/utils/routeGuards.test.ts
src/utils/validators/authValidators.test.ts
```

Validar antes de finalizar mudancas relevantes:

```bash
npm run lint
npm run test
npm run build
```

Ultima verificacao conhecida:

```txt
npm run lint  - passou
npm run test  - 23 testes passaram
npm run build - passou
```

## Migrations Supabase Importantes

```txt
20260522183000_lifting_auth_and_workouts.sql
20260522200000_repair_profile_creation.sql
20260522213000_support_google_profile_metadata.sql
20260523033000_add_lifting_plan_roles.sql
20260523033100_apply_lifting_auth_business_rules.sql
20260523143000_harden_public_signup_roles.sql
20260524120000_sync_email_confirmation_status.sql
20260525120000_google_only_profiles.sql
```

Nao remover migrations antigas sem cuidado. A historia do banco depende delas.

## Arquivos de Contexto e Documentacao

```txt
LIFTING_AUTH_BUSINESS_RULES.txt
LIFTING_IMPLEMENTED_BUSINESS_RULES.txt
LIFTING_GOOGLE_OAUTH_ERROR.md
CONTEXT.md
content_env_master_prompt.md
```

`CONTEXT.md` deve ser atualizado sempre que uma decisao estrutural mudar.

## Cuidados Criticos

- Nunca colocar service role key no frontend.
- Nunca confiar no frontend para role, plan, status ou email verification.
- Nao reativar email/senha na UI sem decisao explicita.
- Nao criar bypass admin em producao.
- Nao chamar Supabase direto em componentes para dados de dominio.
- Nao quebrar `/auth/callback`; ele precisa renderizar com `Suspense`.
- Se OAuth mostrar `Unable to exchange external code`, revisar configuracao Supabase/Google antes de culpar codigo.
- Nao remover RLS ou triggers de seguranca.
- Se mexer em auth, rodar testes de `authService` e `routeGuards`.

## Git e Deploy

Repositorio remoto:

```txt
https://github.com/gabrielgonzag/Lifting.git
```

Branch principal:

```txt
main
```

Deploy conhecido:

```txt
https://lifting-production.up.railway.app
```

Antes de commit/push:

```bash
git status -sb
npm run lint
npm run test
npm run build
```

## Estado Atual do Produto

O sistema esta em transicao de app local para produto SaaS fitness:

- autenticacao com Google/Supabase;
- profiles e ownership por usuario;
- planos e permissoes modelados;
- fichas e treinos persistidos por usuario;
- painel profissional preparado;
- rotas protegidas;
- PRs e progresso implementados;
- UI orientada a treino real e menos dashboard.

Prioridade atual:

1. estabilizar OAuth Google em producao;
2. garantir migrations aplicadas no Supabase;
3. validar criacao automatica de profile;
4. manter entrada Google-only;
5. evoluir features sem comprometer seguranca de roles/plans.

