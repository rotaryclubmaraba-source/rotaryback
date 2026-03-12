// src/ui/controladores/DocumentoControlador.ts
import path from 'path';
import { Response } from 'express';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';
import { CriarDocumentoUseCase } from '@app/useCases/documentos/CriarDocumentoUseCase';
import { ListarDocumentosUseCase } from '@app/useCases/documentos/ListarDocumentosUseCase';
import { AtualizarDocumentoUseCase } from '@app/useCases/documentos/AtualizarDocumentoUseCase';
import { DeletarDocumentoUseCase } from '@app/useCases/documentos/DeletarDocumentoUseCase';
import { DocumentoRepositorio } from '@servicosTecnicos/repositorios/DocumentoRepositorio';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import type { CategoriaDocumento, StatusDocumento } from '@dominio/entidades/Documento';

// Helper: garante que o param seja sempre string
function toStr(param: string | string[]): string {
  return Array.isArray(param) ? param[0] : param;
}

export class DocumentoControlador {
  async criar(req: RequestAutenticado, res: Response) {
    try {
      if (!req.file) return res.status(400).json({ erro: 'Arquivo é obrigatório' });

      const { titulo, categoria, nota, data } = req.body;

      if (!titulo || !categoria || !data) {
        return res.status(400).json({ erro: 'Título, categoria e data são obrigatórios' });
      }

      const documentoRepositorio = new DocumentoRepositorio();
      const armazenamentoServico = new ArmazenamentoServico();
      const criarDocumentoUseCase = new CriarDocumentoUseCase(
        documentoRepositorio,
        armazenamentoServico
      );

      const documento = await criarDocumentoUseCase.executar({
        titulo,
        categoria: categoria as CategoriaDocumento,
        nota,
        data,
        arquivo: req.file as any,
        criadoPorId: req.usuario!.usuarioId,
      });

      return res.status(201).json(documento);
    } catch (erro: any) {
      return res.status(400).json({ erro: erro.message });
    }
  }

  async listarPaginado(req: RequestAutenticado, res: Response) {
    try {
      const { pagina = '1', limite = '12', categoria, status, data, busca } = req.query;

      const documentoRepositorio = new DocumentoRepositorio();

      const resultado = await documentoRepositorio.listarPaginado(
        parseInt(pagina as string),
        parseInt(limite as string),
        {
          categoria: categoria ? (categoria as CategoriaDocumento) : undefined,
          status: status ? (status as StatusDocumento) : undefined,
          data: data as string,
        },
        busca as string | undefined
      );

      return res.json({
        documentos: resultado.documentos,
        total: resultado.total,
        pagina: parseInt(pagina as string),
        totalPaginas: Math.ceil(resultado.total / parseInt(limite as string)),
        limite: parseInt(limite as string),
      });
    } catch (erro: any) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  async buscarPorId(req: RequestAutenticado, res: Response) {
    try {
      const id: string = toStr(req.params.id);
      const documentoRepositorio = new DocumentoRepositorio();
      const documento = await documentoRepositorio.buscarPorId(id);

      if (!documento) return res.status(404).json({ erro: 'Documento não encontrado' });

      return res.json(documento);
    } catch (erro: any) {
      return res.status(404).json({ erro: erro.message });
    }
  }

  async listarTodos(req: RequestAutenticado, res: Response) {
    try {
      const { categoria, status, data } = req.query;
      const documentoRepositorio = new DocumentoRepositorio();
      const listarDocumentosUseCase = new ListarDocumentosUseCase(documentoRepositorio);

      const documentos = await listarDocumentosUseCase.executar({
        categoria: categoria ? (categoria as CategoriaDocumento) : undefined,
        status: status ? (status as StatusDocumento) : undefined,
        data: data as string,
      });

      return res.json(documentos);
    } catch (erro: any) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  async listarAtivos(req: RequestAutenticado, res: Response) {
    try {
      const categoria = req.query.categoria ? (req.query.categoria as CategoriaDocumento) : undefined;
      const data = req.query.data as string | undefined;
      const pagina = parseInt((req.query.pagina as string) || '1');
      const limite = parseInt((req.query.limite as string) || '12');
      const busca = req.query.busca as string | undefined;

      const documentoRepositorio = new DocumentoRepositorio();

      const resultado = await documentoRepositorio.listarPaginado(
        pagina,
        limite,
        { categoria, status: 'ativo' as StatusDocumento, data },
        busca
      );

      return res.json({
        documentos: resultado.documentos,
        total: resultado.total,
        pagina,
        totalPaginas: Math.ceil(resultado.total / limite),
        limite,
      });
    } catch (erro: any) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  async obterEstatisticas(_req: RequestAutenticado, res: Response) {
    try {
      const documentoRepositorio = new DocumentoRepositorio();
      const [categorias, todos] = await Promise.all([
        documentoRepositorio.contarPorCategoria(),
        documentoRepositorio.listarTodos(),
      ]);

      return res.json({
        total: todos.length,
        ativos: todos.filter((d) => d.status === 'ativo').length,
        inativos: todos.filter((d) => d.status === 'inativo').length,
        arquivados: todos.filter((d) => d.status === 'arquivado').length,
        porCategoria: categorias,
      });
    } catch (erro: any) {
      return res.status(500).json({ erro: erro.message });
    }
  }

  async atualizar(req: RequestAutenticado, res: Response) {
    try {
      const id: string = toStr(req.params.id);
      const { titulo, nota, status } = req.body;

      const documentoRepositorio = new DocumentoRepositorio();
      const atualizarDocumentoUseCase = new AtualizarDocumentoUseCase(documentoRepositorio);

      const documento = await atualizarDocumentoUseCase.executar({
        id,
        titulo,
        nota,
        status: status ? (status as StatusDocumento) : undefined,
      });

      return res.json(documento);
    } catch (erro: any) {
      return res.status(400).json({ erro: erro.message });
    }
  }

  async deletar(req: RequestAutenticado, res: Response) {
    try {
      const id: string = toStr(req.params.id);

      const documentoRepositorio = new DocumentoRepositorio();
      const armazenamentoServico = new ArmazenamentoServico();
      const deletarDocumentoUseCase = new DeletarDocumentoUseCase(
        documentoRepositorio,
        armazenamentoServico
      );

      await deletarDocumentoUseCase.executar(id);
      return res.status(204).send();
    } catch (erro: any) {
      return res.status(400).json({ erro: erro.message });
    }
  }

  async download(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const id: string = toStr(req.params.id);

      const documentoRepositorio = new DocumentoRepositorio();
      const documento = await documentoRepositorio.buscarPorId(id);

      if (!documento) {
        res.status(404).json({ erro: 'Documento não encontrado' });
        return;
      }

      const caminhoRelativo =
        (documento as any).caminhoArquivo ||
        (documento as any).arquivo ||
        (documento as any).nomeArquivo;

      if (!caminhoRelativo) {
        res.status(400).json({ erro: 'Documento não possui arquivo associado' });
        return;
      }

      const uploadDir = process.env.UPLOAD_DIR || path.resolve('./uploads');
      const caminhoAbsoluto = path.join(uploadDir, caminhoRelativo);
      const nomeDownload = documento.titulo || 'documento';

      res.download(caminhoAbsoluto, nomeDownload, (err) => {
        if (err) {
          console.error('Erro ao realizar download:', err);
          res.status(500).json({ erro: 'Erro ao realizar download do arquivo' });
        }
      });
    } catch (erro: any) {
      res.status(500).json({ erro: erro.message });
    }
  }
}