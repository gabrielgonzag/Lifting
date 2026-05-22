# CONTENT.ENV — Aplicação Fitness Notebook

## Prompt mestre para Codex

Você é um engenheiro de software sênior especializado em React, TypeScript, UX/UI, aplicações fitness, arquitetura escalável, visualização de dados e apps mobile-first.

Sua missão é criar uma aplicação completa chamada **CONTENT.ENV**.

A aplicação deve ser um bloco de notas fitness inteligente para registrar treinos, séries, repetições, cargas, evolução de força e fichas personalizadas por grupo muscular.

---

# 1. Objetivo principal

Criar uma aplicação moderna onde o usuário consiga:

- montar fichas de treino personalizadas;
- escolher exercícios específicos por grupo muscular;
- registrar séries, repetições e cargas;
- salvar histórico de treinos;
- acompanhar evolução de força;
- personalizar títulos, cores e blocos de treino;
- organizar treinos de membros superiores e inferiores;
- futuramente portar para mobile.

A experiência deve parecer um app premium de academia, com visual moderno, rápido, limpo, organizado e responsivo.

---

# 2. Stack obrigatória

Use obrigatoriamente:

- React;
- TypeScript;
- Vite;
- TailwindCSS;
- shadcn/ui;
- Zustand para estado global;
- Recharts para gráficos;
- Framer Motion para animações;
- LocalStorage para persistência inicial.

A arquitetura deve estar preparada para futura integração com:

- Supabase;
- Firebase;
- PostgreSQL;
- React Native;
- Expo;
- autenticação de usuário;
- sincronização em nuvem.

---

# 3. Identidade visual

## Tema padrão

- Fundo principal: `#303030`
- Visual dark premium;
- Cards arredondados;
- Sombras suaves;
- Interface moderna;
- Animações fluidas;
- Layout mobile-first.

## Inspiração visual

A interface pode se inspirar em:

- Notion;
- Strong App;
- Hevy;
- Nike Training Club;
- apps fitness premium;
- dashboards modernos.

---

# 4. Personalização

O usuário deve conseguir:

## Fichas

- criar ficha;
- editar ficha;
- deletar ficha;
- duplicar ficha;
- alterar nome da ficha;
- alterar descrição;
- alterar cor da ficha;
- alterar ícone da ficha;
- alterar ordem dos exercícios.

## Blocos de treino

- personalizar cor dos blocos;
- alterar título do bloco;
- agrupar exercícios por músculo;
- criar blocos para membros superiores e inferiores.

## Exercícios

- adicionar exercício;
- remover exercício;
- pesquisar exercício;
- filtrar por grupo muscular;
- filtrar por equipamento;
- favoritar exercício;
- adicionar observações.

---

# 5. Grupos musculares obrigatórios

## Membros superiores

- Peito;
- Costas;
- Ombro;
- Bíceps;
- Tríceps.

## Membros inferiores

- Quadríceps;
- Posterior de coxa;
- Glúteo;
- Panturrilha.

---

# 6. Banco de exercícios obrigatório

A aplicação deve possuir um banco interno com todos os exercícios abaixo, organizados corretamente por grupo muscular.

Cada exercício deve possuir:

```ts
type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  category: 'membros superiores' | 'membros inferiores';
  equipment: string;
  variation: string;
  isFavorite?: boolean;
  notes?: string;
};
```

---

# 7. Exercícios por grupo muscular

## Peito

1. Supino reto com barra (livre)
2. Supino reto com halteres (livre)
3. Supino na máquina articulada (máquina)
4. Supino inclinado com barra (livre)
5. Supino inclinado com halteres (livre)
6. Supino declinado (livre)
7. Crucifixo reto com halteres (livre)
8. Crucifixo inclinado (livre)
9. Peck deck / voador (máquina)
10. Cross-over na polia alta (máquina/polia)
11. Cross-over polia baixa (máquina/polia)
12. Flexão tradicional (peso corporal)
13. Flexão inclinada (peso corporal)
14. Flexão declinada (peso corporal)
15. Paralelas focadas no peito (peso corporal)
16. Pullover com halter (livre)
17. Chest press horizontal (máquina)
18. Chest press inclinado (máquina)
19. Supino convergente articulado (máquina)
20. Crucifixo no cabo unilateral (polia)

## Costas

