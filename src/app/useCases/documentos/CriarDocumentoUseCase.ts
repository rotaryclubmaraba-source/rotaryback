// src/app/useCases/documentos/CriarDocumentoUseCase.ts
import { CategoriaDocumento, Documento } from '@dominio/entidades/Documento';
import { IDocumentoRepositorio } from '@dominio/repositorios/IDocumentoRepositorio';
import {
  IArmazenamentoServico,
  ArquivoUpload,
  ResultadoUploadCloud,
} from '@dominio/servicos/IArmazenamentoServico';

export interface CriarDocumentoDTO {
  titulo: string;
  categoria: CategoriaDocumento;
  nota?: string;
  data: string;
  arquivo: ArquivoUpload;
  criadoPorId: string;
}

export class CriarDocumentoUseCase {
  constructor(
    private documentoRepositorio: IDocumentoRepositorio,
    private armazenamentoServico: IArmazenamentoServico
  ) {}

  async executar(dados: CriarDocumentoDTO): Promise<Documento> {
    const resultadoUpload: ResultadoUploadCloud = await this.armazenamentoServico.upload(
      dados.arquivo
    );

    const documento = new Documento({
      titulo: dados.titulo,
      categoria: dados.categoria,
      nota: dados.nota,
      data: dados.data,
      nomeArquivo: dados.arquivo.originalname,
      caminhoArquivo: resultadoUpload.caminhoRelativo ?? resultadoUpload.publicId ?? '',
      tipoArquivo: dados.arquivo.mimetype,
      tamanhoArquivo: dados.arquivo.size,
      status: 'ativo' as any,
      urlPublica: resultadoUpload.urlPublica,
      criadoPor: dados.criadoPorId as any,
    });

    const criado = await this.documentoRepositorio.criar(documento);
    return criado;
  }
}