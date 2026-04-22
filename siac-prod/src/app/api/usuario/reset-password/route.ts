import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, novaSenha } = await request.json();

    //procuro o user que tenha esse token e que não esteja expirado
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

    //Atualiza a senha e LIMPA o token para não ser usado de novo
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: novaSenha, //bcrypt aqui
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