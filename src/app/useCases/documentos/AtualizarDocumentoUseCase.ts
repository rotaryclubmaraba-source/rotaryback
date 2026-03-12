import { Documento } from '@dominio/entidades/Documento';
import { IDocumentoRepositorio } from '@dominio/repositorios/IDocumentoRepositorio';

export interface AtualizarDocumentoDTO {
  id: string;
  titulo?: string;
  nota?: string;
  status?: string;
}

export class AtualizarDocumentoUseCase {
  constructor(private documentoRepositorio: IDocumentoRepositorio) {}

  async executar(dados: AtualizarDocumentoDTO): Promise<Documento> {
    const documento = await this.documentoRepositorio.buscarPorId(dados.id.toString());

    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    const documentoAtualizado = await this.documentoRepositorio.atualizar(dados.id.toString(), {
      titulo: dados.titulo,
      nota: dados.nota,
      status: dados.status as any
    });

    return new Documento({
      id: documentoAtualizado.id?.toString(),
      titulo: documentoAtualizado.titulo,
      nota: documentoAtualizado.nota,
      status: documentoAtualizado.status,
      criadoEm: documentoAtualizado.criadoEm,
      atualizadoEm: documentoAtualizado.atualizadoEm
    });
  }
}
