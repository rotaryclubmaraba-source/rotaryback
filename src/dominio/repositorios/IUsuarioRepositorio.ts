// src/dominio/repositorios/IUsuarioRepositorio.ts
import { Usuario } from '@dominio/entidades/Usuario';

export interface IUsuarioRepositorio {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  listarTodos(): Promise<Usuario[]>;
  criar(usuario: Usuario): Promise<Usuario>;
  atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario>;
  deletar(id: string): Promise<void>;
  existeEmail(email: string): Promise<boolean>;
}
