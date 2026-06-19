export function formatDatabaseError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes('tenant/user') && message.includes('not found')
  ) {
    return 'Projeto Supabase indisponível. Acesse supabase.com, restaure ou crie o projeto e atualize DATABASE_URL e DIRECT_URL no .env.';
  }

  if (message.includes("Can't reach database server")) {
    return 'Não foi possível conectar ao banco. Verifique DATABASE_URL no .env e se o projeto Supabase está ativo.';
  }

  if (message.includes('P1001') || message.includes('ECONNREFUSED')) {
    return 'Servidor de banco inacessível. Confira a conexão e as variáveis DATABASE_URL / DIRECT_URL.';
  }

  if (message.includes('Authentication failed') || message.includes('password authentication failed')) {
    return 'Senha do banco incorreta. Se a senha tiver @ ou #, use codificação URL (ex.: @ vira %40) no .env.';
  }

  return message || 'Falha ao acessar o banco de dados';
}
