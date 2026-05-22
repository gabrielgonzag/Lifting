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

## Login com Google

O botao de login Google usa o provider OAuth do Supabase. Para habilita-lo no projeto remoto:

1. Crie um OAuth Client Web no Google Auth Platform.
2. Adicione o callback do provider Google exibido pelo Supabase como Authorized redirect URI no Google.
3. Habilite Google em Authentication > Providers no Supabase e informe o Client ID e Client Secret.
4. Inclua as URLs do app, como `http://127.0.0.1:5173`, na configuracao de Site URL/Redirect URLs do Supabase.

Para o Supabase local, preencha `client_id` em `supabase/config.toml`, exponha o segredo apenas por `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` e habilite o provider local.

## Fluxos implementados

- Home limpa com fichas, ultimo treino e atalhos de treino.
- Fichas com busca, filtro, ordenacao, criacao, edicao, duplicacao e exclusao.
- Editor de ficha com grupos musculares selecionaveis, secoes colapsaveis e reordenacao por drag and drop.
- Tela de treino com linhas compactas de serie, inputs numericos vazios, nota recolhida, timer e feedback de conclusao.
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
