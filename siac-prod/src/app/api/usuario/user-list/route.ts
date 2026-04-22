import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

export async function GET() {
  try {
    // Código que vai até o MySQL e busca todos os microrganismos
    const todosOsUsers = await prisma.usuario.findMany();

    // Devolve os dados para o frontend
    return NextResponse.json(todosOsUsers);
    
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
    return NextResponse.json({ erro: "Falha na conexão com o banco" }, { status: 500 });
  }
}
