# LIFTO - Contexto Mestre do Sistema

Este arquivo e a referencia principal para novas sessoes no projeto LIFTO. Leia antes de alterar autenticacao, rotas, persistencia, Supabase, treino, PRs ou design system.

## Produto

LIFTO e o novo branding oficial do projeto anteriormente chamado LIFTING, antes chamado internamente de CONTENT.ENV. E um app fitness premium para:

- criar fichas de treino;
- escolher exercicios por grupo muscular;
- registrar series, carga, repeticoes e PRs;
- calcular recordes pessoais e estimativa de 1RM;
- acompanhar progresso;
- preparar base de SaaS com usuarios reais, planos, coaches, Supabase e backend futuro.

Direcao de produto:

- menos interface, mais treino;
- mobile-first;
- visual dark premium;
- UX direta, rapida e motivacional;
- evitar aparencia de dashboard tecnico generico;
- inspiracoes: Hevy, Strong, Nike Training Club, Notion e Linear.

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

Scripts:

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run build:analyze
npm run preview
npm run start
```

Neste ambiente Windows, se `npm` global nao estiver disponivel, usar:

```powershell
$env:PATH=(Resolve-Path '.\.codex-node\node-v20.11.1-win-x64').Path + ';' + $env:PATH
& '.\.codex-node\node-v20.11.1-win-x64\npm.cmd' run lint
```

## Design System

Foi integrado um design system proprio em `design/`.

Arquivos de referencia:

```txt
design/tokens.css
design/data.jsx
design/shell.jsx
design/screens-a.jsx
design/screens-b.jsx
design/screens-c.jsx
design/app.jsx
design/tweaks-panel.jsx
```

Integracao atual:

- `src/styles/globals.css` importa `design/tokens.css`.
- `src/components/layout/AppShell.tsx` usa shell novo: sidebar desktop, bottom nav mobile, menu mobile de perfil e wordmark LIFTO.
- no mobile, a topbar de perfil do `AppShell` some ao rolar para baixo no scroll interno e reaparece ao rolar para cima.
- `src/components/ui/Icon.tsx` contem icones customizados do design.
- `src/components/ui/Toast.tsx` contem toast host/hook.
- `src/main.tsx` envolve a app com `ToastHost`.
- `src/pages/Login.tsx`, `src/pages/Home.tsx`, `src/pages/Plans.tsx`, `src/pages/Profile.tsx` e `src/pages/Progress.tsx` ja usam parte relevante do visual novo.

Evitar voltar para marca CONTENT.ENV na UI. A chave legacy `content-env-store` em persistencia deve continuar para migracao de dados antigos.

## Arquitetura

Pastas principais:

```txt
src/pages/                 Telas principais
src/components/            Componentes reutilizaveis
src/components/auth/       Shell e componentes de auth
src/components/mobile/     Componentes exclusivos da experiencia mobile
src/components/profile/    Header, stats, conquistas, formulario e avatar do perfil
src/components/workout-dna/ Componentes do Workout DNA
src/components/legacy/     Componentes do Lifto Legacy System
src/features/              Areas de dominio, como auth e fichas
src/features/gamification/ XP, nivel e progressao
src/features/achievements/ Conquistas e raridades
src/features/workout-dna/  Regras e service do perfil comportamental de treino
src/features/legacy/       Regras e service dos marcos narrativos do usuario
src/store/                 Stores Zustand
src/services/              Regras de negocio/casos de uso
src/repositories/          Persistencia local/Supabase
src/guards/                Protecao de rotas
src/types/                 Tipos centrais
src/utils/                 Helpers, validadores e calculos
src/data/                  Base fixa de exercicios e mocks
supabase/migrations/       Schema, triggers, RLS e funcoes SQL
```

Regras:

- componentes nao devem acessar `localStorage` diretamente;
- componentes nao devem chamar Supabase direto para dados de dominio;
- persistencia passa por repositories;
- regras ficam em services, guards ou validators;
- UI consome stores/services e renderiza estados;
- dados criticos de progressao, permissoes, role, plan, status e auditoria nao devem ser decididos pelo frontend;
- nao criar bypass admin em producao.

## Autenticacao

Estado atual: fluxo hibrido com Google principal e email/senha como alternativa.

Fluxos ativos:

1. Login rapido com Google via Supabase OAuth.
2. Login manual com email/senha via `supabase.auth.signInWithPassword()`.
3. Cadastro manual com email/senha via `supabase.auth.signUp()`.
4. Recuperacao de senha via `supabase.auth.resetPasswordForEmail()`.

Arquivos:

```txt
src/services/authService.ts
src/store/useAuthStore.ts
src/components/auth/AuthShell.tsx
src/pages/Login.tsx
src/pages/Register.tsx
src/pages/ResetPassword.tsx
src/pages/AuthSuccess.tsx
src/pages/AuthError.tsx
src/pages/AuthCallback.tsx
src/pages/VerifyEmail.tsx
src/pages/Profile.tsx
src/guards/routeGuards.ts
```

Login Google:

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

Callback OAuth:

- `/auth/callback` chama `completeOAuthRedirect()`;
- troca `code` por session;
- busca/cria profile via `userRepository.ensureSupabaseProfile()`;
- trata `error`, `error_code` e `error_description` da URL;
- depois do login limpa a URL para `/#home`, `/#coach`, etc. sem manter `?code=...`.

