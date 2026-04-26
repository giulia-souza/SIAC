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
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(dados).map(([key, value]) => {
              const nomeBonito = key.replace(/_/g, ' ').toUpperCase();
              
              return (
                <div key={key} className="bg-slate-50 text-slate-600 px-3 py-2 rounded-xl text-xs font-medium border border-slate-100 flex gap-1.5 items-center shadow-sm">
                  <span className="font-black text-slate-700">{nomeBonito}:</span>
                  <span className="text-slate-500">{String(value)}</span>
                </div>
              );
            })}
          </div>

          {observacoes && (
            <div className="mt-5 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400 rounded-l-2xl"></div>
              <span className="font-black text-amber-700/60 block text-[9px] uppercase tracking-widest mb-1.5 ml-2">
                OBSERVAÇÕES DO ALUNO
              </span>
              <p className="text-amber-900 text-sm font-medium italic ml-2 whitespace-pre-wrap leading-relaxed">
                "{observacoes}"
              </p>
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-600 text-sm font-bold">
          <AlertCircle size={16} /> Erro na formatação dos dados recebidos.
        </div>
      );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-lg shadow-blue-200">
              <ShieldCheck size={10} /> Central de Curadoria
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Moderação de <span className="text-blue-600">Dados</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Avalie as sugestões enviadas. Aprove dados confiáveis para integrarem a base oficial do SIAC.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-sm shrink-0">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={16} />
            </div>
            {sugestoes.length} Pendentes
          </div>
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60">
            <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Buscando sugestões pendentes...</p>
          </div>
        ) : sugestoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/60 text-center px-4">
            <CheckCircle2 size={56} className="text-blue-400/50 mb-4" />
            <h3 className="text-xl font-black text-slate-600 mb-2">Caixa de Entrada Limpa</h3>
            <p className="text-sm font-medium text-slate-400 max-w-md mx-auto">
              Excelente trabalho! Não há nenhuma sugestão de aluno pendente de revisão neste momento.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sugestoes.map((sugestao) => (
              <div key={sugestao.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-2xl hover:shadow-blue-200/40 hover:-translate-y-1">
                
                <div className="bg-slate-50/50 md:w-1/3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between relative">
                  
                  <div className={`absolute left-0 top-8 bottom-8 w-1.5 rounded-r-xl opacity-50 ${sugestao.tipo_sugestao === 'NOVA_BACTERIA' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest mb-5 border ${
                      sugestao.tipo_sugestao === 'NOVA_BACTERIA' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {sugestao.tipo_sugestao === 'NOVA_BACTERIA' ? <Microscope size={12}/> : <FileEdit size={12}/>}
                      {sugestao.tipo_sugestao === 'NOVA_BACTERIA' ? 'Nova Cepa' : 'Correção de Dados'}
                    </span>
                    
                    <h3 className="text-2xl font-black italic text-blue-900 mb-2 leading-tight">
                      {sugestao.nome_bacteria}
                    </h3>
                  </div>

                  <div className="space-y-3 mt-8">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <div className="p-1.5 bg-slate-100 rounded-lg"><User size={14} className="text-slate-600" /></div>
                      <div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Enviado por</span>
                        <span className="text-slate-800">{sugestao.autor_nome}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <div className="p-1.5 bg-slate-100 rounded-lg"><Clock size={14} className="text-slate-600" /></div>
                      <div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Data do Envio</span>
                        <span className="text-slate-800">{formatarData(sugestao.data_envio)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      Dados Propostos pelo Aluno
                      <div className="h-px bg-slate-100 flex-1 ml-2"></div>
                    </h4>
                    {renderizarDadosPropostos(sugestao.dados_propostos)}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={() => atualizarStatus(sugestao.id, 'APROVADA')}
                      disabled={processandoId === sugestao.id}
                      className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-4 px-6 rounded-2xl shadow-xl shadow-blue-200/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {processandoId === sugestao.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      Aprovar Publicação
                    </button>
                    
                    <button
                      onClick={() => atualizarStatus(sugestao.id, 'REJEITADA')}
                      disabled={processandoId === sugestao.id}
                      className="w-full sm:w-auto sm:flex-none bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle size={16} />
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