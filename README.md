# Bello Alimentos - Gestão de Extintores

Sistema Next.js + Prisma + Supabase para inspeção de extintores e hidrantes.

## Configuração do banco (Supabase)

1. Acesse [supabase.com](https://supabase.com) e abra o projeto (ou crie/restaure um).
2. Vá em **Settings → Database** e copie as strings de conexão:
   - **Transaction pooler (6543)** → `DATABASE_URL` (com `?pgbouncer=true`)
   - **Session pooler (5432)** → `DIRECT_URL`
3. Copie `.env.example` para `.env` e preencha os valores.
4. Se a senha tiver caracteres especiais (`@`, `#`, `%`), codifique na URL:
   - `@` → `%40`
   - `#` → `%23`
5. Crie as tabelas:

```bash
npm run db:push
```

6. Inicie o app:

```bash
npm run dev
```

## Erro comum

| Mensagem | Causa provável |
|----------|----------------|
| `tenant/user ... not found` | Projeto Supabase pausado, excluído ou `DATABASE_URL` desatualizada |
| `Can't reach database server` | URL/região incorreta ou projeto inativo |
| `password authentication failed` | Senha errada ou `@` na senha sem codificar (`%40`) |

## Scripts úteis

```bash
npm run db:push    # sincroniza schema Prisma com o banco
npm run db:studio  # interface visual do banco
```
