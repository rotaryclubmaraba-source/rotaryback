// caminho: src/servicosTecnicos/servicos/AutenticacaoServico.ts
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAutenticacaoServico, TokenPayload } from '../../dominio/servicos/IAutenticacaoServico';

export class AutenticacaoServico implements IAutenticacaoServico {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'secret_key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h'; // expiração curta
  }

  gerarToken(payload: TokenPayload): string {
    const tokenPayload: Record<string, any> = {
      usuarioId: payload.usuarioId,
      email: payload.email,
      tipo: payload.tipo,
    };

    const options: SignOptions = {
      expiresIn: this.jwtExpiresIn as unknown as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(tokenPayload, this.jwtSecret, options);
  }

  verificarToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as Record<string, any>;

      return {
        usuarioId: decoded.usuarioId,
        email: decoded.email,
        tipo: decoded.tipo,
      };
    } catch {
      throw new Error('Token inválido ou expirado');
    }
  }

  async hashSenha(senha: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(senha, saltRounds);
  }

  async compararSenha(senha: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senha, hash);
  }
}
