import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const {email} = await request.json();

    const usuario = await prisma.usuario.findFirst({
      where: {
        email: email,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Não existe esse usuário.' },
        { status: 400 }
      );
    }
    await prisma.usuario.delete({
      where: { id: usuario.id,
        email: email,
       }
    });

    return NextResponse.json({ message: 'Usuário excluído com sucesso!' });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao excluir usuário.' },
      { status: 500 }
    );
  }
}