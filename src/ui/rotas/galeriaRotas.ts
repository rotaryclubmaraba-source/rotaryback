// src/ui/rotas/galeriaRotas.ts
import { Router, Request, Response } from 'express';
import { AutenticacaoMiddleware } from '../middlewares/autenticacaoMiddleware';
import { upload } from '../../servicosTecnicos/uploads/multerConfig';
import mongoose from 'mongoose';

const router = Router();
const authMiddleware = new AutenticacaoMiddleware();

function getCol() {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Banco não conectado');
  return db.collection('galeria');
}

function mapImg(d: any) {
  return {
    id: d._id.toString(),
    titulo: d.titulo,
    pagina: d.pagina, // 'saude' | 'educacao' | 'assistencia-social'
    urlPublica: d.urlPublica,
    ordem: d.ordem ?? 0,
    criadoEm: d.criadoEm,
  };
}

/* PÚBLICAS */

// GET /galeria?pagina=saude
router.get('/', async (req: Request, res: Response) => {
  try {
    const { pagina } = req.query as any;
    const query: any = { status: 'ativo' };
    if (pagina) query.pagina = pagina;
    const imgs = await getCol().find(query).sort({ ordem: 1, criadoEm: -1 }).toArray();
    res.json({ imagens: imgs.map(mapImg), total: imgs.length });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

/* PROTEGIDAS */
router.use(authMiddleware.verificar);

// POST /galeria (upload)
router.post('/', upload.single('arquivo'), async (req: Request, res: Response) => {
  try {
    const { titulo, pagina, ordem } = req.body;
    if (!req.file) { res.status(400).json({ erro: 'Arquivo obrigatório' }); return; }
    if (!pagina) { res.status(400).json({ erro: 'Página obrigatória' }); return; }

    // Importar ArmazenamentoServico para usar Cloudinary
    const { ArmazenamentoServico } = await import('../../servicosTecnicos/servicos/ArmazenamentoServico');
    const servico = new ArmazenamentoServico();
    const resultado = await servico.upload({
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      originalname: req.file.originalname,
    });

    const doc = {
      titulo: titulo || req.file.originalname,
      pagina,
      urlPublica: resultado.urlPublica,
      publicId: resultado.publicId,
      ordem: parseInt(ordem) || 0,
      status: 'ativo',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };

    const result = await getCol().insertOne(doc);
    res.status(201).json({ id: result.insertedId.toString(), ...doc });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

// GET /galeria/admin (lista todas para admin, exceto inativas)
router.get('/admin', async (req: Request, res: Response) => {
  try {
    const { pagina } = req.query as any;
    const query: any = { status: { $ne: 'inativo' } };
    if (pagina) query.pagina = pagina;
    const imgs = await getCol().find(query).sort({ pagina: 1, ordem: 1, criadoEm: -1 }).toArray();
    res.json({ imagens: imgs.map(mapImg), total: imgs.length });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

// DELETE /galeria/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (!mongoose.Types.ObjectId.isValid(id)) { res.status(404).json({ erro: 'Não encontrado' }); return; }
    await getCol().updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { status: 'inativo', atualizadoEm: new Date() } }
    );
    res.json({ mensagem: 'Imagem removida com sucesso' });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

export default router;