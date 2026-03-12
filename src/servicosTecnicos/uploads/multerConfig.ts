import multer, { StorageEngine } from 'multer';
import path from 'path';
import { Request } from 'express';

// Configuração de armazenamento dos arquivos
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (_req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuração do multer
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB padrão
  },
  fileFilter: (_req: Request, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.docx', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Tipo de arquivo não permitido'));
    }
    cb(null, true);
  },
});