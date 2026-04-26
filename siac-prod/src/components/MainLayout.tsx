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
  Loader2,
  Lightbulb,
  ShieldCheck,
  Database,
  User
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

  const getTituloPagina = () => {
    if (pathname.includes('/admin/bacterias')) return 'Gestão de Microrganismos';
    if (pathname.includes('/admin/usuarios')) return 'Gestão de Usuários';
    if (pathname.includes('/admin/sugestoes')) return 'Moderação Científica';
    if (pathname.includes('/admin/dashboard')) return 'Painel Administrativo';
    if (pathname.includes('/analise/nova')) return 'Nova Análise';
    if (pathname.includes('/sugestoes')) return 'Sugerir Atualização';
    if (pathname.includes('/historico')) return 'Histórico de Análise';
    if (pathname.includes('/perfil')) return 'Meu Perfil'; // <-- Nova regra adicionada
    
    return isAdmin ? 'Painel Administrativo' : 'Área de Análise';
  };

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
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      <aside className="w-72 bg-blue-900 text-white flex flex-col shadow-2xl z-20 relative">
        
        <div className="p-8 border-b border-blue-800/50 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl font-black text-xl shadow-lg">
            SIAC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg leading-tight">SAGI LABS</span>
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">UTFPR Curitiba</span>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink 
            href={isAdmin ? "/admin/dashboard" : "/analise"} 
            icon={Home} 
            label="Página Inicial"
            activeCondition={pathname === '/admin/dashboard' || pathname === '/analise'} 
          />
          
          <NavLink 
            href="/analise/nova" 
            icon={Microscope} 
            label="Nova Análise"
            activeCondition={pathname.includes('/analise/nova')} 
          />

          <NavLink 
            href="/sugestoes" 
            icon={Lightbulb} 
            label="Sugerir Atualização"
            activeCondition={pathname.includes('/sugestoes') && !pathname.includes('admin')} 
          />

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Administração</p>
              </div>

              <NavLink 
                href="/admin/bacterias" 
                icon={Database} 
                label="Gestão de Microrganismos"
                activeCondition={pathname.includes('/admin/bacterias')} 
              />

              <NavLink 
                href="/admin/usuarios" 
                icon={Users} 
                label="Gestão de Usuários"
                activeCondition={pathname.includes('/usuarios')} 
              />
              
              <NavLink 
                href="/admin/sugestoes" 
                icon={ShieldCheck} 
                label="Moderação Científica"
                activeCondition={pathname.includes('/admin/sugestoes')} 
              />
            </>
          )}

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Registros</p>
          </div>

          <NavLink 
            href="/historico" 
            icon={History} 
            label="Histórico de Análise"
            activeCondition={pathname.includes('/historico')} 
          />
        </nav>

        <div className="p-6 border-t border-blue-800/50 bg-blue-950/30">
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">
            Sessão Ativa
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center font-black text-white uppercase border border-blue-700 shadow-sm shrink-0">
              {usuario.nome.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate text-sm leading-tight">{usuario.nome}</p>
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mt-0.5">{usuario.regra}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link 
              href="/perfil"
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${
                pathname.includes('/perfil')
                  ? 'bg-blue-800/80 text-white border-blue-700 shadow-inner'
                  : 'bg-transparent hover:bg-blue-800/40 text-blue-200 border-transparent hover:border-blue-800/50'
              }`}
            >
              <User size={16} />
              Meu Perfil
            </Link>

            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full bg-blue-800/40 hover:bg-rose-500 hover:text-white text-blue-200 py-2.5 rounded-xl text-sm font-bold transition-all group border border-blue-800/50 hover:border-rose-500"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative">
        
        <header className="bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-200 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {getTituloPagina()}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Bem-vindo(a) de volta ao ambiente laboratorial.
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-2.5 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-inner">
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
        
        <div className="p-4 md:p-8 flex-1">
          {children}
        </div>
        
      </main>
    </div>
  );
}