1. Barra fixa pronada (peso corporal)
2. Barra fixa supinada (peso corporal)
3. Pulldown frontal (máquina)
4. Pulldown articulado (máquina)
5. Remada curvada com barra (livre)
6. Remada unilateral com halter (livre)
7. Remada baixa na polia (máquina/polia)
8. Remada cavalinho / T-bar (livre/máquina)
9. Remada articulada (máquina)
10. Pull-over na polia (polia)
11. Serrote unilateral (livre)
12. Remada invertida (peso corporal)
13. Deadlift / levantamento terra (livre)
14. Rack pull (livre)
15. Remada alta aberta (livre)
16. Pulldown pegada neutra (máquina)
17. Pulldown supinado (máquina)
18. Remada Hammer Strength (máquina)
19. Seal row (livre)
20. Remada sentado triangulo (polia)

## Ombro

1. Desenvolvimento com barra (livre)
2. Desenvolvimento com halteres (livre)
3. Desenvolvimento Arnold (livre)
4. Desenvolvimento na máquina (máquina)
5. Elevação lateral com halteres (livre)
6. Elevação lateral na polia (polia)
7. Elevação lateral máquina (máquina)
8. Elevação frontal com barra (livre)
9. Elevação frontal com halter (livre)
10. Elevação frontal na polia (polia)
11. Crucifixo inverso com halteres (livre)
12. Crucifixo inverso máquina (máquina)
13. Face pull (polia)
14. Remada alta (livre)
15. Desenvolvimento militar sentado (livre)
16. Handstand push-up (peso corporal)
17. Desenvolvimento Smith (máquina guiada)
18. Cuban press (livre)
19. Y-raise na polia (polia)
20. Elevação lateral unilateral inclinada (livre)

## Bíceps

1. Rosca direta barra reta (livre)
2. Rosca direta barra W (livre)
3. Rosca alternada com halteres (livre)
4. Rosca martelo (livre)
5. Rosca martelo corda (polia)
6. Rosca Scott máquina (máquina)
7. Rosca Scott barra W (livre)
8. Rosca concentrada (livre)
9. Rosca inclinada com halteres (livre)
10. Rosca spider (livre)
11. Rosca unilateral polia baixa (polia)
12. Rosca Bayesian (polia)
13. Chin-up supinado (peso corporal)
14. Rosca 21 (livre)
15. Rosca inversa (livre)
16. Rosca no cabo reto (polia)
17. Rosca máquina articulada (máquina)
18. Rosca cross-body hammer (livre)
19. Rosca pronada (livre)
20. Rosca isométrica unilateral (livre)

## Tríceps

1. Tríceps pulley barra reta (polia)
2. Tríceps pulley corda (polia)
3. Tríceps francês halter (livre)
4. Tríceps francês unilateral (livre)
5. Tríceps testa barra W (livre)
6. Tríceps testa halteres (livre)
7. Supino fechado (livre)
8. Mergulho nas paralelas (peso corporal)
9. Bench dips (peso corporal)
10. Tríceps coice halter (livre)
11. Tríceps coice polia (polia)
12. Extensão acima da cabeça na corda (polia)
13. Tríceps máquina articulada (máquina)
14. Tríceps unilateral na polia (polia)
15. JM press (livre)
16. Tate press (livre)
17. Flexão diamante (peso corporal)
18. Tríceps Smith fechado (máquina guiada)
19. Pulley invertido (polia)
20. Skull crusher barra reta (livre)

## Quadríceps

1. Agachamento livre (livre)
2. Agachamento frontal (livre)
3. Agachamento Smith (máquina guiada)
4. Leg press 45° (máquina)
5. Leg press horizontal (máquina)
6. Cadeira extensora (máquina)
7. Hack squat (máquina)
8. Sissy squat (peso corporal)
9. Afundo com halteres (livre)
10. Passada / walking lunge (livre)
11. Bulgarian split squat (livre)
12. Step-up com halteres (livre)
13. Goblet squat (livre)
14. Zercher squat (livre)
15. Belt squat (máquina)
16. Agachamento pausa (livre)
17. Wall sit (isométrico)
18. Pistol squat (peso corporal)
19. Agachamento sumô (livre)
20. Reverse Nordic curl (peso corporal)

## Posterior de Coxa

