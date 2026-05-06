'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import MainLayout from '@/components/MainLayout';
import { 
  Database, 
  Trash2, 
  Search, 
  Loader2,
  AlertCircle,
  Microscope,
  Plus,
  X,
  CheckCircle2,
  Layers,
  TestTube2,
  Send
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
  const [usuarioAtual, setUsuarioAtual] = useState<{nome: string, regra: string} | null>(null);
  
  // Estados da Listagem
  const [bacterias, setBacterias] = useState<Bacteria[]>([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [apagandoId, setApagandoId] = useState<number | null>(null);

  // Estados do Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    nome_cientifico: '',
    fonte: '', // Adicionado para bater com a listagem
    observacoes_bioquimicas: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [campoErro, setCampoErro] = useState('');

  // Carregar usuário e bactérias ao iniciar
  useEffect(() => {
    const session = Cookies.get('siac_session');
    if (session) setUsuarioAtual(JSON.parse(session));
    carregarBacterias();
  }, []);

  // ==========================================
  // FUNÇÕES DA LISTAGEM
  // ==========================================
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
      const res = await fetch(`/api/bacterias?id=${id}`, { method: 'DELETE' });

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

  // ==========================================
  // FUNÇÕES DO MODAL DE CADASTRO
  // ==========================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModal = () => {
    setModalAberto(true);
    setSucesso(false);
    setErro('');
    setCampoErro('');
    setFormData({ nome_cientifico: '', fonte: '', observacoes_bioquimicas: '' });
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação obrigatória
    if (!formData.nome_cientifico || formData.nome_cientifico.trim() === '') {
      setCampoErro('nome_cientifico');
      setErro('O Nome Científico da bactéria é obrigatório.');
      return;
    }

    setCampoErro('');
    setEnviando(true);
    setErro('');
    setSucesso(false);

    try {
      const { nome_cientifico, observacoes_bioquimicas, fonte, ...caracteristicas } = formData;
      const dadosLimpados: Record<string, string> = {};
      
      Object.entries(caracteristicas).forEach(([key, value]) => {
        if (value && value.trim() !== '') dadosLimpados[key] = value;
      });

      if (observacoes_bioquimicas) dadosLimpados.observacoes = observacoes_bioquimicas;
      if (fonte) dadosLimpados.fonte = fonte;

      // Chama a rota de criação de bactérias
      const res = await fetch('/api/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_sugestao: 'NOVA_BACTERIA',
          nome_bacteria: nome_cientifico,
          dados_propostos: dadosLimpados,
          autor_nome: usuarioAtual?.nome || 'Administrador',
          autor_regra: usuarioAtual?.regra === 'PROFESSOR' ? 'PROFESSOR' : 'ADMINISTRADOR'
        })
      });

      if (!res.ok) throw new Error('Falha ao cadastrar');

      setSucesso(true);
      
      // Recarrega a tabela no fundo para mostrar a nova bactéria
      carregarBacterias();

      // Fecha o modal após 2 segundos de sucesso
      setTimeout(() => {
        fecharModal();
      }, 2000);

    } catch (err) {
      setErro('Ocorreu um erro ao cadastrar a cepa no banco de dados.');
    } finally {
      setEnviando(false);
    }
  };

  // ==========================================
  // COMPONENTES DE INPUT DO FORM
  // ==========================================
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

  const renderInput = (name: string, label: string, placeholder: string, italic = false) => {
    const temErro = campoErro === name;

    return (
      <div key={name} className="flex flex-col gap-1.5 relative">
        <label className={`text-[10px] font-black uppercase tracking-[0.1em] ml-1 ${temErro ? 'text-red-500' : 'text-slate-400'}`}>
          {label}
        </label>
        <input 
          type="text" 
          name={name} 
          value={formData[name] || ''} 
          onChange={(e) => {
            handleChange(e);
            if (temErro) setCampoErro('');
          }} 
          placeholder={placeholder}
          className={`w-full bg-white border text-slate-700 rounded-xl px-4 py-2.5 outline-none transition-all text-sm font-semibold shadow-sm 
            ${italic ? 'italic font-bold text-blue-900' : ''} 
            ${temErro ? 'border-red-400 focus:ring-4 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500'}`}
        />
        {temErro && (
          <span className="text-red-500 text-[10px] font-bold ml-1 animate-in fade-in slide-in-from-top-1">
            Preencha este campo.
          </span>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2">
        
        {/* HEADER DA PÁGINA */}
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

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
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
            
            <button 
              onClick={abrirModal}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm shadow-blue-200 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Adicionar Cepa
            </button>
          </div>
        </div>

        {/* TABELA DE LISTAGEM */}
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
                          <td className="px-8 py-5 text-xs font-black text-slate-300">#{idReal}</td>
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

      {/* MODAL DE CADASTRO DE CEPA                    */}
      {modalAberto && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 md:px-8 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5">
                  <Database size={10} /> Cadastro Oficial
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Adicionar Nova Cepa</h2>
              </div>
              <button 
                onClick={fecharModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body / Formulário */}
            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
              
              {sucesso && (
                <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
                  <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  <p className="font-bold text-sm">Cepa cadastrada no banco de dados com sucesso!</p>
                </div>
              )}

              {erro && (
                <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-2xl border border-red-100 flex items-center gap-4">
                  <AlertCircle size={20} className="text-red-500 shrink-0" />
                  <p className="font-bold text-sm">{erro}</p>
                </div>
              )}

              <form id="form-cadastro-cepa" onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                  {renderInput('nome_cientifico', 'Nome Científico *', 'Ex: Staphylococcus aureus', true)}
                  {renderInput('fonte', 'Origem / Fonte', 'Ex: Secreção Ferida, Sangue...')}
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

              </form>
            </div>

            {/* Modal Footer / Ações */}
            <div className="p-6 md:px-8 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 mt-auto">
              <button 
                type="button"
                onClick={fecharModal}
                disabled={enviando}
                className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="form-cadastro-cepa"
                disabled={enviando} 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black uppercase tracking-widest text-[10px] py-3.5 px-8 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 min-w-[180px]"
              >
                {enviando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={3} />} 
                {enviando ? 'Salvando...' : 'Cadastrar Cepa'}
              </button>
            </div>

          </div>
        </div>
      )}

    </MainLayout>
  );
}