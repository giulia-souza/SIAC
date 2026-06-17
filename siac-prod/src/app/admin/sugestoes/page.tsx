'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Microscope,
  FileEdit,
  User,
  Loader2
} from 'lucide-react';

interface Sugestao {
  id: number;
  tipo_sugestao: string;
  nome_bacteria: string;
  dados_propostos: string;
  status: string;
  autor_nome: string;
  data_envio: string;
}

export default function ModeracaoPage() {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  useEffect(() => {
    carregarSugestoes();
  }, []);

  const carregarSugestoes = async () => {
    try {
      const res = await fetch('/api/sugestoes?status=PENDENTE');
      if (res.ok) {
        const data = await res.json();
        setSugestoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    } finally {
      setCarregando(false);
    }
  };

  const atualizarStatus = async (id: number, novoStatus: string) => {
    try {
      setProcessandoId(id);
      
      const res = await fetch('/api/sugestoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: novoStatus })
      });

      if (res.ok) {
        setSugestoes(sugestoes.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao processar a sugestão.');
    } finally {
      setProcessandoId(null);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderizarDadosPropostos = (dadosJson: string) => {
    try {
      const dados = JSON.parse(dadosJson);
      
      const observacoes = dados.observacoes;
      delete dados.observacoes;

      return (
        <div className="mt-5">
          <div className="flex flex-wrap gap-3">
            {Object.entries(dados).map(([key, value]) => {
              const nomeBonito = key.replace(/_/g, ' ').toUpperCase();
              
              return (
                <div key={key} className="bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-100 flex gap-2 items-center shadow-sm">
                  <span className="font-black text-slate-700">{nomeBonito}:</span>
                  <span className="text-slate-500">{String(value)}</span>
                </div>
              );
            })}
          </div>

          {observacoes && (
            <div className="mt-6 p-5 bg-amber-50/50 border border-amber-100 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl"></div>
              <span className="font-black text-amber-700/60 block text-[10px] uppercase tracking-widest mb-2 ml-2">
                OBSERVAÇÕES DO ALUNO
              </span>
              <p className="text-amber-900 text-sm md:text-base font-medium italic ml-2 whitespace-pre-wrap leading-relaxed">
                "{observacoes}"
              </p>
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <div className="mt-5 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
          <AlertCircle size={20} /> Erro na formatação dos dados recebidos.
        </div>
      );
    }
  };

  return (
    <MainLayout>
      {/* Container horizontalmente expandido */}
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pb-24 pt-4">
        
        <div className="mb-10 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-blue-200">
              <ShieldCheck size={10} /> Central de Curadoria
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Moderação de <span className="text-blue-600">Dados</span>
            </h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              Avalie as sugestões enviadas. Aprove dados confiáveis para integrarem a base oficial do SIAC.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-4 shadow-sm shrink-0">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="text-lg">{sugestoes.length}</span> Pendentes
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 w-full">
            <Loader2 size={48} className="animate-spin mb-6 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Buscando sugestões pendentes...</p>
          </div>
        ) : sugestoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 text-center px-4 w-full">
            <CheckCircle2 size={64} className="text-blue-400/50 mb-5" />
            <h3 className="text-2xl font-black text-slate-600 mb-3">Caixa de Entrada Limpa</h3>
            <p className="text-base font-medium text-slate-400 max-w-lg mx-auto">
              Não há nenhuma sugestão de aluno pendente de revisão neste momento.
            </p>
          </div>
        ) : (
          <div className="space-y-8 w-full">
            {sugestoes.map((sugestao) => (
              <div key={sugestao.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1 w-full">
                
                {/* LADO ESQUERDO: METADADOS (Agora mais espaçoso) */}
                <div className="bg-slate-50/50 lg:w-1/3 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between relative">
                  
                  <div className={`absolute left-0 top-10 bottom-10 w-1.5 rounded-r-xl opacity-50 ${sugestao.tipo_sugestao === 'NOVA_BACTERIA' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                  <div>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6 border ${
                      sugestao.tipo_sugestao === 'NOVA_BACTERIA' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {sugestao.tipo_sugestao === 'NOVA_BACTERIA' ? <Microscope size={14}/> : <FileEdit size={14}/>}
                      {sugestao.tipo_sugestao === 'NOVA_BACTERIA' ? 'Nova Cepa' : 'Correção de Dados'}
                    </span>
                    
                    <h3 className="text-3xl font-black italic text-blue-900 mb-3 leading-tight">
                      {sugestao.nome_bacteria}
                    </h3>
                  </div>

                  <div className="space-y-4 mt-10">
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="p-2 bg-slate-100 rounded-xl"><User size={16} className="text-slate-600" /></div>
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Enviado por</span>
                        <span className="text-slate-800 text-sm">{sugestao.autor_nome}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="p-2 bg-slate-100 rounded-xl"><Clock size={16} className="text-slate-600" /></div>
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Data do Envio</span>
                        <span className="text-slate-800 text-sm">{formatarData(sugestao.data_envio)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO: DADOS E AÇÕES (Mais preenchimento e espaço) */}
                <div className="lg:w-2/3 p-8 md:p-10 flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                      Dados Propostos pelo Aluno
                      <div className="h-px bg-slate-100 flex-1 ml-3"></div>
                    </h4>
                    {renderizarDadosPropostos(sugestao.dados_propostos)}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 mt-10 pt-8 border-t border-slate-100">
                    <button
                      onClick={() => atualizarStatus(sugestao.id, 'APROVADA')}
                      disabled={processandoId === sugestao.id}
                      className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-4.5 px-8 rounded-2xl shadow-xl shadow-blue-200/50 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processandoId === sugestao.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Aprovar Publicação
                    </button>
                    
                    <button
                      onClick={() => atualizarStatus(sugestao.id, 'REJEITADA')}
                      disabled={processandoId === sugestao.id}
                      className="w-full sm:w-auto sm:flex-none bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-black uppercase tracking-widest text-xs py-4.5 px-10 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      Rejeitar
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}