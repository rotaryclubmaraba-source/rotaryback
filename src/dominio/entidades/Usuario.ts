// src/dominio/entidades/Usuario.ts

/* ===============================
 * ENUM
 * =============================== */

export enum TipoUsuario {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

/* ===============================
 * ENTIDADE DE DOMÍNIO
 * =============================== */

export class Usuario {
  id!: string;

  email!: string;
  senha!: string;
  nome!: string;

  tipo!: TipoUsuario;
  ativo!: boolean;

  criadoEm!: Date;
  atualizadoEm!: Date;

  constructor(props: Partial<Usuario>) {
    Object.assign(this, props);
  }
}