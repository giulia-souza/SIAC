import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    
    if (!usuario || usuario.password !== password) {
      return NextResponse.json(
        { error: 'E-mail ou senha inválidos.' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = usuario;

    return NextResponse.json({
      message: 'Login realizado com sucesso!',
      user: userWithoutPassword,
    }, { status: 200 });

  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}