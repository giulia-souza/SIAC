// src/app/page.tsx
import { prisma } from '@/lib/prisma';

export default async function Home() {
  
  const bacterias = await prisma.microrganismo.findMany();

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1><strong>Banco de TESTE SIAC</strong></h1>
      <ul>
        {bacterias.map((bact: any) => (
          <li key={bact.id}>
            <strong>Nome:</strong> {bact.nome} | <strong>Formato:</strong> {bact.formato}
          </li>
        ))}
      </ul>
    </main>
  );
}