'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { 
  Home, 
  Microscope, 
  Users, 
  History, 
  LogOut, 
  Calendar,
  Loader2
} from 'lucide-react';

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

  if (!usuario) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-blue-600 gap-3">
        <Loader2 size={32} className="animate-spin" />
        <span className="font-bold text-lg animate-pulse">Carregando painel...</span>
      </div>
    );
  }

  const isAdmin = usuario.regra === 'ADMINISTRADOR' || usuario.regra === 'PROFESSOR';

  // Componente de link auxiliar para padronizar o menu
  const NavLink = ({ href, icon: Icon, label, activeCondition }: { href: string, icon: any, label: string, activeCondition: boolean }) => (
    <Link 
      href={href} 
      className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all duration-200 ${
        activeCondition 
          ? 'bg-blue-800 text-white shadow-md' 
          : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
      }`}
    >
      <Icon size={20} />
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar Lateral */}
      <aside className="w-72 bg-blue-900 text-white flex flex-col shadow-2xl z-10">
        
        {/* Logo / Header da Sidebar */}
        <div className="p-8 border-b border-blue-800/50 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl font-black text-xl shadow-lg">
            SIAC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg leading-tight">SAGI LABS</span>
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">UTFPR Curitiba</span>
          </div>
        </div>
        
        {/* Navegação */}
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          <NavLink 
            href={isAdmin ? "/admin/dashboard" : "/analise"} 
            icon={Home} 
            label="Página Inicial"
            activeCondition={pathname === '/admin/dashboard' || pathname === '/analise'} 
          />
          
          {/* Agora liberado para todos (removida a restrição !isAdmin) */}
          <NavLink 
            href="/analise/nova" 
            icon={Microscope} 
            label="Nova Análise"
            activeCondition={pathname.includes('/analise/nova')} 
          />

          {isAdmin && (
            <NavLink 
              href="/admin/usuarios" 
              icon={Users} 
              label="Gestão de Usuários"
              activeCondition={pathname.includes('/usuarios')} 
            />
          )}

          <NavLink 
            href="/historico" 
            icon={History} 
            label="Histórico de Dados"
            activeCondition={pathname.includes('/historico')} 
          />
        </nav>

        {/* Rodapé da Sidebar (Perfil e Logout) */}
        <div className="p-6 border-t border-blue-800/50 bg-blue-950/30">
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">
            Sessão Ativa
          </p>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center font-bold text-white uppercase border border-blue-700">
              {usuario.nome.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate text-sm leading-tight">{usuario.nome}</p>
              <p className="text-xs text-blue-300 capitalize">{usuario.regra.toLowerCase()}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-blue-800/40 hover:bg-red-500 hover:text-white text-blue-200 py-3 rounded-xl text-sm font-bold transition-all group border border-blue-800/50 hover:border-red-500"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        
        {/* Header Dinâmico de Topo */}
        <header className="bg-white px-10 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-0 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {pathname.includes('admin') ? 'Painel Administrativo' : 'Área de Análise'}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Bem-vindo(a) de volta ao ambiente laboratorial.
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 shadow-inner">
            <Calendar size={18} className="text-blue-600" />
            <span className="capitalize">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>
        
        {/* Container das Páginas (Children) */}
        <div className="p-8 flex-1">
          {children}
        </div>
        
      </main>
    </div>
  );
}