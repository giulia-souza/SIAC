'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { UserCog, Trash2, Mail, ShieldCheck } from 'lucide-react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  regra: 'ADMINISTRADOR' | 'PROFESSOR' | 'ESTUDANTE';
}

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os usuários da sua API (Crie uma rota GET /api/usuarios)
  useEffect(() => {
    fetch('/api/usuario')
      .then(res => res.json())
      .then(data => {
        setUsuarios(data);
        setLoading(false);
      });
  }, []);

  const getBadgeColor = (regra: string) => {
    switch (regra) {
      case 'ADMINISTRADOR': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PROFESSOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UserCog className="text-blue-600" /> Gestão de Utilizadores
            </h1>
            <p className="text-gray-500">Administre as permissões de acesso ao sistema SIAC.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
            + Novo Usuário
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-20 text-blue-600 animate-spin">
            <UserCog size={40} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nível de Acesso</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {user.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.nome}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={12} className="mr-1" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeColor(user.regra)}`}>
                        {user.regra}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar Permissões">
                          <ShieldCheck size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir Usuário">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}