// src/servicosTecnicos/database/UsuarioSchema.ts
import { Schema, model, Document } from 'mongoose';

export interface UsuarioMongo extends Document {
  email: string;
  senha: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const UsuarioSchema = new Schema<UsuarioMongo>(
  {
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    nome: { type: String, required: true },
    tipo: { type: String, required: true },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
  }
);

export const UsuarioModel = model<UsuarioMongo>('Usuario', UsuarioSchema);
