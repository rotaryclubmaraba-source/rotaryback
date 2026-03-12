// src/app/useCases/documentos/DeletarDocumentoUseCase.ts
import { IDocumentoRepositorio } from '@dominio/repositorios/IDocumentoRepositorio';
import { IArmazenamentoServico } from '@dominio/servicos/IArmazenamentoServico';

export class DeletarDocumentoUseCase {
  constructor(
    private documentoRepositorio: IDocumentoRepositorio,
    private armazenamentoServico: IArmazenamentoServico
  ) {}

  async executar(id: string): Promise<void> {
    const documento = await this.documentoRepositorio.buscarPorId(id);
    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    const caminho =
      (documento as any).caminhoArquivo ??
      (documento as any).urlPublica ??
      (documento as any).nomeArquivo ??
      undefined;

    if (caminho) {
      await this.armazenamentoServico.deletar(caminho);
    }

    await this.documentoRepositorio.deletar(id);
  }
}
