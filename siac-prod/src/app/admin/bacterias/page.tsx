'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Database, 
  Trash2, 
  Search, 
  Loader2,
  AlertCircle,
  Microscope
} from 'lucide-react';

interface Bacteria {
  id_bacteria?: number;
  id?: number;
  nome_cientifico?: string;
  nome?: string;
  gram?: string;
  morfologia_celular?: string;
  fonte?: string;
}

export default function GestaoBacteriasPage() {
  const [bacterias, setBacterias] = useState<Bacteria[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [apagandoId, setApagandoId] = useState<number | null>(null);

  useEffect(() => {
    carregarBacterias();
  }, []);

  const carregarBacterias = async () => {
    try {
      const res = await fetch('/api/bacterias');
      if (res.ok) {
        const data = await res.json();
        setBacterias(data);
      }
    } catch (error) {
      console.error('Erro ao carregar bactérias:', error);
    } finally {
      setCarregando(false);
    }
  };

  const apagarBacteria = async (id: number, nome: string) => {
    const confirmacao = window.confirm(
      `ATENÇÃO: Tem a certeza que deseja APAGAR a cepa "${nome}" do banco oficial?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmacao) return;

    try {
      setApagandoId(id);
      const res = await fetch(`/api/bacterias?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBacterias(bacterias.filter(b => (b.id_bacteria || b.id) !== id));
      } else {
        alert('Erro ao apagar bactéria. Verifique os logs.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Falha na comunicação com o servidor.');
    } finally {
      setApagandoId(null);
    }
  };

  const bacteriasFiltradas = bacterias.filter(b => {
    const nomeDaBacteria = b.nome_cientifico || b.nome || '';
    return nomeDaBacteria.toLowerCase().includes(busca.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-blue-200">
              <Database size={10} /> Base Oficial
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Gestão de <span className="text-blue-600">Microrganismos</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Gerencie as cepas catalogadas no sistema SIAC.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Pesquisar cepa..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-semibold shadow-sm hover:border-slate-300 placeholder:text-slate-400"
            />
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Carregando banco de dados...</p>
          </div>
        ) : (

          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nome Científico</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Origem / Fonte</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bacteriasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                        <AlertCircle size={40} className="mx-auto mb-3 text-slate-200" />
                        <span className="block text-sm font-bold text-slate-500">Nenhuma bactéria encontrada.</span>
                        <span className="text-xs opacity-70">Tente buscar por outro termo.</span>
                      </td>
                    </tr>
                  ) : (
                    bacteriasFiltradas.map((bact, index) => {
                      const idReal = bact.id_bacteria || bact.id || index;
                      const nomeReal = bact.nome_cientifico || bact.nome || 'Cepa Desconhecida';

                      return (
                        <tr key={idReal} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5 text-xs font-black text-slate-300">
                            #{idReal}
                          </td>
                          <td className="px-6 py-5 font-bold text-blue-900 italic flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-white transition-colors">
                              <Microscope size={16} />
                            </div>
                            {nomeReal}
                          </td>
                          <td className="px-6 py-5 text-xs font-semibold text-slate-500 max-w-[200px] truncate" title={bact.fonte || 'Sem fonte'}>
                            {bact.fonte ? (
                              <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">{bact.fonte}</span>
                            ) : (
                              <span className="text-slate-300 italic tracking-wide">Não informada</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => apagarBacteria(idReal, nomeReal)}
                              disabled={apagandoId === idReal}
                              className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50 active:scale-95"
                              title="Remover Bactéria"
                            >
                              {apagandoId === idReal ? (
                                <Loader2 size={18} className="animate-spin text-rose-500" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-50 p-5 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              A base oficial possui <span className="text-blue-600 font-black">{bacterias.length}</span> cepas registradas
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}