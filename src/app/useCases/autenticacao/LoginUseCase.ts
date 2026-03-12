import { IUsuarioRepositorio } from '@dominio/repositorios/IUsuarioRepositorio';
import { IAutenticacaoServico } from '@dominio/servicos/IAutenticacaoServico';

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
}

export class LoginUseCase {
  constructor(
    private usuarioRepositorio: IUsuarioRepositorio,
    private autenticacaoServico: IAutenticacaoServico
  ) {}

  async executar(dados: LoginDTO): Promise<LoginResponse> {
    const usuario = await this.usuarioRepositorio.buscarPorEmail(dados.email);

    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário inativo');
    }

    const senhaValida = await this.autenticacaoServico.compararSenha(
      dados.senha,
      usuario.senha
    );

    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const token = this.autenticacaoServico.gerarToken({
      usuarioId: usuario.id.toString(),
      email: usuario.email,
      tipo: usuario.tipo
    });

    return {
      token,
      usuario: {
        id: usuario.id.toString(),
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    };
  }
}
