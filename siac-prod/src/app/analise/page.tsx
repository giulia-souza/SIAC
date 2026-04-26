'use client';

import { useEffect, useState, useMemo } from 'react';
import Cookies from 'js-cookie';
import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { 
  Users, 
  Microscope, 
  Activity, 
  History,
  Loader2,
  AlertCircle,
  Trophy,
  PlusCircle,
  Lightbulb,
  ArrowRight
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

export default function StudentDashboard() {
  const [logs, setLogs] = useState<LogAnalise[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [usuarioAtual, setUsuarioAtual] = useState<{nome: string, regra: string} | null>(null);

  useEffect(() => {
    const session = Cookies.get('siac_session');
    if (session) {
      const user = JSON.parse(session);
      setUsuarioAtual(user);
      carregarDadosPessoais(user.nome);
    }
  }, []);

  async function carregarDadosPessoais(nome: string) {
    try {
      const res = await fetch(`/api/historico?usuario=${nome}&regra=ESTUDANTE`);
      
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
    } finally {
      setCarregando(false);
    }
  }

  const metricasPessoais = useMemo(() => {
    if (logs.length === 0) return [];

    const totalAnalises = logs.length;
    const especiesDiferentes = new Set(logs.map(log => log.bacteria?.nome_cientifico)).size;

    const contagem: Record<string, number> = {};
    let favorita = 'N/A';
    let max = 0;
    logs.forEach(log => {
      const nome = log.bacteria?.nome_cientifico;
      if (nome) {
        contagem[nome] = (contagem[nome] || 0) + 1;
        if (contagem[nome] > max) {
          max = contagem[nome];
          favorita = nome;
        }
      }
    });

    return [
      { label: 'Minhas Análises', valor: totalAnalises.toString(), icon: <Microscope size={18} />, cor: 'bg-blue-50 text-blue-600 border-blue-100' },
      { label: 'Espécies Vistas', valor: especiesDiferentes.toString(), icon: <Activity size={18} />, cor: 'bg-purple-50 text-purple-600 border-purple-100' },
      { label: 'Cepa mais Comum', valor: favorita, icon: <Trophy size={18} />, cor: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-transparent', destaque: true },
    ];
  }, [logs]);

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-10 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Olá, <span className="text-blue-600">{usuarioAtual?.nome.split(' ')[0]}!</span>
            </h1>
            <p className="text-slate-500 mt-1 text-lg font-medium">
              Pronta para mais um dia de descobertas no laboratório?
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/analise/nova" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-2">
              <PlusCircle size={16} /> Nova Análise
            </Link>
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Sincronizando seu diário...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metricasPessoais.length > 0 ? (
                metricasPessoais.map((item, index) => (
                  <div key={index} className={`p-6 rounded-[2rem] shadow-xl transition-all duration-300 flex flex-col justify-center gap-4 ${
                    item.destaque 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-200/50' 
                      : 'bg-white border border-slate-100 shadow-slate-200/40 text-slate-800'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${item.cor} shadow-sm`}>
                        {item.icon}
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${item.destaque ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.label}
                      </p>
                    </div>
                    <p className={`font-black tracking-tight ${item.destaque ? 'text-lg italic line-clamp-1' : 'text-4xl'}`}>
                      {item.valor}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-blue-50 border border-blue-100 p-8 rounded-[2rem] text-center">
                  <p className="text-blue-700 font-bold">Você ainda não realizou nenhuma análise. Que tal começar agora?</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/analise/nova" className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Microscope size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Identificar Cepa</h3>
                    <p className="text-slate-500 text-sm font-medium">Cruze dados para descobrir a espécie.</p>
                  </div>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </Link>

              <Link href="/sugestoes" className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Lightbulb size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Sugerir Nova</h3>
                    <p className="text-slate-500 text-sm font-medium">Contribua com a base de dados.</p>
                  </div>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-2 transition-all" />
              </Link>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <History size={18} />
                  </div>
                  Minhas Últimas Identificações
                </h3>
                <Link href="/historico" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                  Ver histórico completo
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                {logs.length === 0 ? (
                  <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                    <AlertCircle size={48} className="text-slate-200 mb-4" />
                    <p className="font-bold text-sm text-slate-500">Seu diário está vazio.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Espécie</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data e Hora</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Gram</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {logs.slice(0, 5).map((analise) => (
                        <tr key={analise.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 font-bold italic text-blue-900">
                            {analise.bacteria?.nome_cientifico}
                          </td>
                          <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                            {formatarData(analise.data_pesquisa)}
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={`inline-block px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              analise.bacteria?.gram?.toLowerCase() === 'positiva' 
                                ? 'bg-blue-50 text-blue-700 border-blue-100/50' 
                                : 'bg-rose-50 text-rose-700 border-rose-100/50'
                            }`}>
                              Gram {analise.bacteria?.gram}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </MainLayout>
  );
}