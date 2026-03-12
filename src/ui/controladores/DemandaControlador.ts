import { Request, Response } from 'express';
import { EnviarDemandaUseCase } from '@app/useCases/demanda/EnviarDemandaUseCase';

interface DemandaDTO {
  nome: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

export async function criarDemanda(req: Request, res: Response) {
  try {
    const data = req.body as DemandaDTO;

    if (!data?.nome || !data?.telefone || !data?.assunto || !data?.mensagem) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    await EnviarDemandaUseCase.executar({
      nome: data.nome,
      telefone: data.telefone,
      assunto: data.assunto,
      mensagem: data.mensagem,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Falha no envio' });
  }
}
