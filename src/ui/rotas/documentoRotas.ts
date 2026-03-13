// src/ui/rotas/documentoRotas.ts
import { Router, Request, Response } from 'express';
import { DocumentoControlador } from '../controladores/DocumentoControlador';
import { AutenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { upload } from '../../servicosTecnicos/uploads/multerConfig';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

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
 * ROTA PÚBLICA — Corrigir acesso dos arquivos antigos no Cloudinary
 * Chame uma vez: POST /api/documentos/corrigir-acesso
 * =============================== */
router.post('/corrigir-acesso', async (_req: Request, res: Response) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const docs = await getCol().find({}).toArray();
    const resultados: any[] = [];

    for (const doc of docs) {
      if (!doc.urlPublica || !doc.urlPublica.includes('cloudinary')) {
        resultados.push({ id: doc._id, status: 'ignorado', motivo: 'sem urlPublica' });
        continue;
      }

      try {
        // Extrai o public_id da URL do Cloudinary
        // Ex: https://res.cloudinary.com/xxx/raw/upload/v123/rotary/arquivo.pdf
        // public_id = rotary/arquivo  (sem extensão)
        const partes = doc.urlPublica.split('/upload/');
        if (partes.length < 2) {
          resultados.push({ id: doc._id, status: 'ignorado', motivo: 'URL inválida' });
          continue;
        }

        // Remove a versão (v1234567/) e a extensão do arquivo
        const semVersao = partes[1].replace(/^v\d+\//, '');
        const publicId = semVersao.replace(/\.[^/.]+$/, '');

        // Determina o resource_type pela URL
        const resourceType = doc.urlPublica.includes('/image/') ? 'image' : 'raw';

        await cloudinary.api.update(publicId, {
          access_mode: 'public',
          resource_type: resourceType,
        } as any);

        resultados.push({ id: doc._id, titulo: doc.titulo, status: 'corrigido', publicId });
      } catch (e: any) {
        resultados.push({ id: doc._id, titulo: doc.titulo, status: 'erro', msg: e.message });
      }
    }

    const corrigidos = resultados.filter(r => r.status === 'corrigido').length;
    const erros = resultados.filter(r => r.status === 'erro').length;

    res.json({
      mensagem: `Processo concluído: ${corrigidos} corrigidos, ${erros} erros`,
      resultados,
    });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

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