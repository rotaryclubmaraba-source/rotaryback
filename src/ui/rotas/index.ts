// src/ui/rotas/index.ts
import { Router, Request, Response } from 'express';
import autenticacaoRotas from './autenticacaoRotas';
import documentoRotas from './documentoRotas';
import demandaRotas from './demandaRotas';
import galeriaRotas from './galeriaRotas';

const router = Router();

/**
 * Rotas de demanda
 * Ex.: POST /demanda
 */
router.use('/demanda', demandaRotas);

/**
 * Rotas de autenticação
 * Ex.: /auth/login, /auth/logout
 */
router.use('/auth', autenticacaoRotas);

/**
 * Rotas de documentos
 * Ex.: /documentos/publicos
 */
router.use('/documentos', documentoRotas);

/**
 * Rotas de galeria de imagens
 * Ex.: GET /galeria?pagina=saude, POST /galeria
 */
router.use('/galeria', galeriaRotas);

/**
 * Health check da API
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Middleware genérico para rotas não encontradas
 */
router.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    timestamp: new Date().toISOString(),
  });
});

export default router;