Login manual:

- valida email;
- exige senha preenchida;
- usa `signInWithPassword`;
- bloqueia email nao confirmado;
- valida profile, status e permissoes.

Cadastro manual:

- campos: nome, email, senha, confirmar senha, perfil aluno/profissional;
- envia metadata `name`, `role`, `plan`;
- apos signup sem session, vai para `auth-success`;
- falhas vao para `auth-error`;
- nao deve confiar no frontend para permissoes privilegiadas.

Observacao de seguranca: a migration mais recente de profile (`20260525120000_google_only_profiles.sql`) cria novos usuarios como `casual + entry`; se o produto quiser permitir profissional real por cadastro manual, isso precisa ser tratado por backend seguro ou nova migration deliberada.

## Supabase Auth

Variaveis `.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca colocar no frontend:

```txt
SUPABASE_SERVICE_ROLE_KEY
senhas de banco
tokens pessoais
segredos OAuth
```

Configuracao esperada no Supabase:

```txt
Authentication > URL Configuration
Site URL:
https://lifting.up.railway.app

Redirect URLs:
https://lifting.up.railway.app/auth/callback
http://localhost:5173/auth/callback
http://localhost:4173/auth/callback
```

Configuracao esperada no Google Cloud:

```txt
https://SEU_PROJECT_REF.supabase.co/auth/v1/callback
```

Politica local em `supabase/config.toml`:

```toml
minimum_password_length = 8
password_requirements = "lower_upper_letters_digits"
```

Erro conhecido:

```txt
Unable to exchange external code
```

Normalmente indica configuracao OAuth/Supabase/Google. Documento local:

```txt
LIFTING_GOOGLE_OAUTH_ERROR.md
```

## Usuarios, Roles, Plans e Status

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
  bio?;
  goal?;
  experienceLevel?;
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
- upgrades futuros devem vir de backend, admin, pagamento confirmado ou processo interno seguro;
- RLS e triggers nao devem ser removidos.
- `bio`, `avatarUrl`, `name` e `username` sao editaveis pelo usuario via `profileService`;
- `role`, `plan`, `status` e `emailVerified` continuam somente leitura no frontend.

Migration de profile atual:

```txt
supabase/migrations/20260525120000_google_only_profiles.sql
supabase/migrations/20260526013000_add_profile_details.sql
```

Ela:

- adiciona `profiles.username`;
- cria `lifting_username_from_email(email, user_id)`;
- atualiza `handle_new_user()`;
- atualiza `ensure_profile()`;
- novos usuarios nascem como `role = casual`, `plan = entry`;
- Google entra como `status = active` e `email_verified = true`;
- email/senha depende de confirmacao de email para ficar ativo.
- `20260526013000_add_profile_details.sql` adiciona `avatar_url`, `bio`, `goal`, `experience_level`, indice unico de username em lowercase e constraints de goal/experience.

## Perfil

Tela:

```txt
src/pages/Profile.tsx
```

Componentes:

```txt
src/components/profile/ProfileHeader.tsx
src/components/profile/ProfileStats.tsx
src/components/profile/ProfileAchievements.tsx
src/components/profile/ProfileEditForm.tsx
src/components/profile/AvatarUploader.tsx
src/components/profile/LegacyTitles.tsx
src/components/workout-dna/WorkoutDnaCard.tsx
src/components/legacy/LegacySummary.tsx
src/components/legacy/LegacyTimeline.tsx
```

Service/repository:

```txt
src/services/profileService.ts
src/repositories/userRepository.ts
```

Regras:

- rota `profile` existe, mas nao aparece no menu principal;
- perfil e acessado pelo card do usuario no canto inferior esquerdo do shell;
- no mobile, o perfil tambem e acessado pelo avatar fixo no canto superior direito;
- o menu mobile do avatar mostra nome, email, plano, Meu Perfil, Configuracoes e Sair;
- a topbar mobile do avatar usa animacao de slide e nao altera o layout desktop.
- perfil exibe avatar, nome, username, email, plano, role, status, data de criacao, nivel, XP, treinos, PRs, streak e conquistas recentes;
- perfil exibe tambem Bodybuilding Legacy Titles, com titulo atual, tier, progresso, proximos titulos e destaque para MR. OLYMPIA;
- perfil exibe Workout DNA, calculado dinamicamente a partir de treinos/PRs/streak, sem persistir XP ou conquistas oficiais;
- perfil exibe Lifto Legacy System MVP, com marcos automaticos derivados de treinos, PRs, streak, volume e titulos;
- usuario pode editar nome, username, avatar e bio;
- username usa apenas letras, numeros, ponto e underline, minimo 3 caracteres e deve ser unico;
- bio tem limite de 160 caracteres;
- avatar aceita JPG, PNG ou WEBP ate 2MB;
- campos sensiveis (`role`, `plan`, `status`, `emailVerified`) nao sao editaveis pelo frontend.

## Permissoes

Arquivos:

```txt
src/utils/validators/permissionValidator.ts
src/utils/validators/planValidator.ts
src/services/permissionService.ts
src/services/planService.ts
```

Regras:

- `admin` tem acesso total;
- suspensos ou sem email verificado nao tem permissoes;
- `entry`: uso basico, limite de 20 fichas;
- `core`: recursos individuais premium;
- `coach`: painel profissional;
- `elite`: areas enterprise;
- role e plan sao avaliados juntos para coach/elite.

## Rotas

Rotas:

```txt
home
plans
workout
progress
profile
settings
login
register
reset-password
auth-success
auth-error
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
auth-success
auth-error
auth/callback
```

Redirecionamento:

```txt
admin -> admin
elite -> elite
coach/professional -> coach
casual/core/entry -> home
```

Protecao:

- deslogado em rota privada vai para `login`;
- logado em rota publica vai para rota correta;
- usuario pendente vai para `verify-email`;
- casual nao acessa `coach`, `elite` ou `admin`;
- coach nao acessa `elite`;
- admin acessa tudo.

Arquivo:

```txt
src/guards/routeGuards.ts
```

## Dados e Persistencia

Entidades principais usam:

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
- `WorkoutSet`
- `PersonalRecord`
- `SavedExercise`
- `CoachStudentRelation`
- `CoachInvite`
- `SharedWorkoutPlan`
- `CoachNote`

Store:

```txt
src/store/useAppStore.ts
```

Repository:

```txt
src/repositories/workoutRepository.ts
```

Com Supabase:

- le `workout_plans`;
- le `workout_sessions`;
- le `personal_records`;
- salva via `upsert`;
- remove dados ausentes filtrando por `user_id`;
- normaliza `isPr/prType` vindos de JSONB;
- persiste `is_pr/pr_type` dentro de `workout_sessions.exercises`.

Sem Supabase:

- usa `databaseClient` com localStorage;
- grava novas chaves `lifto_*`;
- le chaves antigas `lifting_*` e `content_env_*` como fallback e migra silenciosamente para `lifto_*`;
- migra dados legados de `content-env-store`;
- semeia dados iniciais de `src/data/mockData.ts`.

## Exercicios e Fichas

Base fixa:

```txt
src/data/exercises.ts
```

Editor:

```txt
src/features/workoutPlans/PlanEditor.tsx
```

Direcao:

- exercicios por grupo muscular;
- selecao dentro do editor;
- evitar biblioteca generica solta;
- tela de fichas nao possui busca textual; manter somente filtro por grupo muscular;
- ficha tem titulo, descricao compacta, cor, grupos musculares e blocos;
- nao usar icones de ficha.

## Treino, Series e PR

Arquivos:

```txt
src/pages/Workout.tsx
src/components/workout/WorkoutSetRow.tsx
src/utils/records.ts
```

RPE foi removido.

`WorkoutSet` atual:

```ts
WorkoutSet {
  id;
  weight;
  reps;
  isPr?;
  prType?: "weight" | "reps" | "volume";
  rest?;
  notes?;
  completed?;
}
```

UI de serie:

```txt
[Serie] [Peso] [Repeticoes] [PR] [Ok] [Remover]
```

O botao `Finalizar treino` fica no final da lista de exercicios, como bloco normal do fluxo, para nao cobrir inputs no mobile.

Botao PR:

- neutro quando desligado;
- dourado/amarelo quando ativo;
- usa icone/animacao;
- ao salvar, marca `completed = true` para aquela serie se `isPr = true`.

Tipos de PR:

```ts
PersonalRecordType =
  | "absolute_weight"
  | "estimated_1rm"
  | "set_volume"
  | "max_reps";
