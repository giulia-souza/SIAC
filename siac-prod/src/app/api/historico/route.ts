import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_bacteria, nome_usuario, regra_usuario } = body;

    if (!id_bacteria || !nome_usuario) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const log = await prisma.historicoAnalise.create({
      data: {
        id_bacteria: Number(id_bacteria),
        nome_usuario,
        regra_usuario: regra_usuario || 'ALUNO',
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar histórico' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nome_usuario = searchParams.get('usuario');
    const regra = searchParams.get('regra');

    let whereClause = {};
    
    if (regra !== 'ADMINISTRADOR' && regra !== 'PROFESSOR' && nome_usuario) {
      whereClause = { nome_usuario: nome_usuario };
    }

    const logs = await prisma.historicoAnalise.findMany({
      where: whereClause,
      include: {
        bacteria: {
          include: {
            caracteristicas: true 
          }
        }
      },
      orderBy: {
        data_pesquisa: 'desc' 
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar' }, { status: 500 });
  }
}