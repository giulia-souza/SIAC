import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// Função para ler o CSV com correção de formatação
async function readCSV(fileName: string): Promise<any[]> {
  const results: any[] = [];
  
  // Usa o diretório atual do projeto + pasta prisma, garantindo que encontra o ficheiro
  const filePath = path.join(process.cwd(), 'prisma', fileName);
  
  console.log(`A procurar o ficheiro em: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`⚠️ O ficheiro ${fileName} não foi encontrado na pasta prisma!`);
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({
        // Remove caracteres invisíveis (BOM) dos cabeçalhos do Excel
        mapHeaders: ({ header }) => header.trim().replace(/^[\uFEFF\xEF\xBB\xBF]+/, '')
      }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function main() {
  console.log('🚀 A iniciar a leitura dos ficheiros CSV...');

  const bacterias = await readCSV('bacterias.csv');
  const caracteristicas = await readCSV('caracteristicas_match.csv');

  console.log(`📊 Lidas ${bacterias.length} bactérias e ${caracteristicas.length} características.`);

  if (bacterias.length === 0) {
    console.log('❌ O ficheiro bacterias.csv está vazio ou não pôde ser lido.');
    return;
  }

  // LOG DE DEBUG: Mostra a primeira bactéria para termos a certeza que os nomes das colunas bateram certo
  console.log('🔍 Exemplo do primeiro registo lido:', bacterias[0]);

  console.log('⚙️ A enviar dados para o banco... (Isto pode demorar uns segundos)');

  for (const bact of bacterias) {
    // Garante que temos um ID válido e um nome científico antes de processar
    if (!bact.id_bacteria || !bact.nome_cientifico) {
      console.log(`⚠️ Registo ignorado por falta de ID ou Nome:`, bact);
      continue;
    }

    // Filtra as características desta bactéria (comparando como texto, pois o CSV traz tudo como string)
    const caracteristicasDaBacteria = caracteristicas.filter(
      (c) => c.id_bacteria === bact.id_bacteria
    );

    // Formata as características usando OS MESMOS NOMES definidos no schema.prisma
    const caracteristicasFormatadas = caracteristicasDaBacteria.map((c) => ({
      categoria: c.categoria || 'geral',
      caracteristica: c.caracteristica || 'desconhecida', // Corrigido de 'nome'
      valor: c.valor || '',
      peso: parseFloat(c.peso) || 1.0,
      tipo_valor: c.tipo_valor || 'texto', // Corrigido de 'tipoValor'
      fonte: c.fonte || ''
    }));

    // Insere ou atualiza a bactéria
    await prisma.bacteria.upsert({
      where: { nome_cientifico: bact.nome_cientifico }, // Corrigido
      update: {}, 
      create: {
        id_bacteria: parseInt(bact.id_bacteria), // Corrigido de 'idCsv'
        nome_cientifico: bact.nome_cientifico, // Corrigido de 'nomeCientifico'
        genero: bact.genero || '',
        especie: bact.especie || '',
        gram: bact.gram || '',
        morfologia_celular: bact.morfologia_celular || '', // Corrigido de 'morfologia'
        arranjo: bact.arranjo || '',
        // Usa null caso a string venha vazia, pois no schema definimos como String? (opcional)
        observacoes: bact.observacoes || null, 
        fonte: bact.fonte || null,
        
        // Cria as características aninhadas
        caracteristicas: {
          create: caracteristicasFormatadas
        }
      },
    });
  }

  console.log('✅ Base de dados populada com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro Fatal no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });