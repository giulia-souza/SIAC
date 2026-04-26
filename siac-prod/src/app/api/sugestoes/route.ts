import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo_sugestao, nome_bacteria, dados_propostos, autor_nome, autor_regra } = body;

    if (!tipo_sugestao || !nome_bacteria || !dados_propostos || !autor_nome) {
      return NextResponse.json({ error: 'Dados incompletos para a submissão.' }, { status: 400 });
    }

    const isAdmin = autor_regra === 'PROFESSOR' || autor_regra === 'ADMINISTRADOR';

    if (isAdmin) {
      const gram = dados_propostos.gram || 'Não avaliado';
      const morfologia_celular = dados_propostos.morfologia || 'Não avaliado';
      const arranjo = dados_propostos.arranjo || 'Não avaliado';
      const observacoes = dados_propostos.observacoes || null;

      delete dados_propostos.gram; delete dados_propostos.morfologia; delete dados_propostos.arranjo; delete dados_propostos.observacoes;

      const ultimaBacteria = await prisma.bacteria.findFirst({ orderBy: { id_bacteria: 'desc' } });
      const novoId = (ultimaBacteria?.id_bacteria || 0) + 1;

      const partesNome = nome_bacteria.trim().split(' ');
      const genero = partesNome[0] || 'Desconhecido';
      const especie = partesNome.slice(1).join(' ') || 'sp.';

      const arrayCaracteristicas = Object.entries(dados_propostos).map(([chave, valor]) => {
        let categoria = 'outros';
        if (['hemolise', 'cor_colonia', 'pigmento', 'textura', 'tamanho_colonia', 'forma', 'crescimento', 'odor'].includes(chave)) categoria = 'colonia';
        else if (['catalase', 'coagulase', 'oxidase', 'lactose', 'indol', 'citrato', 'urease', 'h2s', 'motilidade', 'fermentacao', 'bile_esculina', 'nacl_6_5'].includes(chave)) categoria = 'bioquimica';
        else if (['atmosfera', 'anaerobio', 'meio_especifico', 'fatores_xv', 'baar', 'esporos', 'velocidade'].includes(chave)) categoria = 'crescimento';

        return {
          categoria, caracteristica: chave, valor: String(valor), peso: 1.0, tipo_valor: 'texto',
          fonte: `Inserido por Professor (${autor_nome})`
        };
      });

      await prisma.bacteria.create({
        data: {
          id_bacteria: novoId, genero, especie, nome_cientifico: nome_bacteria,
          gram, morfologia_celular, arranjo, observacoes,
          fonte: `Cadastro Direto: ${autor_nome}`,
          caracteristicas: { create: arrayCaracteristicas }
        }
      });
      
      console.log(`Bactéria ${nome_bacteria} inserida DIRETAMENTE pelo professor!`);
      return NextResponse.json({ sucesso: true, tipo: 'INSERCAO_DIRETA' }, { status: 201 });
      
    } else {
      const novaSugestao = await prisma.sugestao.create({
        data: {
          tipo_sugestao,
          nome_bacteria,
          dados_propostos: JSON.stringify(dados_propostos), 
          autor_nome,
          autor_regra: autor_regra || 'ALUNO',
        },
      });

      return NextResponse.json({ sucesso: true, tipo: 'SUGESTAO_CRIADA' }, { status: 201 });
    }
  } catch (error) {
    console.error('Erro ao processar submissão:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDENTE';

    const sugestoes = await prisma.sugestao.findMany({
      where: {
        status: status 
      },
      orderBy: {
        data_envio: 'asc' 
      }
    });

    return NextResponse.json(sugestoes);
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID ou status ausente.' }, { status: 400 });
    }

    const sugestaoAtualizada = await prisma.sugestao.update({
      where: { id: Number(id) },
      data: { status: status }, 
    });

    if (status === 'APROVADA' && sugestaoAtualizada.tipo_sugestao === 'NOVA_BACTERIA') {
      const dados = JSON.parse(sugestaoAtualizada.dados_propostos);

      const gram = dados.gram || 'Não avaliado';
      const morfologia_celular = dados.morfologia || 'Não avaliado';
      const arranjo = dados.arranjo || 'Não avaliado';
      const observacoes = dados.observacoes || null;

      delete dados.gram;
      delete dados.morfologia;
      delete dados.arranjo;
      delete dados.observacoes;

      const ultimaBacteria = await prisma.bacteria.findFirst({
        orderBy: { id_bacteria: 'desc' }
      });
      const novoId = (ultimaBacteria?.id_bacteria || 0) + 1;

      const partesNome = sugestaoAtualizada.nome_bacteria.trim().split(' ');
      const genero = partesNome[0] || 'Desconhecido';
      const especie = partesNome.slice(1).join(' ') || 'sp.';

      const arrayCaracteristicas = Object.entries(dados).map(([chave, valor]) => {
        let categoria = 'outros';
        if (['hemolise', 'cor_colonia', 'pigmento', 'textura', 'tamanho_colonia', 'forma', 'crescimento', 'odor'].includes(chave)) categoria = 'colonia';
        else if (['catalase', 'coagulase', 'oxidase', 'lactose', 'indol', 'citrato', 'urease', 'h2s', 'motilidade', 'fermentacao', 'bile_esculina', 'nacl_6_5'].includes(chave)) categoria = 'bioquimica';
        else if (['atmosfera', 'anaerobio', 'meio_especifico', 'fatores_xv', 'baar', 'esporos', 'velocidade'].includes(chave)) categoria = 'crescimento';

        return {
          categoria: categoria,
          caracteristica: chave,
          valor: String(valor),
          peso: 1.0,
          tipo_valor: 'texto',
          fonte: `Aluno: ${sugestaoAtualizada.autor_nome}`
        };
      });

      await prisma.bacteria.create({
        data: {
          id_bacteria: novoId,
          genero: genero,
          especie: especie,
          nome_cientifico: sugestaoAtualizada.nome_bacteria,
          gram: gram,
          morfologia_celular: morfologia_celular,
          arranjo: arranjo,
          observacoes: observacoes,
          fonte: `Sugerido por ${sugestaoAtualizada.autor_nome} (Aprovado)`,
          
          caracteristicas: {
            create: arrayCaracteristicas
          }
        }
      });
      
      console.log(`Bactéria [${novoId}] ${sugestaoAtualizada.nome_bacteria} inserida com sucesso no banco oficial!`);
    }

    return NextResponse.json(sugestaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar sugestão:', error);
    return NextResponse.json({ error: 'Erro interno ao atualizar' }, { status: 500 });
  }
}