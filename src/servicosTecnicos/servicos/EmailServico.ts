import nodemailer from 'nodemailer';

interface DemandaEmailDTO {
  nome: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

export class EmailServico {
  static async enviarDemanda(dados: DemandaEmailDTO): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // senha de app
      },
    });

    await transporter.sendMail({
      from: `"Rotary Club" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO,
      subject: `Nova solicitação: ${dados.assunto}`,
      html: `
        <h3>🐾 Nova solicitação recebida</h3>
        <p><strong>Nome:</strong> ${dados.nome}</p>
        <p><strong>Telefone:</strong> ${dados.telefone}</p>
        <p><strong>Assunto:</strong> ${dados.assunto}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${dados.mensagem}</p>
      `,
    });

    console.log('✅ E-mail enviado com sucesso');
  }
}
