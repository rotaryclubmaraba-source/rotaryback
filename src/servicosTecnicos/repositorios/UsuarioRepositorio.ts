// src/servicosTecnicos/repositorios/UsuarioRepositorio.ts
import { Types } from 'mongoose';
import { Usuario, TipoUsuario } from '@dominio/entidades/Usuario';
import { IUsuarioRepositorio } from '@dominio/repositorios/IUsuarioRepositorio';
import { UsuarioModel } from '../database/schemas/UsuarioSchema';

export class UsuarioRepositorio implements IUsuarioRepositorio {
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const doc = await UsuarioModel.findOne({ email }).lean();
    if (!doc) return null;

    return new Usuario({
      id: doc._id.toString(),
      email: doc.email,
      senha: doc.senha,
      nome: doc.nome,
      tipo: doc.tipo as TipoUsuario,
      ativo: doc.ativo,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await UsuarioModel.findById(id).lean();
    if (!doc) return null;

    return new Usuario({
      id: doc._id.toString(),
      email: doc.email,
      senha: doc.senha,
      nome: doc.nome,
      tipo: doc.tipo as TipoUsuario,
      ativo: doc.ativo,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
    });
  }

  async listarTodos(): Promise<Usuario[]> {
    const docs = await UsuarioModel.find().sort({ criadoEm: -1 }).lean();

    return docs.map(
      (doc) =>
        new Usuario({
          id: doc._id.toString(),
          email: doc.email,
          senha: doc.senha,
          nome: doc.nome,
          tipo: doc.tipo as TipoUsuario,
          ativo: doc.ativo,
          criadoEm: doc.criadoEm,
          atualizadoEm: doc.atualizadoEm,
        })
    );
  }

  async criar(usuario: Usuario): Promise<Usuario> {
    const criado = await UsuarioModel.create({
      email: usuario.email,
      senha: usuario.senha,
      nome: usuario.nome,
      tipo: usuario.tipo,
      ativo: usuario.ativo,
    });

    return new Usuario({
      id: criado._id.toString(),
      email: criado.email,
      senha: criado.senha,
      nome: criado.nome,
      tipo: criado.tipo as TipoUsuario,
      ativo: criado.ativo,
      criadoEm: criado.criadoEm,
      atualizadoEm: criado.atualizadoEm,
    });
  }

  async atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario> {
    const atualizado = await UsuarioModel.findByIdAndUpdate(
      id,
      {
        email: dados.email,
        senha: dados.senha,
        nome: dados.nome,
        tipo: dados.tipo,
        ativo: dados.ativo,
      },
      { new: true }
    ).lean();

    if (!atualizado) {
      throw new Error('Usuário não encontrado');
    }

    return new Usuario({
      id: atualizado._id.toString(),
      email: atualizado.email,
      senha: atualizado.senha,
      nome: atualizado.nome,
      tipo: atualizado.tipo as TipoUsuario,
      ativo: atualizado.ativo,
      criadoEm: atualizado.criadoEm,
      atualizadoEm: atualizado.atualizadoEm,
    });
  }

  async deletar(id: string): Promise<void> {
    await UsuarioModel.findByIdAndDelete(id);
  }

  async existeEmail(email: string): Promise<boolean> {
    const count = await UsuarioModel.countDocuments({ email });
    return count > 0;
  }
}