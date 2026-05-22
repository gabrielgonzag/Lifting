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

- Home com resumo semanal, ultimo treino e atalhos.
- Fichas com busca, filtro, ordenacao, criacao, edicao, duplicacao e exclusao.
- Editor de ficha com cor, icone, descricao, bloco personalizado, biblioteca filtravel, favoritos e reordenacao por drag and drop.
- Tela de treino com series, carga, repeticoes, RPE, descanso, observacoes, timer e recordes automaticos.
- Progresso com graficos de carga, volume, frequencia, recordes e exercicios mais treinados.
- Configuracoes com cor de destaque, densidade, exportacao/importacao JSON e restauracao dos dados locais.

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

O banco interno de exercicios fica centralizado em `src/data/exercises.ts`. A persistencia inicial mora em `src/store/useAppStore.ts`, pronta para ser trocada futuramente por uma camada de sincronizacao remota.
