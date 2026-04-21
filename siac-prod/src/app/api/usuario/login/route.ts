import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validar se os campos foram preenchidos
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // 2. Buscar o usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // 3. Verificar se o usuário existe e se a senha está correta
    // OBS: Se estiver usando bcrypt, use: await bcyrpt.compare(password, usuario.password)
    if (!usuario || usuario.password !== password) {
      return NextResponse.json(
        { error: 'E-mail ou senha inválidos.' },
        { status: 401 }
      );
    }

    // 4. Retornar os dados do usuário (exceto a senha por segurança)
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