1. Stiff com barra (livre)
2. Stiff com halteres (livre)
3. Romanian deadlift (livre)
4. Mesa flexora (máquina)
5. Cadeira flexora (máquina)
6. Flexora unilateral (máquina)
7. Nordic curl (peso corporal)
8. Good morning (livre)
9. Levantamento terra tradicional (livre)
10. Terra sumô (livre)
11. Glute ham raise (máquina/peso corporal)
12. Pull-through na polia (polia)
13. Swing com kettlebell (livre)
14. Stiff unilateral (livre)
15. Flexão nórdica assistida (peso corporal)
16. Cabo entre pernas (polia)
17. Deadlift deficit (livre)
18. Rack pull focado posterior (livre)
19. Hip hinge com miniband (elástico)
20. Flexora sentado unilateral (máquina)

## Glúteo

1. Hip thrust com barra (livre)
2. Hip thrust máquina (máquina)
3. Glute bridge (livre/peso corporal)
4. Coice na polia (polia)
5. Coice máquina (máquina)
6. Abdução máquina (máquina)
7. Abdução com miniband (elástico)
8. Agachamento sumô (livre)
9. Afundo búlgaro (livre)
10. Step-up alto (livre)
11. Stiff romeno (livre)
12. Pull-through (polia)
13. Frog pump (peso corporal/livre)
14. Cable kickback unilateral (polia)
15. Kettlebell swing (livre)
16. Glute bridge unilateral (peso corporal)
17. Reverse hyperextension (máquina)
18. Caminhada lateral miniband (elástico)
19. Curtsy lunge (livre)
20. Agachamento profundo pausado (livre)

## Panturrilha

1. Panturrilha em pé máquina (máquina)
2. Panturrilha sentado (máquina)
3. Panturrilha no leg press (máquina)
4. Panturrilha unilateral em pé (peso corporal)
5. Panturrilha com halteres (livre)
6. Donkey calf raise (máquina/livre)
7. Panturrilha Smith (máquina guiada)
8. Panturrilha no hack squat (máquina)
9. Saltos na ponta dos pés (pliometria)
10. Pular corda (peso corporal)
11. Farmer walk na ponta dos pés (livre)
12. Tibialis raise (peso corporal/máquina)
13. Panturrilha explosiva no step (peso corporal)
14. Panturrilha unilateral sentado (livre)
15. Panturrilha no step com pausa (peso corporal)
16. Seated calf dumbbell raise (livre)
17. Calf raise barra livre (livre)
18. Panturrilha no Smith unilateral (máquina guiada)
19. Calf press horizontal (máquina)
20. Sprint curto focado em panturrilha (atlético)

---

# 8. Registro de treino

Cada exercício dentro de uma ficha deve permitir registrar:

- número de séries;
- repetições por série;
- carga por série;
- RPE opcional;
- tempo de descanso;
- observações;
- data do treino;
- marcação de recorde pessoal.

Modelo sugerido:

```ts
type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  rest?: number;
  notes?: string;
};

 type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
};

 type WorkoutSession = {
  id: string;
  workoutPlanId: string;
  date: string;
  exercises: WorkoutExercise[];
};
```

---

# 9. Telas obrigatórias

## Home

Deve conter:

- resumo semanal;
- fichas recentes;
- último treino;
- volume total da semana;
- evolução rápida;
- atalhos para criar ficha e iniciar treino.

## Tela de fichas

Deve conter:

- cards das fichas;
- botão para criar ficha;
- busca;
- filtros;
- ordenação;
- opção de editar, duplicar e deletar.

## Tela de criação/edição de ficha

Deve conter:

- título personalizável;
- cor personalizável;
- descrição;
- seleção de grupos musculares;
- busca de exercícios;
- lista de exercícios adicionados;
- drag and drop para reordenar.

## Tela de treino

Deve conter:

- exercícios da ficha;
- campos para carga;
- campos para repetições;
- campos para séries;
- botão para adicionar série;
- botão para remover série;
- timer de descanso;
- observações;
- botão finalizar treino.

## Tela de progresso

Deve conter:

- gráfico de evolução de carga;
- gráfico de volume;
- frequência semanal;
- recordes pessoais;
- exercícios mais treinados.

## Tela de configurações

Deve conter:

- tema;
- cores;
- backup;
- exportação JSON;
- importação JSON;
- limpar dados locais.

---

# 10. Gráficos obrigatórios

Use Recharts para criar:

- gráfico de evolução de carga por exercício;
- gráfico de volume total por semana;
- gráfico de frequência de treino;
- gráfico de evolução corporal futura;
- gráfico de recordes pessoais.

---

# 11. Estado global

Use Zustand para gerenciar:

