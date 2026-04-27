'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { 
  Home, Microscope, Users, History, LogOut, Calendar,
  Loader2, Lightbulb, ShieldCheck, Database, User,
  LayoutDashboard, Type, Eye, AlertTriangle
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nome: string; regra: string } | null>(null);
  
  // Estados de Acessibilidade [REU002 e REU003]
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

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
    if (pathname === '/analise') return 'Área de Análise';
    if (pathname.includes('/analise/nova')) return 'Identificação de Cepa';
    if (pathname.includes('/sugestoes')) return 'Sugerir Atualização';
    if (pathname.includes('/historico')) return 'Histórico de Análise';
    if (pathname.includes('/perfil')) return 'Meu Perfil';
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
    // Aplicando fonte dinâmica e contraste alto [REU002 / REU003]
    <div 
      style={{ fontSize: `${fontSize}px` }}
      className={`flex h-screen font-sans overflow-hidden transition-all ${
        highContrast ? 'bg-black text-white' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      
      {/* Sidebar Lateral */}
      <aside className={`w-72 flex flex-col shadow-2xl z-20 relative ${highContrast ? 'bg-zinc-900 border-r border-white/20' : 'bg-blue-900 text-white'}`}>
        <div className="p-8 border-b border-blue-800/50 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl font-black text-xl shadow-lg">SIAC</div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg leading-tight">SAGI LABS</span>
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">UTFPR Curitiba</span>
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink 
            href={isAdmin ? "/admin/dashboard" : "/analise"} 
            icon={isAdmin ? LayoutDashboard : Home} 
            label={isAdmin ? "Dashboard Admin" : "Página Inicial"}
            activeCondition={pathname === '/admin/dashboard' || pathname === '/analise'} 
          />
          <div className="pt-4 pb-2 text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Laboratório</div>
          <NavLink href="/analise/nova" icon={Microscope} label="Nova Análise" activeCondition={pathname.includes('/analise/nova')} />
          <NavLink href="/sugestoes" icon={Lightbulb} label="Sugerir Cepa" activeCondition={pathname.includes('/sugestoes') && !pathname.includes('admin')} />

          {isAdmin && (
            <>
              <div className="pt-4 pb-2 text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Administração</div>
              <NavLink href="/admin/bacterias" icon={Database} label="Gestão de Microrganismos" activeCondition={pathname.includes('/admin/bacterias')} />
              <NavLink href="/admin/usuarios" icon={Users} label="Gestão de Usuários" activeCondition={pathname.includes('/usuarios')} />
              <NavLink href="/admin/sugestoes" icon={ShieldCheck} label="Moderação Científica" activeCondition={pathname.includes('/admin/sugestoes')} />
            </>
          )}

          <div className="pt-4 pb-2 text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Relatórios</div>
          <NavLink href="/historico" icon={History} label="Histórico de Análise" activeCondition={pathname.includes('/historico')} />
        </nav>

        {/* ACESSIBILIDADE NA SIDEBAR [REU002 / REU003] */}
        <div className="p-4 mx-4 mb-4 bg-blue-950/40 rounded-2xl border border-blue-800/50 space-y-3">
          <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] text-center">Acessibilidade</p>
          <div className="flex justify-around items-center">
            <button onClick={() => setFontSize(prev => Math.max(12, prev - 2))} className="p-2 hover:bg-blue-800 rounded-lg text-blue-200" title="Diminuir Fonte"><Type size={14} /></button>
            <button onClick={() => setFontSize(prev => Math.min(24, prev + 2))} className="p-2 hover:bg-blue-800 rounded-lg text-blue-200" title="Aumentar Fonte"><Type size={20} /></button>
            <div className="w-px h-4 bg-blue-800"></div>
            <button onClick={() => setHighContrast(!highContrast)} className={`p-2 rounded-lg transition-colors ${highContrast ? 'bg-yellow-400 text-black' : 'hover:bg-blue-800 text-blue-200'}`} title="Alto Contraste"><Eye size={18} /></button>
          </div>
        </div>

        <div className="p-6 border-t border-blue-800/50 bg-blue-950/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center font-black text-white uppercase border border-blue-700 shrink-0">{usuario.nome.charAt(0)}</div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate text-sm leading-tight">{usuario.nome}</p>
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mt-0.5">{usuario.regra}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/perfil" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all border bg-transparent hover:bg-blue-800/40 text-blue-200 border-transparent hover:border-blue-800/50"><User size={16} />Meu Perfil</Link>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-blue-800/40 hover:bg-rose-500 hover:text-white text-blue-200 py-2.5 rounded-xl text-sm font-bold transition-all border border-blue-800/50 hover:border-rose-500"><LogOut size={16} />Sair</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative">
        
        {/* AVISO EDUCACIONAL [REU004] */}
        <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-center gap-3 z-[60] shadow-md">
          <AlertTriangle size={16} className="animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-wider">
            Suporte à Decisão Educacional: Ferramenta acadêmica, não substitui diagnóstico clínico oficial.
          </p>
        </div>

        <header className={`px-10 py-6 border-b flex justify-between items-center sticky top-0 z-50 shadow-sm backdrop-blur-md ${highContrast ? 'bg-black border-white/20' : 'bg-white/80 border-slate-200'}`}>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{getTituloPagina()}</h1>
            <p className={`text-sm font-medium mt-0.5 ${highContrast ? 'text-zinc-400' : 'text-slate-500'}`}>
              {isAdmin ? "Monitorando atividades do laboratório." : "Bem-vindo(a) ao seu espaço de pesquisa."}
            </p>
          </div>
          <div className={`hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-bold shadow-inner ${highContrast ? 'bg-zinc-900 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <Calendar size={18} className="text-blue-600" />
            <span className="capitalize">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        
        <div className="p-4 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}