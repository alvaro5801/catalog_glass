// src/lib/email.ts
import nodemailer from 'nodemailer';

// 1. Configurar o "transportador" (transporter) do Nodemailer
// Adicionámos a configuração 'tls' para resolver o erro de certificado do Brevo.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // false para porta 587
  auth: {
    user: process.env.SMTP_USER, // O teu e-mail de login do Brevo
    pass: process.env.SMTP_PASS, // A tua chave SMTP do Brevo
  },
  // ✅ CORREÇÃO: Configurações de TLS para evitar erros de certificado no Brevo
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false, // Ignora o erro de nome do host no certificado
  },
});

const fromEmail = process.env.FROM_EMAIL;

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Recuperação de Senha - Catalogg</h2>
      <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Redefinir Senha</a>
      <p>Se não pediu isto, pode ignorar este e-mail. O link expira em 1 hora.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `Printa Copos <${fromEmail}>`, // Usamos o mesmo formato do outro e-mail
      to: email,
      subject: 'Redefinir a sua senha',
      html,
    });
    console.log(`E-mail de recuperação enviado para ${email}`);
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    throw new Error("Falha ao enviar o e-mail de recuperação.");
  }
}

/**
 * Envia um e-mail de verificação de conta com um token.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const subject = "Confirme o seu e-mail - Printa Copos";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Bem-vindo à Printa Copos!</h2>
      <p>O seu código de verificação é:</p>
      <h1 style="font-size: 3em; letter-spacing: 5px; margin: 20px 0;">
        ${token}
      </h1>
      <p>Este código expira em 1 hora.</p>
      <p>Se não solicitou este registo, pode ignorar este e-mail.</p>
    </div>
  `;

  // 2. Monta a mensagem para o Nodemailer
  const mailOptions = {
    from: `Printa Copos <${fromEmail}>`, // O teu e-mail profissional verificado
    to: email,
    subject: subject,
    html: html,
  };

  try {
    // 3. Envia o e-mail
    if (!process.env.SMTP_PASS || !fromEmail) {
      throw new Error("Credenciais de e-mail (SMTP) não configuradas no servidor.");
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail de verificação enviado: %s", info.messageId);
  
  } catch (error: unknown) { 
    console.error("Erro ao enviar e-mail (Nodemailer/Brevo):", error);
    throw new Error("Falha ao enviar o e-mail.");
  }
}