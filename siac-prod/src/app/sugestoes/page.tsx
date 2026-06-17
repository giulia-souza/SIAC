'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import MainLayout from '@/components/MainLayout';
import { 
  Send, Microscope, TestTube2,
  CheckCircle2, Loader2, Layers, Beaker, AlertCircle
} from 'lucide-react';

export default function SugestoesPage() {
  const [usuarioAtual, setUsuarioAtual] = useState<{nome: string, regra: string} | null>(null);
  
  const [formData, setFormData] = useState<Record<string, string>>({
    tipo_sugestao: 'NOVA_BACTERIA',
    nome_bacteria: '',
    observacoes_bioquimicas: ''
  });

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [campoErro, setCampoErro] = useState('');

  useEffect(() => {
    const session = Cookies.get('siac_session');
    if (session) setUsuarioAtual(JSON.parse(session));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_bacteria || formData.nome_bacteria.trim() === '') {
      setCampoErro('nome_bacteria');
      setErro('Campos obrigatórios não preenchidos.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCampoErro('');
    setEnviando(true);
    setErro('');
    setSucesso(false);

    try {
      const { tipo_sugestao, nome_bacteria, observacoes_bioquimicas, ...caracteristicas } = formData;
      const dadosLimpados: Record<string, string> = {};
      
      Object.entries(caracteristicas).forEach(([key, value]) => {
        if (value && value.trim() !== '') dadosLimpados[key] = value;
      });

      if (observacoes_bioquimicas) dadosLimpados.observacoes = observacoes_bioquimicas;

      const res = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_sugestao,
          nome_bacteria,
          dados_propostos: dadosLimpados,
          autor_nome: usuarioAtual?.nome || 'Aluno Anônimo',
          autor_regra: usuarioAtual?.regra || 'ALUNO'
        })
      });

      if (!res.ok) throw new Error('Falha ao enviar');

      setSucesso(true);
      setFormData({ tipo_sugestao: 'NOVA_BACTERIA', nome_bacteria: '', observacoes_bioquimicas: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSucesso(false), 6000);

    } catch (err) {
      setErro('Ocorreu um erro ao enviar a sugestão. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const renderSelect = (name: string, label: string, options: string[]) => (
    <div key={name} className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
        {label}
      </label>
      <select 
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="w-full bg-white border border-slate-200 text-slate-700 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold cursor-pointer shadow-sm"
      >
        <option value="">Não avaliado</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderInput = (name: string, label: string, placeholder: string, italic = false) => {
    const temErro = campoErro === name;
    return (
      <div key={name} className="flex flex-col gap-2 relative">
        <label className={`text-[10px] font-black uppercase tracking-[0.1em] ml-1 ${temErro ? 'text-red-500' : 'text-slate-400'}`}>
          {label}
        </label>
        <input 
          type="text" 
          name={name} 
          value={formData[name] || ''} 
          onChange={(e) => { handleChange(e); if (temErro) setCampoErro(''); }} 
          placeholder={placeholder}
          className={`w-full bg-white border text-slate-700 rounded-2xl px-5 py-4 outline-none transition-all text-sm font-semibold shadow-sm 
            ${italic ? 'italic font-bold text-blue-900' : ''} 
            ${temErro ? 'border-red-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
        />
        {temErro && (
          <span className="text-red-500 text-[10px] font-bold ml-1 animate-in fade-in slide-in-from-top-1">Preencha este campo.</span>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pb-24 pt-4">
        
        <div className="mb-12 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-blue-200">
              <Beaker size={10} /> Curadoria Científica
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Sugestão de <span className="text-blue-600">Cepa</span>
            </h1>
            <p className="text-slate-500 mt-2 text-base font-medium">
              Contribua com a base de dados do SIAC.
            </p>
          </div>
        </div>

        {sucesso && (
          <div className="mb-8 bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-in fade-in duration-300">
            <CheckCircle2 size={24} className="text-emerald-500" />
            <p className="font-bold text-sm">Sugestão enviada com sucesso!</p>
          </div>
        )}

        {erro && (
          <div className="mb-8 bg-red-50 text-red-800 p-6 rounded-2xl border border-red-100 flex items-center gap-4 animate-in fade-in duration-300">
            <AlertCircle size={24} className="text-red-500" />
            <p className="font-bold text-sm">{erro}</p>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden w-full">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              {renderSelect('tipo_sugestao', 'Tipo de Sugestão *', ['NOVA_BACTERIA'])}
              {renderInput('nome_bacteria', 'Nome da Cepa / Bactéria *', 'Ex: Staphylococcus aureus', true)}
            </div>

            {[
              { title: 'Microscopia', icon: <Microscope size={20} className="text-indigo-500" />, 
                fields: [
                  renderSelect('gram', 'Coloração de Gram', ['Positiva', 'Negativa']),
                  renderInput('morfologia', 'Morfologia Celular', 'Ex: bacilo, coco...'),
                  renderInput('arranjo', 'Arranjo Celular', 'Ex: cachos, cadeias...')
                ]
              },
              { title: 'Colônia', icon: <Layers size={20} className="text-pink-500" />, 
                fields: [
                  renderSelect('hemolise', 'Hemólise', ['beta', 'beta-discreta', 'beta-pequena', 'dupla-zona']),
                  renderInput('cor_colonia', 'Cor', 'Ex: amarela...'),
                  renderInput('pigmento', 'Pigmento', 'Ex: verde...'),
                  renderInput('textura', 'Textura', 'Ex: cremosa...'),
                  renderInput('tamanho_colonia', 'Tamanho', 'Ex: grande...'),
                  renderInput('forma', 'Forma', 'Ex: irregular...'),
                  renderInput('crescimento', 'Crescimento', 'Ex: swarming...'),
                  renderInput('odor', 'Odor', 'Ex: característico...')
                ]
              },
              { title: 'Testes Bioquímicos', icon: <TestTube2 size={20} className="text-emerald-500" />, grid: 'grid-cols-2 md:grid-cols-4',
                fields: [
                  renderSelect('catalase', 'Catalase', ['positiva', 'negativa']),
                  renderSelect('coagulase', 'Coagulase', ['positiva', 'negativa']),
                  renderSelect('oxidase', 'Oxidase', ['positiva', 'negativa']),
                  renderSelect('lactose', 'Lactose', ['positiva', 'negativa', 'variável']),
                  renderSelect('indol', 'Indol', ['positivo', 'negativo']),
                  renderSelect('citrato', 'Citrato', ['positivo', 'negativo']),
                  renderSelect('urease', 'Urease', ['positiva', 'negativa', 'forte']),
                  renderSelect('h2s', 'H2S', ['positivo', 'negativo']),
                  renderSelect('motilidade', 'Motilidade', ['positiva', 'negativa']),
                  renderSelect('fermentacao', 'Fermentação', ['fermentador', 'nao_fermentador']),
                  renderSelect('bile_esculina', 'Bile Esculina', ['positiva', 'negativa']),
                  renderSelect('nacl_6_5', 'NaCl 6.5%', ['positivo', 'negativo'])
                ]
              }
            ].map((section, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="p-2.5 bg-slate-50 rounded-xl">{section.icon}</div>
                  <h2 className="text-xs font-black text-slate-700 uppercase tracking-[0.2em]">{section.title}</h2>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 ${section.grid || ''}`}>
                  {section.fields}
                </div>
              </div>
            ))}

            <div className="pt-8 mt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-black text-sm uppercase">
                  {usuarioAtual?.nome?.charAt(0) || 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor</span>
                  <span className="text-sm font-bold text-slate-700">{usuarioAtual?.nome || 'Anônimo'}</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={enviando} 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black uppercase tracking-widest text-[11px] py-4.5 px-12 rounded-2xl shadow-xl shadow-blue-200/50 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                {enviando ? 'Submetendo...' : 'Submeter Ficha'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}