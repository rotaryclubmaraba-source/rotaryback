// src/dominio/servicos/IArmazenamentoServico.ts
export interface ArquivoUpload {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

export interface ResultadoUploadCloud {
  urlPublica: string;
  caminhoRelativo?: string;
  publicId?: string;
}

export interface IArmazenamentoServico {
  upload(arquivo: ArquivoUpload): Promise<ResultadoUploadCloud>;
  deletar(caminhoOuPublicId: string): Promise<void>;
}
