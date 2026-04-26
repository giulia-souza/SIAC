'use client';

import { useEffect, useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Users, 
  Microscope, 
  Activity, 
  CalendarDays,
  Loader2,
  AlertCircle,
  Trophy,
  LayoutDashboard
} from 'lucide-react';

interface LogAnalise {
  id: number;
  nome_usuario: string;
  data_pesquisa: string;
  bacteria: {
    nome_cientifico: string;
    gram: string;
  };
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState<LogAnalise[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const res = await fetch('/api/historico?regra=PROFESSOR');
        
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const metricasProcessadas = useMemo(() => {
    if (logs.length === 0) return [];

    const totalAnalises = logs.length;
    const alunosUnicos = new Set(logs.map(log => log.nome_usuario)).size;
    const bacteriasUnicas = new Set(logs.map(log => log.bacteria?.nome_cientifico)).size;

    const hoje = new Date().toLocaleDateString('pt-BR');
    const analisesHoje = logs.filter(
      log => new Date(log.data_pesquisa).toLocaleDateString('pt-BR') === hoje
    ).length;

    const contagemBacterias: Record<string, number> = {};
    let bacteriaMaisFrequente = 'N/A';
    let maxContagem = 0;

    logs.forEach(log => {
      const nome = log.bacteria?.nome_cientifico;
      if (nome) {
        contagemBacterias[nome] = (contagemBacterias[nome] || 0) + 1;
        if (contagemBacterias[nome] > maxContagem) {
          maxContagem = contagemBacterias[nome];
          bacteriaMaisFrequente = nome;
        }
      }
    });

    return [
      { label: 'Total de Análises', valor: totalAnalises.toString(), icon: <Microscope size={18} />, cor: 'bg-blue-50 text-blue-600 border-blue-100' },
      { label: 'Alunos Ativos', valor: alunosUnicos.toString(), icon: <Users size={18} />, cor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      { label: 'Espécies Diferentes', valor: bacteriasUnicas.toString(), icon: <Activity size={18} />, cor: 'bg-purple-50 text-purple-600 border-purple-100' },
      { label: 'Análises Hoje', valor: analisesHoje.toString(), icon: <CalendarDays size={18} />, cor: 'bg-amber-50 text-amber-600 border-amber-100' },
      { label: 'Mais Frequente', valor: bacteriaMaisFrequente, icon: <Trophy size={18} />, cor: 'bg-white/20 text-white border-white/20', destaque: true },
    ];
  }, [logs]);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm">
              <LayoutDashboard size={10} /> Visão Geral
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Painel de <span className="text-blue-600">Controle</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Métricas e atividades de laboratório em tempo real.
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Processando métricas...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              {metricasProcessadas.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-[1.5rem] shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center gap-4 ${
                    item.destaque 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-transparent shadow-blue-200/50 text-white' 
                      : 'bg-white border border-slate-100 shadow-slate-200/40 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${item.cor} shadow-sm`}>
                      {item.icon}
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${item.destaque ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.label}
                    </p>
                  </div>
                  
                  <p className={`font-black tracking-tight ${
                    item.destaque ? 'text-lg italic leading-tight break-words line-clamp-2' : 'text-4xl'
                  }`}>
                    {item.valor}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Activity size={18} />
                  </div>
                  Últimas Identificações
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                {logs.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                    <AlertCircle size={48} className="text-slate-200 mb-4" />
                    <p className="font-bold text-sm text-slate-500">Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estudante</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Espécie Identificada</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data & Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {logs.slice(0, 10).map((analise) => (
                        <tr key={analise.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-xs uppercase border border-slate-200 shrink-0">
                                {analise.nome_usuario.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-700 text-sm">{analise.nome_usuario}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-bold italic text-blue-900">
                            {analise.bacteria?.nome_cientifico || 'Cepa Desconhecida'}
                          </td>
                          <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                            {formatarData(analise.data_pesquisa)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {logs.length > 10 && (
                <div className="bg-slate-50 p-5 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Mostrando as <span className="text-blue-600 font-black">10</span> mais recentes de um total de <span className="text-blue-600 font-black">{logs.length}</span>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </MainLayout>
  );
}