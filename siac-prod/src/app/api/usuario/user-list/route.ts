import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET() {
  try {
    const todosOsUsers = await prisma.usuario.findMany();

    return NextResponse.json(todosOsUsers);
    
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
    return NextResponse.json({ erro: "Falha na conexão com o banco" }, { status: 500 });
  }
}
