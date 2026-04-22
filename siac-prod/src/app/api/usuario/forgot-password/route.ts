import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json({ message: 'Se o email existir, o link será enviado.' });
    }

    const token = crypto.randomBytes(32).toString('hex');//crio um token aleatório para resetar a senha
    const validade = new Date(Date.now() + 3600000);//com validade de 1h

    await prisma.usuario.update({//atualizo no banco o token e a validade
      where: { email },
      data: { resetToken: token, resetTokenExpires: validade },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    //cont do email
    const mailOptions = {
      from: `"SIAC UTFPR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperação de Senha - SIAC',
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Olá, ${usuario.nome}!</h2>
          <p>Você solicitou a recuperação de senha para o SIAC.</p>
          <p>Clique no botão abaixo para criar uma nova senha (válido por 1 hora):</p>
          <a href="http://localhost:3000/reset-password?token=${token}" 
             style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Resetar Senha
          </a>
        </div>
      `,
    };

    //envio o email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email enviado com sucesso!' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao enviar e-mail' }, { status: 500 });
  }
}