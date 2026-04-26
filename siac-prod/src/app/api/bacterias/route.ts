import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bacteriasDb = await prisma.bacteria.findMany({
      include: {
        caracteristicas: true,
      },
      orderBy: {
        nome_cientifico: 'asc',
      },
    });

    const resultado = bacteriasDb.map((bact) => ({
      id: bact.id_bacteria,
      nome: bact.nome_cientifico,
      gram: bact.gram,
      morfologia_celular: bact.morfologia_celular,
      arranjo: bact.arranjo,
      fonte: bact.fonte,
      caracteristicas: bact.caracteristicas.map((c) => ({
        caracteristica: c.caracteristica,
        categoria: c.categoria,
        valor: c.valor,
        peso: c.peso,
        tipo_valor: c.tipo_valor,
      })),
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar bactérias' }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da bactéria ausente.' }, { status: 400 });
    }
    
    await prisma.bacteria.delete({
      where: { id_bacteria: Number(id) }
    });

    return NextResponse.json({ sucesso: true, mensagem: 'Microrganismo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover bactéria:', error);
    return NextResponse.json({ error: 'Erro interno ao tentar remover' }, { status: 500 });
  }
}