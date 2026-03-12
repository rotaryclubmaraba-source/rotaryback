import { Request, Response, NextFunction } from 'express';

export class ErroMiddleware {
  static capturar(erro: any, _req: Request, res: Response, _next: NextFunction) {
    console.error('❌ Erro:', erro);

    // Erros de validação do multer
    if (erro.message === 'Tipo de arquivo não permitido') {
      return res.status(400).json({ erro: erro.message });
    }

    if (erro.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ erro: 'Arquivo muito grande. Tamanho máximo: 10MB' });
    }

    // Erros personalizados
    if (erro.message?.includes('não encontrado')) {
      return res.status(404).json({ erro: erro.message });
    }

    if (erro.message?.includes('já cadastrado') || erro.message?.includes('inválid')) {
      return res.status(400).json({ erro: erro.message });
    }

    if (erro.message?.includes('Token')) {
      return res.status(401).json({ erro: erro.message });
    }

    if (erro.message?.includes('Acesso negado')) {
      return res.status(403).json({ erro: erro.message });
    }

    // Erros de chave única (MongoDB E11000)
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Registro duplicado' });
    }

    // Se ainda quiser manter por compatibilidade com algum driver SQL antigo, pode deixar,
    // mas para Mongo não é necessário:
    // if (erro.code === '23505') { ... }
    // if (erro.code === '23503') { ... }

    return res.status(500).json({
      erro: 'Erro interno do servidor',
      mensagem: process.env.NODE_ENV === 'development' ? erro.message : undefined,
    });
  }
}
