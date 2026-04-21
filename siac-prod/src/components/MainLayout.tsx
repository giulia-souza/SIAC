'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nome: string; regra: string } | null>(null);

  useEffect(() => {
    const session = Cookies.get('siac_session');
    if (!session) {
      router.push('/login');
    } else {
      setUsuario(JSON.parse(session));
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('siac_session');
    router.push('/login');
  };

  if (!usuario) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  const isAdmin = usuario.regra === 'ADMINISTRADOR' || usuario.regra === 'PROFESSOR';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-blue-800">
          SIAC <span className="text-sm font-light block">UTFPR</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href={isAdmin ? "/admin/dashboard" : "/analise"} 
            className={`block p-3 rounded hover:bg-blue-800 ${pathname.includes('dashboard') || pathname.includes('analise') ? 'bg-blue-800' : ''}`}>
            🏠 Início
          </Link>
          
          {!isAdmin && (
            <Link href="/analise/nova" className="block p-3 rounded hover:bg-blue-800">
              🔬 Nova Análise
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin/usuarios" className="block p-3 rounded hover:bg-blue-800">
              👥 Gerenciar Usuários
            </Link>
          )}

          <Link href="/historico" className="block p-3 rounded hover:bg-blue-800">
            📜 Histórico
          </Link>
        </nav>

        <div className="p-4 border-t border-blue-800">
          <p className="text-xs text-blue-300">Logado como:</p>
          <p className="font-medium truncate">{usuario.nome}</p>
          <button 
            onClick={handleLogout}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 py-2 rounded text-sm transition"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {pathname.includes('admin') ? 'Painel Administrativo' : 'Área do Estudante'}
          </h1>
          <div className="bg-white px-4 py-2 rounded shadow-sm text-sm text-gray-600">
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </header>
        
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}