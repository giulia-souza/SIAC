'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { 
  Home, Microscope, Users, History, LogOut, Calendar,
  Loader2, Lightbulb, ShieldCheck, Database, User,
  LayoutDashboard, Type, Eye, AlertTriangle, Accessibility, X,
  Menu, ChevronDown
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nome: string; regra: string } | null>(null);
  
  // Estados de Layout e Acessibilidade
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [menuAcessibilidadeOpen, setMenuAcessibilidadeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Novos Estados: Barra Lateral e Dropdown de Perfil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = Cookies.get('siac_session');
    if (!session) {
      router.push('/login');
    } else {
      setUsuario(JSON.parse(session));
    }

    const savedContrast = localStorage.getItem('siac_high_contrast');
    const savedFontSize = localStorage.getItem('siac_font_size');
    
    if (savedContrast === 'true') setHighContrast(true);
    if (savedFontSize) setFontSize(Number(savedFontSize));
  }, [router]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize, mounted]);

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('siac_high_contrast', String(newValue));
  };

  const handleFontSizeChange = (action: 'increase' | 'decrease') => {
    setFontSize(prev => {
      const nextValue = action === 'increase' ? Math.min(24, prev + 2) : Math.max(12, prev - 2);
      localStorage.setItem('siac_font_size', String(nextValue));
      return nextValue;
    });
  };

  const handleLogout = () => {
    Cookies.remove('siac_session');
    router.push('/login');
  };

  if (!usuario || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-blue-600 gap-3">
        <Loader2 size={32} className="animate-spin" />
        <span className="font-bold text-lg animate-pulse">Carregando painel...</span>
      </div>
    );
  }

  const isAdmin = usuario.regra === 'ADMINISTRADOR' || usuario.regra === 'PROFESSOR';
  const primeiroNome = usuario.nome.split(' ')[0];

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
      onClick={() => setSidebarOpen(false)} // Fecha a barra ao clicar num link
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
    <div 
      className={`flex h-screen font-sans overflow-hidden transition-all ${
        highContrast ? 'bg-[#0f172a] text-white alto-contraste' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* INJEÇÃO INTELIGENTE DE CSS PARA ALTO CONTRASTE */}
      {highContrast && (
        <style>{`
          .alto-contraste, .alto-contraste main {
            background-color: #0f172a !important;
            color: #f8fafc !important;
          }
          
          /* Cards Internos */
          .alto-contraste .conteudo-dinamico [class*="bg-"],
          .alto-contraste .conteudo-dinamico section, 
          .alto-contraste .conteudo-dinamico article,
          .alto-contraste .conteudo-dinamico table {
            background-color: #1e293b !important;
            border-color: #334155 !important;
            box-shadow: none !important;
          }
          
          .alto-contraste .conteudo-dinamico h1, .alto-contraste .conteudo-dinamico h2, 
          .alto-contraste .conteudo-dinamico h3, .alto-contraste .conteudo-dinamico h4, 
          .alto-contraste .conteudo-dinamico p, .alto-contraste .conteudo-dinamico span, 
          .alto-contraste .conteudo-dinamico label, .alto-contraste .conteudo-dinamico th, 
          .alto-contraste .conteudo-dinamico td, .alto-contraste .conteudo-dinamico strong,
          .alto-contraste .conteudo-dinamico b, .alto-contraste .conteudo-dinamico li {
            color: #ffffff !important;
          }

          /* Novos Dropdowns (Acessibilidade e Perfil) no Alto Contraste */
          .alto-contraste .menu-dropdown {
            background-color: #1e293b !important;
            border: 2px solid #334155 !important;
            box-shadow: none !important;
          }
          .alto-contraste .menu-dropdown a, .alto-contraste .menu-dropdown button,
          .alto-contraste .menu-dropdown span, .alto-contraste .menu-dropdown p {
            color: #ffffff !important;
          }
          .alto-contraste .menu-dropdown a:hover, .alto-contraste .menu-dropdown button:hover {
            background-color: #334155 !important;
          }

          /* Elementos do Header no Alto Contraste */
          .alto-contraste header button[class*="bg-white"],
          .alto-contraste header button[class*="bg-slate-100"] {
            background-color: #1e293b !important;
            border-color: #475569 !important;
            color: #ffffff !important;
          }
          .alto-contraste header button:hover {
            background-color: #334155 !important;
          }

          .alto-contraste aside p[class*="text-blue-300"] { color: #38bdf8 !important; }
          .alto-contraste aside div[class*="text-blue-400"] { color: #94a3b8 !important; }

          .alto-contraste .conteudo-dinamico input, .alto-contraste .conteudo-dinamico button, 
          .alto-contraste .conteudo-dinamico select, .alto-contraste .conteudo-dinamico textarea {
            background-color: #1e293b !important;
            color: #ffffff !important;
            border: 2px solid #475569 !important;
          }

          .alto-contraste .conteudo-dinamico option, .alto-contraste .conteudo-dinamico li {
            background-color: #1e293b !important;
            color: #ffffff !important;
          }

          .alto-contraste .conteudo-dinamico a:hover, .alto-contraste .conteudo-dinamico button:hover,
          .alto-contraste .conteudo-dinamico tr:hover, .alto-contraste .conteudo-dinamico option:hover,
          .alto-contraste .conteudo-dinamico [class*="hover:bg-"]:hover {
            background-color: #334155 !important;
            color: #ffffff !important;
          }

          .alto-contraste .bg-amber-500, .alto-contraste .bg-amber-500 * {
            background-color: #f59e0b !important;
            color: #ffffff !important;
            border-color: transparent !important;
          }
        `}</style>
      )}

      {/* OVERLAY ESCURO PARA QUANDO A BARRA LATERAL ABRIR */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* BARRA LATERAL (Agora Flutuante/Offcanvas) */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${highContrast ? 'bg-[#020617] border-r border-slate-800' : 'bg-blue-900 text-white'}`}>
        
        <div className="p-6 border-b border-blue-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl font-black text-xl shadow-lg">SIAC</div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg leading-tight">SAGI LABS</span>
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">UTFPR Curitiba</span>
            </div>
          </div>
          {/* Botão de Fechar a Barra Lateral */}
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink href={isAdmin ? "/admin/dashboard" : "/analise"} icon={isAdmin ? LayoutDashboard : Home} label={isAdmin ? "Dashboard Admin" : "Página Inicial"} activeCondition={pathname === '/admin/dashboard' || pathname === '/analise'} />
          
          <div className="pt-4 pb-2 text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Laboratório</div>
          <NavLink href="/analise/nova" icon={Microscope} label="Nova Análise" activeCondition={pathname.includes('/analise/nova')} />
          {!isAdmin && <NavLink href="/sugestoes" icon={Lightbulb} label="Sugerir Cepa" activeCondition={pathname.includes('/sugestoes')} />}

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
      </aside>

      {/* BOTÃO FLUTUANTE DE ACESSIBILIDADE */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {menuAcessibilidadeOpen && (
          <div className="menu-dropdown absolute bottom-16 right-0 mb-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex flex-col gap-3 w-52 transition-all animate-in slide-in-from-bottom-2 text-slate-900">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Acessibilidade</span>
              <button onClick={() => setMenuAcessibilidadeOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
              <button onClick={() => handleFontSizeChange('decrease')} className={`p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors ${highContrast ? 'bg-blue-600 text-black shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-100'}`}><Type size={14} /></button>
              <div className="w-px h-6 bg-slate-300"></div>
              <button onClick={() => handleFontSizeChange('increase')} className={`p-2 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors ${highContrast ? 'bg-blue-600 text-black shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-100'}`}><Type size={20} /></button>
            </div>
            <button onClick={toggleHighContrast} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-all ${highContrast ? 'bg-blue-600 text-black shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-100'}`}>
              <Eye size={18} /> {highContrast ? 'Modo Normal' : 'Alto Contraste'}
            </button>
          </div>
        )}
        <button onClick={() => setMenuAcessibilidadeOpen(!menuAcessibilidadeOpen)} className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${menuAcessibilidadeOpen ? 'bg-blue-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          <Accessibility size={28} />
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (Agora Ocupa 100% da Tela) */}
      <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
        
        <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-center gap-3 z-[40] shadow-md shrink-0">
          <AlertTriangle size={16} className="animate-pulse" />
          <p className="text-[11px] font-bold uppercase tracking-wider">
            Suporte à Decisão Educacional: Ferramenta acadêmica, não substitui diagnóstico clínico oficial.
          </p>
        </div>

        {/* HEADER ATUALIZADO */}
        <header className={`px-6 md:px-10 py-5 border-b flex justify-between items-center sticky top-0 z-50 shadow-sm backdrop-blur-md transition-colors ${highContrast ? 'bg-[#0f172a]/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
          
          <div className="flex items-center gap-5">
            {/* Botão de Abrir o Menu Lateral */}
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors shadow-sm"
              title="Abrir Menu"
            >
              <Menu size={22} />
            </button>
            
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black tracking-tight">{getTituloPagina()}</h1>
              <p className={`text-sm font-medium mt-0.5 ${highContrast ? 'text-slate-400' : 'text-slate-500'}`}>
                {isAdmin ? "Monitorando o laboratório." : "Bem-vindo(a) à pesquisa."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-bold shadow-inner transition-colors ${highContrast ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <Calendar size={18} className="text-blue-600" />
              <span className="capitalize">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* SEÇÃO DE PERFIL COM DROPDOWN NO CANTO SUPERIOR DIREITO */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                className={`flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all shadow-sm ${highContrast ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <div className="h-9 w-9 rounded-full bg-blue-700 flex items-center justify-center font-black text-white text-sm shadow-inner shrink-0">
                  {usuario.nome.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <p className={`text-sm font-bold leading-none ${highContrast ? 'text-white' : 'text-slate-700'}`}>
                    Olá, {primeiroNome}
                  </p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">{usuario.regra}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </button>

              {/* Dropdown do Perfil */}
              {profileOpen && (
                <div className="menu-dropdown absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1 md:hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{usuario.nome}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase">{usuario.regra}</p>
                  </div>
                  <Link 
                    href="/perfil" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition-colors"
                  >
                    <User size={16} className="text-blue-500" />
                    Meu Perfil
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 p-2.5 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-bold text-slate-700 transition-colors w-full text-left"
                  >
                    <LogOut size={16} className="text-rose-500" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* CONTEÚDO DINÂMICO DAS PÁGINAS */}
        <div className="p-4 md:p-8 flex-1 conteudo-dinamico">{children}</div>
      </main>
    </div>
  );
}