import { Router, Request, Response } from 'express';
import { EnviarDemandaUseCase } from '../../app/useCases/demanda/EnviarDemandaUseCase';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: 'Corpo da requisição inválido',
      });
    }

    console.log('📩 ROTA /demanda CHAMADA');
    console.log('📦 BODY:', req.body);

    await EnviarDemandaUseCase.executar(req.body);

    return res.status(201).json({
      message: 'Demanda enviada com sucesso',
    });
  } catch (erro) {
    console.error('❌ Erro ao enviar demanda:', erro);

    return res.status(500).json({
      message: 'Erro ao enviar demanda',
    });
  }
});
export default router;