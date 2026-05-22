# CONTENT.ENV

Bloco de notas fitness para criar fichas, registrar series e acompanhar evolucao com dados persistidos no navegador.

## Stack

- React + TypeScript + Vite
- TailwindCSS com componentes UI locais no padrao shadcn
- Zustand com `localStorage`
- Recharts para metricas
- Framer Motion para transicoes

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite.

Para validar o bundle:

```bash
npm run build
```

## Fluxos implementados

- Home limpa com fichas, ultimo treino e atalhos de treino.
- Fichas com busca, filtro, ordenacao, criacao, edicao, duplicacao e exclusao.
- Editor de ficha com grupos musculares selecionaveis, secoes colapsaveis e reordenacao por drag and drop.
- Tela de treino com series rapidas, inputs numericos vazios, steppers, RPE, descanso, timer e feedback de serie salva.
- PRs de carga, 1RM estimado por Epley e volume por serie.
- Progresso com curva principal de forca, frequencia semanal e insights resumidos.
- Backup com exportacao PDF, exportacao/importacao JSON e reset com confirmacao.

## Estrutura

```text
src/
  assets/
  components/
  data/
  features/
  pages/
  store/
  styles/
  types/
  utils/
```

O banco interno de exercicios fica centralizado em `src/data/exercises.ts`. A persistencia separa fichas, sessoes e PRs em chaves locais dedicadas antes de uma futura camada de sincronizacao remota.
