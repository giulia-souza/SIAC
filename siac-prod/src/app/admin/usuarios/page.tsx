'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  UserCog, 
  Trash2, 
  Mail, 
  Loader2, 
  Search,
  ShieldAlert
} from 'lucide-react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  regra: 'ADMINISTRADOR' | 'PROFESSOR' | 'ESTUDANTE';
}

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [acaoId, setAcaoId] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/usuario/user-list');
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarRegra = async (email: string, id: string, novaRegra: string) => {
    setAcaoId(id);
    try {
      const response = await fetch('/api/usuario/promote-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, promocao: novaRegra }),
      });
      
      if (response.ok) {
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, regra: novaRegra as any } : u));
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao alterar nível');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setAcaoId(null);
    }
  };

  const handleExcluir = async (email: string, id: string) => {
    if (!confirm(`Excluir permanentemente o usuário ${email}?`)) return;
    setAcaoId(id);
    try {
      const response = await fetch('/api/usuario/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setUsuarios(usuarios.filter(u => u.id !== id));
      }
    } catch (error) {
      alert('Erro ao excluir.');
    } finally {
      setAcaoId(null);
    }
  };

  const usuariosFiltrados = usuarios.filter(user => 
    user.nome.toLowerCase().includes(busca.toLowerCase()) || 
    user.email.toLowerCase().includes(busca.toLowerCase())
  );

  const getBadgeColor = (regra: string) => {
    switch (regra) {
      case 'ADMINISTRADOR': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PROFESSOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getSelectColor = (regra: string) => {
    switch (regra) {
      case 'ADMINISTRADOR': return 'text-amber-700 border-amber-200 bg-amber-50/50 hover:border-amber-300 focus:ring-amber-400';
      case 'PROFESSOR': return 'text-blue-700 border-blue-200 bg-blue-50/50 hover:border-blue-300 focus:ring-blue-400';
      default: return 'text-slate-700 border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:ring-slate-400';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-blue-200">
              <UserCog size={10} /> Controle de Acessos
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Gestão de <span className="text-blue-600">Usuários</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Controle de permissões e administração da plataforma.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="Buscar usuário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-semibold shadow-sm hover:border-slate-300 placeholder:text-slate-400"
            />
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Carregando usuários...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuário</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Ações de Nível e Exclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-12 text-center text-slate-400 font-medium">
                        <span className="block text-sm font-bold text-slate-500">Nenhum usuário encontrado.</span>
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-700 border-2 border-white flex items-center justify-center font-black text-xl shadow-sm uppercase shrink-0">
                              {user.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-[15px] tracking-tight leading-tight">{user.nome}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium italic mt-0.5">
                                <Mail size={12} className="text-slate-300" /> {user.email}
                              </p>
                              
                              <span className={`inline-block mt-2 px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-[0.1em] ${getBadgeColor(user.regra)}`}>
                                {user.regra}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end items-center gap-4">
                            
                            <div className="relative">
                              <select 
                                value={user.regra}
                                disabled={acaoId === user.id}
                                onChange={(e) => handleAlterarRegra(user.email, user.id, e.target.value)}
                                className={`appearance-none border py-2.5 pl-4 pr-10 rounded-xl text-xs font-black tracking-wide focus:outline-none focus:ring-4 cursor-pointer disabled:opacity-50 transition-all shadow-sm ${getSelectColor(user.regra)}`}
                              >
                                <option value="ESTUDANTE" className="text-slate-700 font-bold bg-white">ESTUDANTE</option>
                                <option value="PROFESSOR" className="text-blue-700 font-bold bg-white">PROFESSOR</option>
                                <option value="ADMINISTRADOR" className="text-amber-700 font-bold bg-white">ADMINISTRADOR</option>
                              </select>
                              <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${
                                user.regra === 'ADMINISTRADOR' ? 'text-amber-500' : 
                                user.regra === 'PROFESSOR' ? 'text-blue-500' : 'text-slate-400'
                              }`}>
                                {acaoId === user.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                              </div>
                            </div>

                            <button 
                              onClick={() => handleExcluir(user.email, user.id)}
                              disabled={acaoId === user.id}
                              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50 active:scale-95" 
                              title="Remover Acesso"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-5 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Total de <span className="text-blue-600 font-black">{usuarios.length}</span> usuários cadastrados
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}