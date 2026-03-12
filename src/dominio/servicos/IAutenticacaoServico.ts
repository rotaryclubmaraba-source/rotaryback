export interface TokenPayload {
  usuarioId: string;
  email: string;
  tipo: string;
}

export interface IAutenticacaoServico {
  gerarToken(payload: TokenPayload): string;
  verificarToken(token: string): TokenPayload;
  hashSenha(senha: string): Promise<string>;
  compararSenha(senha: string, hash: string): Promise<boolean>;
}