```

Formula de 1RM:

```ts
estimated1RM = weight * (1 + reps / 30)
```

Regras:

- series com peso e reps validos geram PR automatico quando batem anterior;
- series marcadas manualmente com `isPr` servem apenas como destaque visual/momento favorito e nao geram PR oficial sozinhas;
- PR oficial exige serie completa, carga/reps validas, sanidade anti-spam e margem minima de progresso;
- carga absurda, reps invalidas, serie incompleta ou progresso insignificante nao viram PR;
- exercicios compostos exigem pelo menos +2kg em Weight PR, isolados pelo menos +1kg;
- PRs sao classificados como bronze, silver, gold ou legendary por `classifyPersonalRecord()`;
- `recordValueLabel()` evita mostrar `kg` em PR de repeticoes.

Migration:

```txt
supabase/migrations/20260525153000_add_manual_pr_sets.sql
```

Ela adiciona `max_reps` ao enum `personal_record_type` e documenta `isPr/is_pr` e `prType/pr_type` no JSONB de sessoes.

## Gamificacao e Conquistas

Arquivos:

```txt
src/features/gamification/useGamificationStore.ts
src/services/gamificationService.ts
src/repositories/gamificationRepository.ts
src/features/gamification/xpSystem.ts
src/features/gamification/titles.ts
src/features/achievements/achievements.ts
supabase/migrations/20260527190000_secure_gamification_and_audit.sql
supabase/migrations/20260527201000_smart_xp_pr_system.sql
supabase/migrations/20260528120000_remove_pr_xp_and_frequency_streak.sql
supabase/migrations/20260528123000_move_duration_xp_to_streak.sql
```

Progressao:

```ts
UserProgression {
  level;
  xp;
  totalXp;
  totalVolume;
  streak;
  achievements;
  titleIds;
  currentTitleId;
}
```

XP:

```txt
Treino concluido: +100 XP
Treino sem series incompletas: +25 XP
Todos os exercicios completos: +50 XP
Volume medio/alto/extremo: +20/+50/+100 XP
Streaks recebem os pontos que antes vinham de duracao do treino
3/7/14/30 dias seguidos: +60/+165/+365/+1020 XP
Streaks longos e longevidade aplicam bonus maiores em marcos raros
PR nao gera XP, nao altera streak e nao entra nos multiplicadores
```

Iron Streak:

```txt
3 treinos na semana: x1.1
4 treinos: x1.25
5 treinos: x1.5
6+ treinos: x1.8
```

Niveis:

```txt
1-5     Iniciante
6-15    Consistente
16-30   Forte
31-50   Elite
51+     Lenda
```

Conquistas implementadas:

- primeiro treino;
- 7 dias seguidos;
- 30 dias seguidos;
- 10 PRs;
- 50 PRs;
- 100 series concluidas;
- 40kg no supino;
- 100kg no supino;
- 300kg no leg press;
- 40kg no agachamento.

Raridades:

```txt
common
rare
epic
legendary
```

Persistencia atual da gamificacao:

- fonte oficial deve ser Supabase, via tabelas `user_progression`, `user_achievements`, `user_titles`, `user_streaks` e `user_xp_history`;
- `useGamificationStore` chama `gamificationService.syncProgression(userId)`;
- o RPC `sync_user_progression()` recalcula XP, nivel, streak, Iron Streak, conquistas e titulos com base em dados persistidos do usuario autenticado;
- PRs podem alimentar memoria historica, conquistas e titulos de legado, mas nao geram XP nem Iron Streak;
- cache local existe apenas via `databaseClient` para UX/fallback, nunca como fonte oficial;
- cache novo usa `lifto_user_progression_cache` com fallback para `lifting_user_progression_cache`;
- o frontend nao deve desbloquear conquista, titulo ou XP oficial por conta propria.

## Bodybuilding Legacy Titles

Arquivos:

```txt
src/features/gamification/titles.ts
src/components/profile/LegacyTitles.tsx
src/features/gamification/titles.test.ts
```

Direcao:

- classificar o usuario em titulos de progressao inspirados em musculacao/bodybuilding;
- transmitir legado fisico, disciplina, prestigio e cultura bodybuilding;
- preparar integracao futura com Timeline de Evolucao Fisica, Workout Replay, Ghost Progress, Workout DNA e Legacy System.

Tiers:

```txt
Tier 1 - Construcao
Tier 2 - Evolucao
Tier 3 - Dominio
Tier 4 - Legado
Tier 5 - Absoluto
```

Regras:

- titulos usam requisitos por level, workouts, PRs, streak ou volume;
- `MR. OLYMPIA` e mythic, tier 5, desbloqueado apenas com volume historico extremo;
- componente no perfil exibe titulos oficiais vindos de `useGamificationStore.titleIds`;
- fallback visual pode calcular progresso local, mas desbloqueio oficial vem do RPC/tabelas de gamificacao.

## Workout DNA

Arquivos:

```txt
src/features/workout-dna/workoutDnaTypes.ts
src/features/workout-dna/workoutDnaRules.ts
src/features/workout-dna/workoutDnaService.ts
src/features/workout-dna/workoutDna.test.ts
src/components/workout-dna/WorkoutDnaCard.tsx
src/components/workout-dna/WorkoutDnaSummary.tsx
```

Objetivo:

- responder "que tipo de atleta o usuario esta se tornando";
- criar uma camada reutilizavel para perfil, progresso, legacy, coach dashboard, desafios e tribos futuras;
- evitar dashboard tecnico pesado.

MVP atual:

- nao usa IA;
- nao persiste em Supabase;
- calcula dinamicamente a partir de `workout_sessions`, `personal_records`, `src/data/exercises.ts` e `useGamificationStore.streak`;
- aparece como card completo em `Profile` e card compacto em `Progress`;
- nao altera XP oficial, conquistas oficiais, PR oficial, permissoes, roles ou planos.

Resultado calculado:

```ts
WorkoutDnaProfile {
  archetype;
  secondaryArchetype?;
  summary;
  strengths;
  attentionPoints;
  dominantGroups;
  neglectedGroups;
  favoriteExercises;
  averageWeeklyFrequency;
  dominantStyle;
  scores: {
    balance;
    consistency;
    strength;
    volume;
  };
  totalVolume;
  totalSets;
  prCount;
  workoutCount;
}
```

Arquetipos:

```txt
Construtor  - volume consistente e evolucao gradual
Tita        - foco em forca, cargas e PRs
Incansavel  - alta frequencia e consistencia
Especialista - foco forte em poucos grupos musculares
Equilibrado - distribuicao mais balanceada
```

Regras:

- logica fica em `workoutDnaRules.ts`, com funcoes puras e testaveis;
- componentes apenas consomem o resultado do service;
- dados inconsistentes devem gerar scores seguros, sem exceptions na UI;
- usuario sem dados recebe perfil inicial seguro e pontos de atencao para gerar mais historico.

## Lifto Legacy System

Arquivos:

```txt
src/features/legacy/legacyTypes.ts
src/features/legacy/legacyRules.ts
src/features/legacy/legacyService.ts
src/features/legacy/legacy.test.ts
src/components/legacy/LegacySummary.tsx
src/components/legacy/LegacyTimeline.tsx
src/components/legacy/LegacyEventCard.tsx
```

Objetivo:

- responder "qual historia esse usuario esta construindo com o treino";
- transformar historico em narrativa fitness;
- manter camada emocional/premium sem virar feed social.

MVP atual:

- nao usa fotos;
- nao cria rede social, feed publico ou ranking;
- nao persiste em Supabase;
- calcula eventos dinamicamente a partir de sessoes, PRs, `user_progression`, `user_titles` e estatisticas locais/fallback;
- aparece no perfil como secao "Legacy".

Eventos automaticos atuais:

```txt
primeiro treino
10 treinos
50 treinos
100 treinos
primeiro PR
PR de impacto
streak de 7 dias
streak de 30 dias
volume historico
titulo conquistado
```

Decisao de persistencia:

- foi escolhida a opcao dinamica para o MVP;
- nenhuma migration Supabase foi criada;
- se no futuro for criada `legacy_events`, antes listar tabela, colunas, indexes, policies, risco de dados existentes e RLS/ownership;
- fotos de evolucao exigem Supabase Storage, privacidade, custo e RLS, e nao fazem parte do MVP atual.

Regras:

- eventos devem ser deduplicados;
- eventos devem ser derivados de dados reais existentes;
- frontend nao pode criar XP oficial, conquista oficial ou permissao privilegiada por causa do Legacy;
- DNA pode alimentar Legacy futuramente, mas no MVP as features permanecem desacopladas.

## Auditoria e Hardening

Arquivos:

```txt
src/services/auditService.ts
src/repositories/auditRepository.ts
supabase/migrations/20260527190000_secure_gamification_and_audit.sql
```

Eventos auditados:

- login com sucesso/falha;
- signup;
- logout;
- reset de senha solicitado;
- acesso negado por guard;
- tentativa de login profissional sem permissao;
- conta suspensa;
- perfil atualizado;
- tentativa de alterar campos protegidos;
- sincronizacao de gamificacao.

Regras:

- `auditService` sanitiza metadata e remove `password`, `token`, `refresh_token`, `access_token` e `secret`;
- falha de auditoria nao deve bloquear o fluxo do usuario;
- migration cria `security_audit_logs` com RLS;
- migration adiciona trigger para bloquear update publico de `role`, `plan`, `status`, `email_verified` e `created_at` em `profiles`;
- upgrades de plano/role/status precisam vir de backend, admin, pagamento confirmado ou processo interno seguro.

## Progresso

Arquivo:

```txt
src/pages/Progress.tsx
```

Direcao:

- maximo 2 graficos principais;
- grafico de PR/evolucao de forca;
- grafico de frequencia;
- insights e conquistas recentes;
- inclui card compacto de Workout DNA como camada identitaria, sem transformar a tela em dashboard tecnico;
- evitar excesso de dashboard.

`Progress.tsx` usa grafico SVG proprio para linha/barra. Recharts permanece no bundle para telas/componentes que ainda usam graficos, mas deve ser lazy quando possivel.

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

Estado:

- painel existe como fundacao;
- dados de coach possuem mocks/estrutura;
- PRs e sessoes marcadas devem futuramente aparecer melhor no painel do coach;
- funcionalidades enterprise completas ainda sao futuras.

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

Observacao de seguranca:

- o PDF usa `window.open` + `document.write`;
- conteudo textual passa por `escapeHtml`;
- se ampliar a exportacao, sanitizar qualquer valor usado em `style`, como `plan.color`.

## Bundle e Performance

Vite:

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

## Testes

Testes:

```txt
src/features/gamification/titles.test.ts
src/features/gamification/useGamificationStore.test.ts
src/features/gamification/xpSystem.test.ts
src/features/legacy/legacy.test.ts
src/features/workout-dna/workoutDna.test.ts
src/repositories/workoutRepository.test.ts
src/services/auditService.test.ts
src/services/authService.test.ts
src/services/databaseClient.test.ts
src/services/gamificationService.test.ts
src/services/profileService.test.ts
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
npm run test  - 50 testes passaram
npm run build - passou
```

`npm audit --omit=dev` tambem passou com 0 vulnerabilidades na ultima revisao.

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
20260525153000_add_manual_pr_sets.sql
20260526013000_add_profile_details.sql
20260527190000_secure_gamification_and_audit.sql
20260527201000_smart_xp_pr_system.sql
20260528120000_remove_pr_xp_and_frequency_streak.sql
20260528123000_move_duration_xp_to_streak.sql
```

