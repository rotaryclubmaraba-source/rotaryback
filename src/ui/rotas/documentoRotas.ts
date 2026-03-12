// src/ui/rotas/documentoRotas.ts
import { Router, Request, Response } from 'express';
import { DocumentoControlador } from '../controladores/DocumentoControlador';
import { AutenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { upload } from '../../servicosTecnicos/uploads/multerConfig';
import mongoose from 'mongoose';

const router = Router();
const controlador = new DocumentoControlador();
const authMiddleware = new AutenticacaoMiddleware();

function getCol() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Banco não conectado');
  return db.collection('documentos');
}

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function mapDoc(d: any) {
  return {
    id: d._id.toString(),
    titulo: d.titulo,
    categoria: d.categoria,
    nota: d.nota ?? null,
    data: d.data ?? null,
    nomeArquivo: d.nomeArquivo ?? null,
    tipoArquivo: d.tipoArquivo,
    tamanhoArquivo: d.tamanhoArquivo,
    status: d.status,
    urlPublica: d.urlPublica ?? null,
    criadoPor: d.criadoPor ?? null,
    criadoEm: d.criadoEm,
    atualizadoEm: d.atualizadoEm,
  };
}

/* ===============================
 * ROTAS PÚBLICAS
 * =============================== */

router.get('/publicos', async (_req: Request, res: Response) => {
  try {
    const docs = await getCol().find({ status: 'ativo' }).sort({ criadoEm: -1 }).toArray();
    const documentos = docs.map(mapDoc);
    res.json({ documentos, total: documentos.length, pagina: 1, totalPaginas: 1, limite: documentos.length });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/publicos/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!isValidId(id)) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    const doc = await getCol().findOne({ _id: toObjectId(id), status: 'ativo' });
    if (!doc) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    res.json(mapDoc(doc));
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/publicos/:id/download', (req: Request, res: Response) =>
  controlador.download(req as any, res)
);

/* ===============================
 * ROTAS PROTEGIDAS
 * =============================== */
router.use(authMiddleware.verificar);

router.post('/', upload.single('arquivo'), (req: Request, res: Response) =>
  controlador.criar(req as any, res)
);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { pagina = '1', limite = '20', categoria, busca } = req.query as any;
    const query: any = { status: { $ne: 'inativo' } };
    if (categoria) query.categoria = categoria;
    if (busca) query.$or = [
      { titulo: { $regex: busca, $options: 'i' } },
      { nota: { $regex: busca, $options: 'i' } },
    ];
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const [docs, total] = await Promise.all([
      getCol().find(query).sort({ criadoEm: -1 }).skip(skip).limit(parseInt(limite)).toArray(),
      getCol().countDocuments(query),
    ]);
    res.json({
      documentos: docs.map(mapDoc),
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
      limite: parseInt(limite),
    });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/paginado', async (req: Request, res: Response) => {
  try {
    const { pagina = '1', limite = '12', categoria, status, busca } = req.query as any;
    const query: any = {};
    if (categoria) query.categoria = categoria;
    if (status) query.status = status;
    if (busca) query.$or = [
      { titulo: { $regex: busca, $options: 'i' } },
      { nota: { $regex: busca, $options: 'i' } },
    ];
    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const [docs, total] = await Promise.all([
      getCol().find(query).sort({ criadoEm: -1 }).skip(skip).limit(parseInt(limite)).toArray(),
      getCol().countDocuments(query),
    ]);
    res.json({
      documentos: docs.map(mapDoc),
      total,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(total / parseInt(limite)),
      limite: parseInt(limite),
    });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!isValidId(id)) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    const doc = await getCol().findOne({ _id: toObjectId(id) });
    if (!doc) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    res.json(mapDoc(doc));
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!isValidId(id)) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    const { titulo, categoria, nota, data, status } = req.body;
    const update: any = { atualizadoEm: new Date() };
    if (titulo) update.titulo = titulo;
    if (categoria) update.categoria = categoria;
    if (nota !== undefined) update.nota = nota;
    if (data) update.data = data;
    if (status) update.status = status;
    const result = await getCol().findOneAndUpdate(
      { _id: toObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    res.json(mapDoc(result));
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!isValidId(id)) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    await getCol().updateOne(
      { _id: toObjectId(id) },
      { $set: { status: 'inativo', atualizadoEm: new Date() } }
    );
    res.json({ mensagem: 'Documento excluído com sucesso' });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

export default router;