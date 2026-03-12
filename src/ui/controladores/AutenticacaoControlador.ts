// src/ui/controladores/AutenticacaoControlador.ts
import { Request, Response } from 'express';
import { LoginUseCase } from '@app/useCases/autenticacao/LoginUseCase';
import { CriarUsuarioUseCase } from '@app/useCases/autenticacao/CriarUsuarioUseCase';
import { UsuarioRepositorio } from '@servicosTecnicos/repositorios/UsuarioRepositorio';
import { AutenticacaoServico } from '@servicosTecnicos/servicos/AutenticacaoServico';

export class AutenticacaoControlador {
  /**
   * Realiza login do usuário
   * Gera token JWT e salva em cookie HttpOnly
   */
  async login(req: Request, res: Response) {
    try {
      // 🔹 normalização defensiva
      const email = String(req.body.email ?? '').trim().toLowerCase();
      const senha = String(req.body.senha ?? '').trim();

      if (!email || !senha) {
        return res.status(400).json({
          erro: 'Email e senha são obrigatórios',
        });
      }

      // 🔹 dependências
      const usuarioRepositorio = new UsuarioRepositorio();
      const autenticacaoServico = new AutenticacaoServico();
      const loginUseCase = new LoginUseCase(usuarioRepositorio, autenticacaoServico);

      // 🔹 execução do caso de uso
      const resultado = await loginUseCase.executar({ email, senha });

      // 🔹 grava token em cookie HttpOnly
      res.cookie('token', resultado.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hora
      });

      return res.status(200).json(resultado);
    } catch (erro: any) {
      return res.status(401).json({
        erro: erro?.message || 'Credenciais inválidas',
      });
    }
  }

  /**
   * Registro de novo usuário
   */
  async registrar(req: Request, res: Response) {
    try {
      const nome = String(req.body.nome ?? '').trim();
      const email = String(req.body.email ?? '').trim().toLowerCase();
      const senha = String(req.body.senha ?? '').trim();
      const tipo = req.body.tipo ?? 'editor'; // 'admin' ou 'editor'

      if (!nome || !email || !senha) {
        return res.status(400).json({
          erro: 'Nome, email e senha são obrigatórios',
        });
      }

      const usuarioRepositorio = new UsuarioRepositorio();
      const autenticacaoServico = new AutenticacaoServico();
      const criarUsuarioUseCase = new CriarUsuarioUseCase(usuarioRepositorio, autenticacaoServico);

      const usuario = await criarUsuarioUseCase.executar({ nome, email, senha, tipo });

      // 🔹 remove senha da resposta
      const { senha: _senha, ...usuarioSemSenha } = usuario as any;

      return res.status(201).json(usuarioSemSenha);
    } catch (erro: any) {
      return res.status(400).json({
        erro: erro?.message || 'Erro ao registrar usuário',
      });
    }
  }

  /**
   * Logout do usuário
   * Limpa cookie JWT e pode ser usado para limpar sessão
   */
  async logout(_req: Request, res: Response) {
    try {
      res.clearCookie('token');
      return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
    } catch (erro: any) {
      return res.status(500).json({ erro: 'Não foi possível realizar logout' });
    }
  }
}