Nao remover migrations antigas sem cuidado. A historia do banco depende delas.

## Documentacao Local

```txt
LIFTING_AUTH_BUSINESS_RULES.txt
LIFTING_IMPLEMENTED_BUSINESS_RULES.txt
LIFTING_GOOGLE_OAUTH_ERROR.md
Lifto_future_features.txt
CONTEXT.md
content_env_master_prompt.md
```

`CONTEXT.md` deve ser atualizado sempre que uma decisao estrutural mudar.

## Cuidados Criticos

- Nunca colocar service role key no frontend.
- Nunca confiar no frontend para role, plan, status ou email verification.
- Nao criar bypass admin em producao.
- Nao chamar Supabase direto em componentes para dados de dominio.
- Nao quebrar `/auth/callback`; ele precisa renderizar com `Suspense`.
- Se OAuth mostrar `Unable to exchange external code`, revisar configuracao Supabase/Google antes de culpar codigo.
- Nao remover RLS, triggers ou policies de ownership.
- Se mexer em auth, rodar testes de `authService` e `routeGuards`.
- Se mexer em PRs/treino, rodar testes de `records`.

## Git e Deploy

Repositorio:

```txt
https://github.com/gabrielgonzag/Lifting.git
```

Branch:

```txt
main
```

Deploy conhecido:

