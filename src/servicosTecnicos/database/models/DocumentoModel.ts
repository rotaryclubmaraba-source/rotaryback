import { Schema, model, Types } from 'mongoose';
import { StatusDocumento, CategoriaDocumento } from '@dominio/entidades/Documento';

const DocumentoSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true,
    },

    categoria: {
      type: String,
      required: true,
      enum: Object.values(CategoriaDocumento),
      index: true,
    },

    nota: {
      type: String,
      default: null,
    },

    data: {
      type: String, // YYYY-MM
      required: false,
    },

    nomeArquivo: {
      type: String,
      required: true,
    },

    caminhoArquivo: {
      type: String,
      required: true,
    },

    tipoArquivo: {
      type: String,
      required: true,
    },

    tamanhoArquivo: {
      type: Number,
      required: true,
    },

    urlPublica: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(StatusDocumento),
      default: StatusDocumento.ATIVO,
      index: true,
    },

    criadoPor: {
      type: Types.ObjectId,
      ref: 'Usuario',
      required: false,
    },
  },
  {
    collection: 'documentos',
    versionKey: false,
    timestamps: {
      createdAt: 'criadoEm',
      updatedAt: 'atualizadoEm',
    },
  }
);

export const DocumentoModel = model('Documento', DocumentoSchema);
