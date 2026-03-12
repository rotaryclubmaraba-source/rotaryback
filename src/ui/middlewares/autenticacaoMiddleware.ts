// src/ui/middlewares/autenticacaoMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AutenticacaoServico } from '@servicosTecnicos/servicos/AutenticacaoServico';

export interface RequestAutenticado extends Request {
  usuario?: {
    usuarioId: string;
    email: string;
    tipo: string;
  };
}

export class AutenticacaoMiddleware {
  private autenticacaoServico: AutenticacaoServico;

  constructor() {
    this.autenticacaoServico = new AutenticacaoServico();
  }

  /**
   * Middleware para verificar autenticação de usuário
   */
  verificar = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1) Tenta pegar token do cookie (se você usar cookie HttpOnly no login)
      const cookies = (req as any).cookies || {};
      const tokenCookie = cookies.token as string | undefined;

      // 2) Tenta pegar token do header Authorization: Bearer xxx
      const authHeader = req.headers.authorization;
      const tokenHeader =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : undefined;

      const token = tokenCookie || tokenHeader;

      if (!token) {
        res.status(401).json({ erro: 'Token não fornecido' });
        return; // garante que a execução pare
      }

      const payload = this.autenticacaoServico.verificarToken(token);

      if (!payload || !payload.usuarioId) {
        res.status(401).json({ erro: 'Token inválido' });
        return;
      }

      // adiciona usuário autenticado à requisição
      req.usuario = {
        usuarioId: payload.usuarioId,
        email: payload.email,
        tipo: payload.tipo,
      };

      next();
    } catch (error: any) {
      res.status(401).json({ erro: 'Token inválido' });
      return;
    }
  };

  /**
   * Middleware para verificar se o usuário é administrador
   */
  verificarAdmin = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.usuario) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      if (req.usuario.tipo !== 'admin') {
        res.status(403).json({ erro: 'Acesso negado. Apenas administradores.' });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ erro: 'Erro interno no middleware' });
      return;
    }
  };
}
