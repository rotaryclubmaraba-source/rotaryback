import { EmailServico } from '@servicosTecnicos/servicos/EmailServico';

interface EnviarDemandaDTO {
  nome: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

export class EnviarDemandaUseCase {
  static async executar(dados: EnviarDemandaDTO): Promise<void> {
    await EmailServico.enviarDemanda(dados);
  }
}
