import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const {email, promocao} = await request.json();

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

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        regra: promocao,
      },
    });

    return NextResponse.json({ message: 'Usuário promovido com sucesso!' });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao promover usuário.' },
      { status: 500 }
    );
  }
}