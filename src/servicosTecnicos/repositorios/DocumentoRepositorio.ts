// src/servicosTecnicos/repositorios/DocumentoRepositorio.ts
import { Types } from 'mongoose';
import { Documento, StatusDocumento } from '@dominio/entidades/Documento';
import {
  IDocumentoRepositorio,
  FiltrosDocumento,
  ResultadoPaginado,
} from '@dominio/repositorios/IDocumentoRepositorio';
import { DocumentoModel } from '../database/schemas/DocumentoSchema';

function mapToDocumento(doc: any): Documento {
  return new Documento({
    id: doc._id.toString(),
    titulo: doc.titulo,
    categoria: doc.categoria,
    nota: doc.nota ?? undefined,
    data: doc.data ?? undefined,
    nomeArquivo: doc.nomeArquivo,
    caminhoArquivo: doc.caminhoArquivo,
    tipoArquivo: doc.tipoArquivo,
    tamanhoArquivo: doc.tamanhoArquivo,
    status: doc.status,
    urlPublica: doc.urlPublica,
    criadoPor: doc.criadoPor,
    criadoEm: doc.criadoEm ?? doc.createdAt,
    atualizadoEm: doc.atualizadoEm ?? doc.updatedAt,
  });
}

export class DocumentoRepositorio implements IDocumentoRepositorio {
  async criar(documento: Documento): Promise<Documento> {
    // Converte null → undefined para campos opcionais, evitando conflito com os tipos do Mongoose
    const criado = await DocumentoModel.create({
      titulo: documento.titulo,
      categoria: documento.categoria,
      nota: documento.nota ?? undefined,
      data: documento.data ?? undefined,
      nomeArquivo: documento.nomeArquivo,
      caminhoArquivo: documento.caminhoArquivo,
      tipoArquivo: documento.tipoArquivo,
      tamanhoArquivo: documento.tamanhoArquivo,
      status: documento.status ?? StatusDocumento.ATIVO,
      urlPublica: documento.urlPublica ?? undefined,
      criadoPor:
        (documento as any).criadoPorId ??
        (documento.criadoPor
          ? (documento.criadoPor as any).id || documento.criadoPor
          : undefined),
    });

    // Usa lean-equivalent via toObject() para evitar o tipo 'never' no retorno do create()
    return mapToDocumento((criado as any).toObject ? (criado as any).toObject() : criado);
  }

  async buscarPorId(id: string): Promise<Documento | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await DocumentoModel.findById(id).lean();
    return doc ? mapToDocumento(doc) : null;
  }

  async listarTodos(filtros?: FiltrosDocumento): Promise<Documento[]> {
    const query: any = { ...filtros };
    const docs = await DocumentoModel.find(query)
      .sort({ criadoEm: -1 })
      .lean();

    return docs.map(mapToDocumento);
  }

  async listarAtivos(filtros?: FiltrosDocumento): Promise<Documento[]> {
    return this.listarTodos({ ...filtros, status: StatusDocumento.ATIVO });
  }

  async listarPaginado(
    pagina: number,
    limite: number,
    filtros?: FiltrosDocumento,
    busca?: string
  ): Promise<ResultadoPaginado> {
    const query: any = { ...filtros };

    if (busca) {
      query.$or = [
        { titulo: { $regex: busca, $options: 'i' } },
        { nota: { $regex: busca, $options: 'i' } },
      ];
    }

    const skip = (pagina - 1) * limite;

    const [docs, total] = await Promise.all([
      DocumentoModel.find(query)
        .skip(skip)
        .limit(limite)
        .sort({ criadoEm: -1 })
        .lean(),
      DocumentoModel.countDocuments(query),
    ]);

    console.log('🔍 DEBUG listarPaginado:', { query, total, docsCount: docs.length, collectionName: DocumentoModel.collection.name });

    return {
      documentos: docs.map(mapToDocumento),
      total,
    };
  }

  async atualizar(id: string, dados: Partial<Documento>): Promise<Documento> {
    const atualizado = await DocumentoModel.findByIdAndUpdate(id, dados, {
      new: true,
    }).lean();

    if (!atualizado) throw new Error('Documento não encontrado');
    return mapToDocumento(atualizado);
  }

  async deletar(id: string): Promise<void> {
    await DocumentoModel.findByIdAndUpdate(id, {
      status: StatusDocumento.INATIVO,
    });
  }

  async contarPorCategoria(): Promise<{ categoria: string; total: number }[]> {
    return DocumentoModel.aggregate([
      { $match: { status: StatusDocumento.ATIVO } },
      { $group: { _id: '$categoria', total: { $sum: 1 } } },
      { $project: { categoria: '$_id', total: 1, _id: 0 } },
    ]);
  }
}