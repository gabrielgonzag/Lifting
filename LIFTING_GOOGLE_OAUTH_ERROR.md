# LIFTO - Erro no Login com Google

## Erro observado

Ao retornar do login com Google, a aplicacao chegou em:

```txt
/auth/callback?error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code
```

A tela ficava visualmente vazia, exibindo apenas o fundo escuro da aplicacao.

## O que significa

O erro `Unable to exchange external code` acontece quando o Supabase Auth nao consegue trocar o codigo retornado pelo Google por uma sessao valida.

Isso normalmente indica problema de configuracao no OAuth, nao problema de senha ou cadastro do usuario.

## Causas provaveis

- URL de callback ausente no Supabase.
- URL de callback diferente entre Supabase, Google Cloud e aplicacao.
- Site URL configurado incorretamente no Supabase.
- Credenciais OAuth do Google incorretas ou incompletas.
- Redirect URI autorizada faltando no Google Cloud Console.
- Projeto Google OAuth ainda em modo de teste sem o usuario liberado.

## Correcoes feitas no frontend

- A rota `/auth/callback` agora renderiza dentro de `Suspense`.
- O callback passou a capturar `error`, `error_code` e `error_description` vindos da URL.
- A aplicacao agora mostra mensagem clara quando o Supabase retorna erro.
- Foi adicionado teste cobrindo retorno de erro OAuth na URL.

## Configuracao necessaria no Supabase

Em Supabase:

```txt
Authentication > URL Configuration
```

Configurar:

```txt
Site URL:
https://lifting.up.railway.app
```

Adicionar em Redirect URLs:

```txt
https://lifting.up.railway.app/auth/callback
```

Se for testar localmente, adicionar tambem:

```txt
http://localhost:5173/auth/callback
http://localhost:4173/auth/callback
```

## Configuracao necessaria no Google Cloud

No Google Cloud Console, no OAuth Client usado pelo Supabase, conferir:

```txt
Authorized redirect URIs
```

Adicionar a URL de callback do Supabase informada na tela do provider Google dentro do Supabase Auth.

Ela geralmente segue este formato:

```txt
https://SEU_PROJECT_REF.supabase.co/auth/v1/callback
```

Importante: no Google Cloud normalmente entra o callback do Supabase, nao o callback direto da aplicacao.

## Fluxo esperado

1. Usuario clica em `Entrar com Google`.
2. Supabase redireciona para Google.
3. Google retorna para Supabase.
4. Supabase retorna para:

```txt
https://lifting.up.railway.app/auth/callback
```

5. A aplicacao troca o codigo por sessao.
6. A aplicacao carrega o profile.
7. Usuario entra no app.

## Status tecnico

Verificacoes locais apos a correcao:

```txt
npm run lint  - passou
npm run test  - 23 testes passaram
npm run build - passou
```
