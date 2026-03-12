import { Documento } from '@dominio/entidades/Documento';
import { IDocumentoRepositorio, FiltrosDocumento } from '@dominio/repositorios/IDocumentoRepositorio';

export class ListarDocumentosUseCase {
  constructor(private documentoRepositorio: IDocumentoRepositorio) {}

  async executar(filtros?: FiltrosDocumento): Promise<Documento[]> {
    const documentos = await this.documentoRepositorio.listarTodos(filtros);

    return documentos.map(
      (doc) =>
        new Documento({
          id: doc.id?.toString(),
          titulo: doc.titulo,
          categoria: doc.categoria,
          nota: doc.nota,
          data: doc.data,
          nomeArquivo: doc.nomeArquivo,
          caminhoArquivo: doc.caminhoArquivo,
          tipoArquivo: doc.tipoArquivo,
          tamanhoArquivo: doc.tamanhoArquivo,
          urlPublica: doc.urlPublica,
          criadoPor: doc.criadoPor,
          criadoEm: doc.criadoEm,
          atualizadoEm: doc.atualizadoEm,
        })
    );
  }
}
