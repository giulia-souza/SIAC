import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, senhaAtual, novaSenha } = body;

    if (!email || !senhaAtual || !novaSenha) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    var senhaValida = false;
    
    if (senhaAtual == usuario.password) {
        senhaValida = true
    }

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'A senha atual está incorreta.' },
        { status: 401 } // 401 Unauthorized
      );
    }

    const saltRounds = 10;
    
    await prisma.usuario.update({
      where: { email: email },
      data: {
        password: novaSenha //
      }
    });

    return NextResponse.json(
      { message: 'Senha atualizada com sucesso!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao tentar atualizar a senha.' },
      { status: 500 }
    );
  }
}