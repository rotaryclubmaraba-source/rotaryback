// src/servicosTecnicos/database/DocumentoSchema.ts
import { Schema, model, Document } from 'mongoose';
import { CategoriaDocumento, StatusDocumento } from '@dominio/entidades/Documento';

export interface DocumentoMongo extends Document {
  titulo: string;
  categoria: CategoriaDocumento;
  nota?: string;
  data?: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  status: StatusDocumento;
  urlPublica?: string;
  criadoPor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const DocumentoSchema = new Schema<DocumentoMongo>(
  {
    titulo: { type: String, required: true },
    categoria: {
      type: String,
      enum: Object.values(CategoriaDocumento),
      required: true,
    },
    nota: { type: String },
    data: { type: String },
    nomeArquivo: { type: String, required: true },
    caminhoArquivo: { type: String, required: true },
    tipoArquivo: { type: String, required: true },
    tamanhoArquivo: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(StatusDocumento),
      default: StatusDocumento.ATIVO,
    },
    urlPublica: { type: String },
    criadoPor: { type: String },
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  }
);

export const DocumentoModel = model<DocumentoMongo>('Documento', DocumentoSchema);
