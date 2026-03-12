import { Documento } from '@dominio/entidades/Documento';
import { IDocumentoRepositorio } from '@dominio/repositorios/IDocumentoRepositorio';

export class BuscarDocumentoUseCase {
  constructor(private documentoRepositorio: IDocumentoRepositorio) {}

  async executar(id: string): Promise<Documento> {
    const documento = await this.documentoRepositorio.buscarPorId(id.toString());

    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    return new Documento({
      id: documento.id?.toString(),
      titulo: documento.titulo,
      nota: documento.nota,
      status: documento.status,
      criadoEm: documento.criadoEm,
      atualizadoEm: documento.atualizadoEm
    });
  }
}
