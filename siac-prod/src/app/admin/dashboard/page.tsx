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
      { label: 'Total de Análises', valor: totalAnalises.toString(), icon: <Microscope size={20} />, cor: 'bg-blue-50 text-blue-600 border-blue-100' },
      { label: 'Alunos Ativos', valor: alunosUnicos.toString(), icon: <Users size={20} />, cor: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
      { label: 'Espécies Diferentes', valor: bacteriasUnicas.toString(), icon: <Activity size={20} />, cor: 'bg-purple-50 text-purple-600 border-purple-100' },
      { label: 'Análises Hoje', valor: analisesHoje.toString(), icon: <CalendarDays size={20} />, cor: 'bg-amber-50 text-amber-600 border-amber-100' },
      { label: 'Mais Frequente', valor: bacteriaMaisFrequente, icon: <Trophy size={20} />, cor: 'bg-white/20 text-white border-white/20', destaque: true },
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
      {/* Container Expandido para usar a tela inteira */}
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pb-24 pt-4">
        
        <div className="mb-10 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-sm">
              <LayoutDashboard size={10} /> Visão Geral
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Painel de <span className="text-blue-600">Controle</span>
            </h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              Métricas e atividades de laboratório em tempo real.
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 w-full">
            <Loader2 size={48} className="animate-spin mb-6 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Processando métricas...</p>
          </div>
        ) : (
          <div className="space-y-10 w-full">
            
            {/* GRID DE MÉTRICAS (Agora com mais respiro) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 xl:gap-8">
              {metricasProcessadas.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-8 rounded-[2rem] shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-center gap-5 ${
                    item.destaque 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 border-transparent shadow-blue-200/50 text-white' 
                      : 'bg-white border border-slate-100 shadow-slate-200/40 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-xl border ${item.cor} shadow-sm`}>
                      {item.icon}
                    </div>
                    <p className={`text-xs font-black uppercase tracking-widest leading-tight ${item.destaque ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.label}
                    </p>
                  </div>
                  
                  <p className={`font-black tracking-tight ${
                    item.destaque ? 'text-xl xl:text-2xl italic leading-tight break-words line-clamp-2' : 'text-5xl xl:text-6xl'
                  }`}>
                    {item.valor}
                  </p>
                </div>
              ))}
            </div>

            {/* TABELA DE ÚLTIMAS IDENTIFICAÇÕES */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden w-full">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-4">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                    <Activity size={20} />
                  </div>
                  Últimas Identificações
                </h3>
              </div>
              
              <div className="overflow-x-auto w-full">
                {logs.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                    <AlertCircle size={56} className="text-slate-200 mb-5" />
                    <p className="font-bold text-base text-slate-500">Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Estudante</th>
                        <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Espécie Identificada</th>
                        <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Data & Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {logs.slice(0, 10).map((analise) => (
                        <tr key={analise.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm uppercase border border-slate-200 shrink-0">
                                {analise.nome_usuario.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-700 text-base">{analise.nome_usuario}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 font-bold italic text-blue-900 text-lg">
                            {analise.bacteria?.nome_cientifico || 'Cepa Desconhecida'}
                          </td>
                          <td className="px-10 py-6 text-slate-500 font-medium text-sm">
                            {formatarData(analise.data_pesquisa)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {logs.length > 10 && (
                <div className="bg-slate-50 p-6 border-t border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
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