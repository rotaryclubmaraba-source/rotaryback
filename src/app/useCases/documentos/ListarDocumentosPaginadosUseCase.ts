import { Documento } from '@dominio/entidades/Documento';
import { IDocumentoRepositorio, FiltrosDocumento } from '@dominio/repositorios/IDocumentoRepositorio';

export interface PaginacaoParams {
  pagina: number;
  limite: number;
  filtros?: FiltrosDocumento;
  busca?: string;
}

export interface ResultadoPaginado {
  documentos: Documento[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limite: number;
}

export class ListarDocumentosPaginadosUseCase {
  constructor(private documentoRepositorio: IDocumentoRepositorio) {}

  async executar(params: PaginacaoParams): Promise<ResultadoPaginado> {
    const { pagina = 1, limite = 10, filtros, busca } = params;

    const resultado = await this.documentoRepositorio.listarPaginado(
      pagina,
      limite,
      filtros,
      busca
    );

    const documentos = resultado.documentos.map(
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
          status: doc.status,
          criadoPor: doc.criadoPor,
          criadoEm: doc.criadoEm,
          atualizadoEm: doc.atualizadoEm,
        })
    );

    return {
      documentos,
      total: resultado.total,
      pagina,
      totalPaginas: Math.ceil(resultado.total / limite),
      limite,
    };
  }
}
