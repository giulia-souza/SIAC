'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import MainLayout from '@/components/MainLayout';
import { History, Microscope, Calendar, Clock, User, AlertCircle, Loader2 } from 'lucide-react';

interface Caracteristica {
  categoria: string;
  caracteristica: string;
  valor: string;
}

interface LogAnalise {
  id: number;
  id_bacteria: number;
  nome_usuario: string;
  regra_usuario: string;
  data_pesquisa: string;
  bacteria: {
    nome_cientifico: string;
    gram: string;
    morfologia_celular: string;
    arranjo: string;
    caracteristicas: Caracteristica[];
  };
}

export default function HistoricoPage() {
  const [logs, setLogs] = useState<LogAnalise[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [usuarioAtual, setUsuarioAtual] = useState<{nome: string, regra: string} | null>(null);

  useEffect(() => {
    async function carregarHistorico() {
      try {
        const session = Cookies.get('siac_session');
        if (!session) return;
        
        const usuario = JSON.parse(session);
        setUsuarioAtual(usuario);

        const res = await fetch(`/api/historico?usuario=${usuario.nome}&regra=${usuario.regra}`);
        
        if (!res.ok) {
          throw new Error('Falha ao carregar API de Histórico');
        }

        const data = await res.json();
        
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setCarregando(false);
      }
    }

    carregarHistorico();
  }, []);

  const formatarDataHora = (dataString: string) => {
    const data = new Date(dataString);
    return {
      dia: data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isProfessor = usuarioAtual?.regra === 'PROFESSOR' || usuarioAtual?.regra === 'ADMINISTRADOR';

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm">
              <History size={10} /> Histórico
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Histórico de <span className="text-blue-600">Identificações</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              {isProfessor 
                ? 'Registro geral de todas as cepas identificadas pelos alunos no laboratório.' 
                : 'Acompanhe todas as bactérias que você identificou com sucesso.'}
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-sm shrink-0">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Microscope size={16} />
            </div>
            {logs.length} Registros
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Carregando histórico...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center px-4">
            <AlertCircle size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-600 mb-2">Nenhum registro encontrado</h3>
            <p className="text-sm font-medium text-slate-400">
              {isProfessor 
                ? 'Ainda não foram realizadas identificações no sistema.'
                : 'Você ainda não confirmou nenhuma identificação de bactéria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => {
              const dataFormatada = formatarDataHora(log.data_pesquisa);
              
              return (
                <div key={log.id} className="bg-white rounded-[2rem] p-6 md:p-8 border-t border-r border-b border-l-4 border-slate-100 shadow-sm hover:shadow-md hover:border-l-blue-500 transition-colors duration-300 flex flex-col h-full overflow-hidden">
                  
                  <div className="flex-1">
                    {isProfessor && (
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 bg-slate-50 inline-flex px-3 py-1.5 rounded-xl border border-slate-100">
                        <User size={12} className="text-blue-500" />
                        Aluno: <span className="text-slate-600">{log.nome_usuario}</span>
                      </div>
                    )}

                    <h3 className="text-2xl font-black italic text-slate-800 mb-4">
                      {log.bacteria.nome_cientifico}
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-50 pb-5">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
                        Gram {log.bacteria.gram}
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                        {log.bacteria.morfologia_celular}
                      </span>
                      {log.bacteria.arranjo && (
                        <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-purple-100/50">
                          {log.bacteria.arranjo}
                        </span>
                      )}
                    </div>

                    {log.bacteria.caracteristicas && log.bacteria.caracteristicas.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">
                          Dados Fenotípicos & Bioquímicos
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-2">
                          {log.bacteria.caracteristicas.map((c, idx) => (
                            <div key={idx} className="bg-slate-50 text-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-100 flex gap-1.5 items-center">
                              <span className="font-black text-slate-700 capitalize">{c.caracteristica}:</span>
                              <span>{c.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-5 mt-auto border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-300" />
                      {dataFormatada.dia}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-300" />
                      {dataFormatada.hora}
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}