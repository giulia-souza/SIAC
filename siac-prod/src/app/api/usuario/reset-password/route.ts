import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, novaSenha } = await request.json();

    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), //verif se a data de exp é maior que agr
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado.' },
        { status: 400 }
      );
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: novaSenha,
        resetToken: null,   
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ message: 'Senha atualizada com sucesso!' });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao redefinir senha.' },
      { status: 500 }
    );
  }
}