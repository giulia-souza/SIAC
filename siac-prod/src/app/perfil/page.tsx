'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import MainLayout from '@/components/MainLayout';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  KeyRound, 
  Loader2,
  CalendarDays
} from 'lucide-react';

interface UsuarioPerfil {
  nome: string;
  email: string;
  regra: 'ADMINISTRADOR' | 'PROFESSOR' | 'ESTUDANTE';
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [atualizandoSenha, setAtualizandoSenha] = useState(false);
  const [status, setStatus] = useState<{ type: 'sucesso' | 'erro' | null, mensagem: string }>({
    type: null,
    mensagem: ''
  });

  useEffect(() => {
    const session = Cookies.get('siac_session');
    
    if (session) {
      try {
        const dados = JSON.parse(session);
        setUsuario({
          nome: dados.nome,
          regra: dados.regra,
          email: dados.email || `${dados.nome.toLowerCase().replace(/\s+/g, '.')}@utfpr.edu.br`
        });
      } catch (error) {
        console.error("Erro ao ler sessão:", error);
      }
    }
    
    setTimeout(() => setCarregando(false), 600);
  }, []);

  const handleAtualizarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      setStatus({ type: 'erro', mensagem: 'As novas senhas não coincidem.' });
      return;
    }

    if (novaSenha.length < 6) {
      setStatus({ type: 'erro', mensagem: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setAtualizandoSenha(true);
    setStatus({ type: null, mensagem: '' });

    try {
      const response = await fetch('/api/usuario/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: usuario?.email, 
          senhaAtual, 
          novaSenha 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'sucesso', mensagem: 'Senha atualizada com sucesso!' });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
      } else {
        setStatus({ type: 'erro', mensagem: data.error || 'Erro ao atualizar a senha. Verifique sua senha atual.' });
      }
    } catch (error) {
      setStatus({ type: 'erro', mensagem: 'Erro de conexão com o servidor.' });
    } finally {
      setAtualizandoSenha(false);
    }
  };

  const getCorCargo = (regra: string) => {
    switch (regra) {
      case 'ADMINISTRADOR': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'PROFESSOR': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm">
              <User size={10} /> Conta
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Meu <span className="text-blue-600">Perfil</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Gerencie suas informações pessoais e de segurança.
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Carregando dados...</p>
          </div>
        ) : usuario ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            
            <div className="lg:col-span-1 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
              
              <div className="w-32 h-32 rounded-full bg-slate-50 border-4 border-white shadow-xl shadow-slate-200 flex items-center justify-center font-black text-5xl text-slate-300 uppercase mb-6 relative">
                {usuario.nome.charAt(0)}
                <div className={`absolute bottom-0 right-0 p-2 rounded-full border-4 border-white shadow-sm ${
                  usuario.regra === 'ESTUDANTE' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <ShieldCheck size={18} />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {usuario.nome}
              </h2>
              
              <span className={`mt-3 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getCorCargo(usuario.regra)}`}>
                {usuario.regra}
              </span>

              <div className="w-full mt-8 pt-6 border-t border-slate-100 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Mail size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">E-mail</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{usuario.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Membro desde</p>
                    <p className="text-sm font-bold text-slate-700">2026</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={18} /></div>
                  <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Dados Pessoais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      value={usuario.nome} 
                      disabled 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 outline-none text-sm font-bold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">E-mail Institucional</label>
                    <input 
                      type="email" 
                      value={usuario.email} 
                      disabled 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-4 py-3 outline-none text-sm font-bold cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-4 italic">
                  * Alterações de nome e e-mail devem ser solicitadas à coordenação.
                </p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                   <KeyRound size={120} />
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6 relative z-10">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><KeyRound size={18} /></div>
                  <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Segurança</h2>
                </div>

                <form className="space-y-5 relative z-10" onSubmit={handleAtualizarSenha}>
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Senha Atual</label>
                    <input 
                      type="password" 
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Nova Senha</label>
                      <input 
                        type="password" 
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Nova senha secreta"
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Confirmar Nova Senha</label>
                      <input 
                        type="password" 
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm"
                      />
                    </div>
                  </div>

                  {status.mensagem && (
                    <div className={`mt-2 p-4 rounded-xl text-sm font-bold border ${
                      status.type === 'sucesso' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {status.mensagem}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-50 flex justify-end">
                    <button 
                      type="submit"
                      disabled={!senhaAtual || !novaSenha || novaSenha !== confirmarSenha || atualizandoSenha}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black uppercase tracking-widest text-[10px] py-3.5 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {atualizandoSenha ? (
                        <><Loader2 size={16} className="animate-spin" /> Atualizando...</>
                      ) : (
                        'Atualizar Senha'
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 py-10 font-bold">Erro ao carregar perfil.</div>
        )}
      </div>
    </MainLayout>
  );
}