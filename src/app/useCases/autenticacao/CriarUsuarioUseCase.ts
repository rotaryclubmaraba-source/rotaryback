import { Usuario, TipoUsuario } from '@dominio/entidades/Usuario';
import { IUsuarioRepositorio } from '@dominio/repositorios/IUsuarioRepositorio';
import { IAutenticacaoServico } from '@dominio/servicos/IAutenticacaoServico';

export interface CriarUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  tipo: TipoUsuario;
}

export class CriarUsuarioUseCase {
  constructor(
    private usuarioRepositorio: IUsuarioRepositorio,
    private autenticacaoServico: IAutenticacaoServico
  ) {}

  async executar(dados: CriarUsuarioDTO): Promise<Usuario> {
    const emailExiste = await this.usuarioRepositorio.existeEmail(dados.email);

    if (emailExiste) {
      throw new Error('Email já cadastrado');
    }

    const senhaHash = await this.autenticacaoServico.hashSenha(dados.senha);

    const usuario = new Usuario({
      nome: dados.nome,
      email: dados.email,
      senha: senhaHash,
      tipo: dados.tipo,
      ativo: true
    });

    const usuarioCriado = await this.usuarioRepositorio.criar(usuario);

    return new Usuario({
      id: usuarioCriado.id?.toString(),
      nome: usuarioCriado.nome,
      email: usuarioCriado.email,
      senha: usuarioCriado.senha,
      tipo: usuarioCriado.tipo,
      ativo: usuarioCriado.ativo
    });
  }
}
