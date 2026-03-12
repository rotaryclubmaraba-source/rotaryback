// src/index.ts
import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import { connectMongo } from './servicosTecnicos/database/mongo';
import rotas from './ui/rotas';
import { ErroMiddleware } from './ui/middlewares/erroMiddleware';

const app = express();

app.set('trust proxy', 1);

const PORT: number = Number(process.env.PORT) || 3001;

/* ===============================
 * CORS – origens permitidas
 * =============================== */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Aceita qualquer subdomínio do Vercel e localhost
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }

    console.warn(`⚠️ Origin bloqueada: ${origin}`);
    return callback(new Error('Origin não permitida pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

/* ===============================
 * CORS ANTES DO HELMET — obrigatório
 * Responde preflight OPTIONS corretamente
 * =============================== */
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ===============================
 * Segurança (Helmet) — depois do CORS
 * =============================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

/* ===============================
 * Rate Limiting
 * =============================== */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: '🚫 Muitas requisições, tente novamente mais tarde',
});

app.use(limiter);

/* ===============================
 * Middlewares globais
 * =============================== */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ===============================
 * Arquivos estáticos (uploads)
 * =============================== */
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

/* ===============================
 * Rotas da API
 * =============================== */
app.use('/api', rotas);

/* ===============================
 * Rota raiz (health check)
 * =============================== */
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'API Rotary Club de Marabá - LICMAB',
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ===============================
 * Middleware de erro
 * =============================== */
app.use(ErroMiddleware.capturar);

/* ===============================
 * Criar diretórios necessários
 * =============================== */
async function criarDiretorios(): Promise<void> {
  const diretorios = [
    uploadsPath,
    path.join(uploadsPath, 'temp'),
  ];

  for (const dir of diretorios) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Diretório criado: ${dir}`);
    }
  }
}

/* ===============================
 * Inicialização da aplicação
 * =============================== */
async function iniciar(): Promise<void> {
  try {
    await criarDiretorios();
    await connectMongo();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🌟 ========================================');
      console.log('🌟  LICMAB - Rotary Club de Marabá');
      console.log('🌟 ========================================');
      console.log(`🚀 Porta: ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS: ${allowedOrigins.join(', ')}`);
      console.log('🌟 ========================================');
      console.log('');
    });
  } catch (erro) {
    console.error('❌ Erro ao iniciar aplicação:', erro);
    process.exit(1);
  }
}

iniciar();