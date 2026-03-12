// src/ui/rotas/autenticacaoRotas.ts
import { Router } from 'express';
import { AutenticacaoControlador } from '../controladores/AutenticacaoControlador';

const router = Router();
const controlador = new AutenticacaoControlador();

// 🔑 Login (gera token/cookie)
router.post('/login', (req, res) => controlador.login(req, res));

// 📝 Registro de novo usuário admin (opcional)
router.post('/registrar', (req, res) => controlador.registrar(req, res));

// 🚪 Logout (remove cookie/sessão e envia redirect)
router.post('/logout', async (req, res) => {
  try {
    await controlador.logout(req, res);

    // Limpa o cookie de autenticação, se houver
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // Redirecionamento seguro para página inicial
    res.json({ redirect: '/' });
  } catch (erro: any) {
    console.error('Erro no logout:', erro);
    res.status(500).json({ erro: 'Erro ao realizar logout' });
  }
});

export default router;
