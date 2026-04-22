'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  UserCog, 
  Trash2, 
  Mail, 
  Loader2, 
  Search,
  UserPlus,
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

  // CORES DAS BADGES
  const getBadgeColor = (regra: string) => {
    switch (regra) {
      case 'ADMINISTRADOR': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PROFESSOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // CORES DO TEXTO DO SELECT
  const getSelectColor = (regra: string) => {
    switch (regra) {
      case 'ADMINISTRADOR': return 'text-amber-700 border-amber-200 bg-amber-50/50 hover:border-amber-300 focus:ring-amber-400';
      case 'PROFESSOR': return 'text-blue-700 border-blue-200 bg-blue-50/50 hover:border-blue-300 focus:ring-blue-400';
      default: return 'text-slate-700 border-slate-200 bg-slate-50/50 hover:border-slate-300 focus:ring-slate-400';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4">
        
        {/* Header */}
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <UserCog size={24} />
              </div>
              Gestão de Utilizadores
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Controle de permissões.</p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-600">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Buscar pesquisador..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition shadow-sm text-gray-700"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-20 text-blue-600">
            <Loader2 size={48} className="animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Usuário</th>
                    <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Ações de Nível e Exclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usuariosFiltrados.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/10 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md uppercase">
                            {user.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg tracking-tight">{user.nome}</p>
                            <p className="text-sm text-gray-400 flex items-center gap-1 font-medium italic">
                              <Mail size={12} className="text-gray-400" /> {user.email}
                            </p>
                            <span className={`inline-block mt-1 px-3 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getBadgeColor(user.regra)}`}>
                              {user.regra}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-4">
                          
                          {/* SELECT COM CORES DINÂMICAS */}
                          <div className="relative">
                            <select 
                              value={user.regra}
                              disabled={acaoId === user.id}
                              onChange={(e) => handleAlterarRegra(user.email, user.id, e.target.value)}
                              className={`appearance-none border py-2 pl-4 pr-10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 cursor-pointer disabled:opacity-50 transition-all ${getSelectColor(user.regra)}`}
                            >
                              <option value="ESTUDANTE" className="text-slate-700 bg-white">ESTUDANTE</option>
                              <option value="PROFESSOR" className="text-blue-700 bg-white">PROFESSOR</option>
                              <option value="ADMINISTRADOR" className="text-amber-700 bg-white">ADMINISTRADOR</option>
                            </select>
                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${
                              user.regra === 'ADMINISTRADOR' ? 'text-amber-500' : 
                              user.regra === 'PROFESSOR' ? 'text-blue-500' : 'text-slate-500'
                            }`}>
                              {acaoId === user.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                            </div>
                          </div>

                          <button 
                            onClick={() => handleExcluir(user.email, user.id)}
                            disabled={acaoId === user.id}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                            title="Remover Acesso"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}