```txt
https://lifting.up.railway.app
```

Observacao: LIFTO e o branding oficial, mas o deploy segue no dominio Railway provisionado `lifting.up.railway.app`. Qualquer dominio novo precisa ser validado no Railway, Supabase Auth e Google OAuth antes de entrar no app.

Antes de commit/push:

```bash
git status -sb
npm run lint
npm run test
npm run build
```

## Commits Recentes Relevantes

```txt
ddf5a1f apply lifting design system
6a430fb restore email auth flows
adf40aa clean oauth callback url after login
5f23c02 replace rpe with personal record marker
2c6bcac tighten supabase password policy
```

## Estado Atual

O sistema esta em transicao de app local para produto SaaS fitness:

- autenticacao Google + email/senha via Supabase;
- profiles e ownership por usuario;
- planos e permissoes modelados;
- fichas e treinos persistidos por usuario;
- PR substituiu RPE no fluxo de treino;
- progresso com graficos e insights;
- Workout DNA dinamico identifica arquetipo, estilo, scores e pontos fortes/de atencao do usuario;
- Lifto Legacy System MVP exibe marcos narrativos no perfil sem persistencia nova;
- gamificacao sincroniza XP, nivel, conquistas e titulos oficiais via Supabase/RPC;
- auditoria de eventos sensiveis foi adicionada com sanitizacao de metadata;
- painel profissional preparado;
- perfil de usuario com edicao segura e estatisticas pessoais;
- rotas protegidas;
- design system premium aplicado nas telas principais.

Prioridades atuais:

1. garantir migrations aplicadas no Supabase remoto;
2. validar auth Google e email/senha em producao;
3. alinhar backend para criacao segura de profissionais/coaches se esse fluxo for liberado;
4. evoluir painel do coach para destacar PRs dos alunos;
5. aplicar migrations `20260526013000_add_profile_details.sql` e `20260527190000_secure_gamification_and_audit.sql` no Supabase remoto;
6. validar a RPC `sync_user_progression()` em producao apos aplicar migrations;
7. continuar migrando telas remanescentes para o design system novo;
8. evoluir Workout DNA para coach dashboard e insights mais refinados;
9. avaliar persistencia futura de `legacy_events` somente se snapshots historicos forem necessarios;
10. fases futuras planejadas: Desafios Sociais controlados e Tribos Privadas.
