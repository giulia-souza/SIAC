'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import MainLayout from '@/components/MainLayout';
import { 
  Send, Microscope, TestTube2,
  CheckCircle2, Loader2, Layers, Beaker
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

  useEffect(() => {
    const session = Cookies.get('siac_session');
    if (session) setUsuarioAtual(JSON.parse(session));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Aqui está a adição de key={name} para resolver o aviso do React!
  const renderSelect = (name: string, label: string, options: string[]) => (
    <div key={name} className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
        {label}
      </label>
      <select 
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold cursor-pointer shadow-sm"
      >
        <option value="">Não avaliado</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  // Aqui também: key={name}
  const renderInput = (name: string, label: string, placeholder: string, italic = false) => (
    <div key={name} className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">
        {label}
      </label>
      <input 
        type="text" 
        name={name} 
        value={formData[name] || ''} 
        onChange={handleChange} 
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-semibold shadow-sm ${italic ? 'italic font-bold text-blue-900' : ''}`}
      />
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 pb-20 pt-2">
        
        <div className="mb-6 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3">
              <Beaker size={10} /> Curadoria Científica
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Sugestão de <span className="text-blue-600">Cepa</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Contribua com a base de dados do SIAC.
            </p>
          </div>
        </div>

        {sucesso && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-in fade-in duration-300">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <p className="font-bold text-sm">Perfil enviado com sucesso!</p>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
              {renderSelect('tipo_sugestao', 'Tipo de Sugestão *', ['NOVA_BACTERIA'])}
              {renderInput('nome_bacteria', 'Nome da Cepa / Bactéria *', 'Ex: Staphylococcus aureus', true)}
            </div>

            {[
              { title: 'Microscopia', icon: <Microscope size={18} className="text-indigo-500" />, 
                fields: [
                  renderSelect('gram', 'Coloração de Gram', ['Positiva', 'Negativa']),
                  renderInput('morfologia', 'Morfologia Celular', 'Ex: bacilo, coco...'),
                  renderInput('arranjo', 'Arranjo Celular', 'Ex: cachos, cadeias...')
                ]
              },
              { title: 'Colônia', icon: <Layers size={18} className="text-pink-500" />, 
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
              { title: 'Testes Bioquímicos', icon: <TestTube2 size={18} className="text-emerald-500" />, grid: 'grid-cols-2 md:grid-cols-4',
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
              <div key={idx} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="p-1.5 bg-slate-50 rounded-lg">{section.icon}</div>
                  <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">{section.title}</h2>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 ${section.grid || ''}`}>
                  {section.fields}
                </div>
              </div>
            ))}

            <div className="pt-6 mt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-black text-xs uppercase">
                  {usuarioAtual?.nome?.charAt(0) || 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Autor</span>
                  <span className="text-sm font-bold text-slate-700">{usuarioAtual?.nome || 'Anônimo'}</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={enviando} 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black uppercase tracking-widest text-[10px] py-4 px-10 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                Submeter Ficha
              </button>
            </div>

          </form>
        </div>
      </div>
    </MainLayout>
  );
}