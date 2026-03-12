// src/dominio/repositorios/IDocumentoRepositorio.ts
import { Documento, StatusDocumento, CategoriaDocumento } from '@dominio/entidades/Documento';

export interface FiltrosDocumento {
  categoria?: CategoriaDocumento;
  status?: StatusDocumento;
  data?: string;
}

export interface ResultadoPaginado {
  documentos: Documento[];
  total: number;
}

export interface IDocumentoRepositorio {
  criar(documento: Documento): Promise<Documento>;
  buscarPorId(id: string): Promise<Documento | null>;
  listarTodos(filtros?: FiltrosDocumento): Promise<Documento[]>;
  listarAtivos(filtros?: FiltrosDocumento): Promise<Documento[]>;
  listarPaginado(
    pagina: number,
    limite: number,
    filtros?: FiltrosDocumento,
    busca?: string
  ): Promise<ResultadoPaginado>;
  atualizar(id: string, dados: Partial<Documento>): Promise<Documento>;
  deletar(id: string): Promise<void>;
  contarPorCategoria(): Promise<{ categoria: string; total: number }[]>;
}
