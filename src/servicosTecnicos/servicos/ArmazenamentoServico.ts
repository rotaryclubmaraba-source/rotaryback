// src/servicosTecnicos/servicos/ArmazenamentoServico.ts
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import {
  IArmazenamentoServico,
  ArquivoUpload,
  ResultadoUploadCloud,
} from '@dominio/servicos/IArmazenamentoServico';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export class ArmazenamentoServico implements IArmazenamentoServico {
  private maxFileSize: number;
  private tiposPermitidos: string[];

  constructor() {
    // 10 MB padrão
    this.maxFileSize = Number(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024;
    this.tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
  }
  async upload(arquivo: ArquivoUpload): Promise<ResultadoUploadCloud> {
    if (!this.validarTipoArquivo(arquivo.mimetype)) {
      throw new Error('Tipo de arquivo não permitido');
    }

    if (!this.validarTamanhoArquivo(arquivo.size)) {
      throw new Error('Arquivo excede o tamanho máximo permitido');
    }

    if (!arquivo.path) {
      throw new Error('Caminho do arquivo temporário não encontrado');
    }

    const isImage = arquivo.mimetype.startsWith('image/');
    const isVideo = arquivo.mimetype.startsWith('video/');
    const resourceType: 'image' | 'video' | 'raw' = isImage ? 'image' : isVideo ? 'video' : 'raw';

      const resultado = await cloudinary.uploader.upload(arquivo.path, {
      folder: process.env.CLOUDINARY_FOLDER || 'rotary',
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      access_mode: 'public',      // ← adicione esta linha
      type: 'upload',             // ← e esta linha
    });

    // Remove arquivo temporário após upload
    try {
      await fs.unlink(arquivo.path);
    } catch {
      // silencioso por design
    }

    return {
      urlPublica: resultado.secure_url,
      caminhoRelativo: resultado.public_id,
      publicId: resultado.public_id,
    };
  }

  async deletar(caminhoOuPublicId: string): Promise<void> {
    if (!caminhoOuPublicId) return;

    try {
      await cloudinary.uploader.destroy(caminhoOuPublicId);
    } catch {
      // silencioso por design
    }
  }

  validarTipoArquivo(mimetype: string): boolean {
    return this.tiposPermitidos.includes(mimetype);
  }

  validarTamanhoArquivo(tamanho: number): boolean {
    return tamanho <= this.maxFileSize;
  }
}