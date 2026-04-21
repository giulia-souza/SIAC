import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, novaSenha } = await request.json();

    // 1. Procura o usuário que tenha esse token e que não esteja expirado
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(), // Verifica se a data de expiração é maior que 'agora'
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado.' },
        { status: 400 }
      );
    }

    // 2. Atualiza a senha e LIMPA o token para não ser usado de novo
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        password: novaSenha, // Lembre-se: em produção, use bcrypt aqui!
        resetToken: null,    // Limpa o token (aquele '?' que usamos no Prisma)
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