- fichas de treino;
- exercícios selecionados;
- sessões de treino;
- histórico;
- preferências visuais;
- favoritos;
- dados do usuário.

Persistir tudo inicialmente em LocalStorage.

---

# 12. Estrutura de pastas esperada

```bash
src/
 ├── assets/
 ├── components/
 │   ├── common/
 │   ├── layout/
 │   ├── workout/
 │   ├── charts/
 │   └── ui/
 ├── data/
 │   └── exercises.ts
 ├── features/
 │   ├── workoutPlans/
 │   ├── workoutSession/
 │   ├── progress/
 │   └── settings/
 ├── hooks/
 ├── pages/
 │   ├── Home.tsx
 │   ├── Plans.tsx
 │   ├── Workout.tsx
 │   ├── Progress.tsx
 │   └── Settings.tsx
 ├── services/
 ├── store/
 │   └── useAppStore.ts
 ├── types/
 ├── utils/
 ├── styles/
 ├── App.tsx
 └── main.tsx
```

---

# 13. Requisitos de UX/UI

A interface deve ter:

- responsividade real;
- navegação intuitiva;
- botões grandes no mobile;
- cards fáceis de tocar;
- feedback visual ao salvar;
- estados vazios bem desenhados;
- loading states;
- microinterações;
- animações suaves;
- modais bonitos;
- componentes reutilizáveis.

---

# 14. Animações

Use Framer Motion para:

- transição entre páginas;
- abertura de cards;
- expansão de exercício;
- hover em botões;
- entrada de modais;
- feedback ao finalizar treino.

---

# 15. Regras importantes

- Não criar uma interface genérica.
- Não criar componentes gigantes.
- Não deixar dados hardcoded espalhados pelo projeto.
- Centralizar os exercícios em `src/data/exercises.ts`.
- Criar tipagens em `src/types`.
- Separar lógica de UI.
- Manter código limpo, modular e escalável.
- O app deve funcionar sem backend no primeiro momento.
- O app deve salvar os dados no navegador.
- A aplicação precisa parecer um produto real.

---

# 16. Funcionalidades futuras

Preparar o projeto para receber futuramente:

## Mobile

- React Native;
- Expo;
- modo offline;
- notificações de treino.

## Backend

- Supabase;
- Firebase;
- autenticação;
- banco de dados;
- sincronização na nuvem.

## IA Fitness

- sugestões automáticas de treino;
- sugestão de carga;
- análise de progressão;
- alertas de estagnação;
- recomendações por objetivo.

## Medidas corporais

- peso;
- altura;
- braço;
- peito;
- cintura;
- quadril;
- coxa;
- panturrilha;
- percentual de gordura;
- IMC;
- metabolismo basal.

## Sistema de notas

- nota do treino;
- humor;
- energia;
- sono;
- dificuldade;
- observações livres.

---

# 17. Entrega esperada

Entregue:

1. projeto React completo;
2. estrutura organizada;
3. componentes reutilizáveis;
4. páginas funcionais;
5. banco de exercícios completo;
6. tipagens TypeScript;
7. estado global com Zustand;
8. persistência local;
9. gráficos com Recharts;
10. animações com Framer Motion;
11. tema dark com fundo `#303030`;
12. layout responsivo;
13. README.md explicando como rodar;
14. dados mockados iniciais;
15. app funcional sem backend.

---

# 18. Ordem de execução sugerida

Siga esta ordem:

1. criar projeto com Vite + React + TypeScript;
2. configurar TailwindCSS;
3. configurar shadcn/ui;
4. criar tipos globais;
5. criar banco de exercícios;
6. criar Zustand store;
7. criar layout base;
8. criar navegação;
9. criar tela Home;
10. criar tela de fichas;
11. criar criação/edição de ficha;
12. criar tela de treino;
13. criar tela de progresso;
14. criar tela de configurações;
15. adicionar persistência LocalStorage;
16. adicionar gráficos;
17. adicionar animações;
18. revisar responsividade;
19. criar README.md.

---

# 19. Resultado final esperado

O resultado final deve ser um aplicativo fitness moderno, premium e altamente personalizável, funcionando como um bloco de notas inteligente para treino.

O usuário deve conseguir abrir a aplicação, criar uma ficha, escolher exercícios por grupo muscular, registrar séries/repetições/cargas e visualizar sua evolução.

A aplicação deve estar pronta para crescer no futuro para mobile, backend, IA e analytics.
