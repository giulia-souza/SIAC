import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    //validacao se os campos foram preenchidos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    //busco no banco o usuario com o email fornecido
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    
    //qndo usar bcrypt - await bcyrpt.compare(password, usuario.password)
    if (!usuario || usuario.password !== password) {
      return NextResponse.json(
        { error: 'E-mail ou senha inválidos.' },
        { status: 401 }
      );
    }

    //retornar os dados do usuário
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