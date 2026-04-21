// src/app/api/microrganismos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importa a conexão que você criou

export async function GET() {
  try {
    const todasAsBacterias = await prisma.microrganismo.findMany();

    // devolve os dados para o front
    return NextResponse.json(todasAsBacterias);
    
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
    return NextResponse.json({ erro: "Falha na conexão com o banco" }, { status: 500 });
  }
}