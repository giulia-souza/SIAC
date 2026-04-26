'use client';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import jsPDF from 'jspdf';
import {
  Microscope,
  Dna,
  Activity,
  Layers,
  AlertCircle,
  RotateCcw,
  Loader2,
  TestTube2,
  ThermometerSun,
  CheckCircle2,
  Download,
  Search
} from 'lucide-react';

interface Caracteristica {
  caracteristica: string;
  categoria: string;
  valor: string;
}

interface Bacteria {
  id: number;
  nome: string;
  gram: string;
  morfologia_celular: string;
  arranjo: string;
  caracteristicas: Caracteristica[];
  
  hemolise?: string;
  cor_colonia?: string;
  pigmento?: string;
  textura?: string;
  tamanho_colonia?: string;
  forma?: string;
  crescimento?: string;
  odor?: string;
  
  catalase?: string;
  coagulase?: string;
  oxidase?: string;
  lactose?: string;
  indol?: string;
  citrato?: string;
  urease?: string;
  h2s?: string;
  motilidade?: string;
  fermentacao?: string;
  bile_esculina?: string;
  nacl_6_5?: string;
  
  atmosfera?: string;
  crescimento_anaerobio?: string;
  meio_especifico?: string;
  fatores_x_v?: string;
  acido_alcool_resistente?: string;
  formacao_esporos?: string;
  velocidade_crescimento?: string;
}

type Filtros = Omit<Bacteria, 'id' | 'nome' | 'caracteristicas' | 'gram' | 'morfologia_celular' | 'arranjo'> & {
  gram: string;
  morfologia_celular: string;
  arranjo: string;
};

const initialFiltros: Record<keyof Filtros, string> = {
  gram: '', morfologia_celular: '', arranjo: '',
  hemolise: '', cor_colonia: '', pigmento: '', textura: '', tamanho_colonia: '', forma: '', crescimento: '', odor: '',
  catalase: '', coagulase: '', oxidase: '', lactose: '', indol: '', citrato: '', urease: '', h2s: '', motilidade: '', fermentacao: '', bile_esculina: '', nacl_6_5: '',
  atmosfera: '', crescimento_anaerobio: '', meio_especifico: '', fatores_x_v: '', acido_alcool_resistente: '', formacao_esporos: '', velocidade_crescimento: ''
};

function normalizar(valor: string | undefined | null) {
  return (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function FilterGroup({
  titulo,
  icone: Icon,
  categoria,
  opcoes,
  filtrosAtuais,
  onSelect,
}: {
  titulo: string;
  icone: React.ElementType;
  categoria: keyof Filtros;
  opcoes: string[];
  filtrosAtuais: Record<keyof Filtros, string>;
  onSelect: (campo: keyof Filtros, valor: string) => void;
}) {
  if (!opcoes || opcoes.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
        <Icon size={14} className="text-blue-500" />
        {titulo}
      </h3>

      <div className="flex flex-wrap gap-2">
        {opcoes.map((opcao) => {
          const selecionado = filtrosAtuais[categoria] === opcao;

          return (
            <button
              key={opcao}
              type="button"
              onClick={() => onSelect(categoria, opcao)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                selecionado
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {opcao}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function NovaAnalise() {
  const [bancoBacterias, setBancoBacterias] = useState<Bacteria[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [filtros, setFiltros] = useState<Record<keyof Filtros, string>>(initialFiltros);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/bacterias');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const dadosProcessados = data.map((bact: Bacteria) => {
            const buscarCarac = (nome: string) => 
              bact.caracteristicas?.find(c => normalizar(c.caracteristica) === normalizar(nome))?.valor || '';

            const propriedadesExtraidas: any = { ...bact };
            
            Object.keys(initialFiltros).forEach(chave => {
              if (['gram', 'morfologia_celular', 'arranjo'].includes(chave)) return;
              
              if (chave === 'crescimento_anaerobio') {
                propriedadesExtraidas[chave] = buscarCarac('anaerobio') || buscarCarac('crescimento_anaerobio');
              } else if (chave === 'nacl_6_5') {
                propriedadesExtraidas[chave] = buscarCarac('nacl 6 5%') || buscarCarac('nacl_6_5');
              } else if (chave === 'velocidade_crescimento') {
                propriedadesExtraidas[chave] = buscarCarac('velocidade') || buscarCarac('velocidade_crescimento');
              } else {
                propriedadesExtraidas[chave] = buscarCarac(chave);
              }
            });

            return propriedadesExtraidas as Bacteria;
          });
          setBancoBacterias(dadosProcessados);
        } else {
          setBancoBacterias([]);
        }
      } catch (err) {
        console.error('Erro ao carregar base de dados:', err);
        setBancoBacterias([]);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const opcoesDinamicas = useMemo(() => {
    const conjuntos = Object.keys(initialFiltros).reduce((acc, key) => {
      acc[key as keyof Filtros] = new Set<string>();
      return acc;
    }, {} as Record<keyof Filtros, Set<string>>);

    for (const b of bancoBacterias) {
      (Object.keys(conjuntos) as Array<keyof Filtros>).forEach(key => {
        const val = b[key as keyof Bacteria];
        if (val) conjuntos[key].add(val as string);
      });
    }

    return Object.fromEntries(
      Object.entries(conjuntos).map(([key, set]) => [key, [...set as Set<string>].sort()])
    ) as Record<keyof Filtros, string[]>;
    
  }, [bancoBacterias]);

  const resultados = useMemo(() => {
    return bancoBacterias.filter((b) => {
      return (Object.keys(filtros) as Array<keyof Filtros>).every((chave) => {
        const valorFiltro = normalizar(filtros[chave]);
        if (!valorFiltro) return true; 
        
        const valorBacteria = normalizar(b[chave as keyof Bacteria] as string);
        return valorBacteria.includes(valorFiltro);
      });
    });
  }, [bancoBacterias, filtros]);

  const selecionarFiltro = (campo: keyof Filtros, valor: string) => {
    setFiltros((atual) => ({
      ...atual,
      [campo]: atual[campo] === valor ? '' : valor,
    }));
  };

  const limparFiltros = () => {
    setFiltros(initialFiltros);
  };

  const confirmarIdentificacao = async (idBacteria: number) => {
    try {
      setSalvando(true);
      
      const session = Cookies.get('siac_session');
      let usuario = { nome: 'Anônimo', regra: 'ALUNO' };

      if (session) {
        usuario = JSON.parse(session);
      }

      const res = await fetch('/api/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_bacteria: idBacteria,
          nome_usuario: usuario.nome,
          regra_usuario: usuario.regra
        })
      });

      if (res.ok) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000); 
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSalvando(false);
    }
  };

  const gerarPDF = () => {
    if (resultados.length !== 1) return;
    
    try {
      setGerandoPDF(true);
      const bact = resultados[0];
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      let y = 20;
      const marginX = 15;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138); 
      pdf.text('SIAC - Sistema de Identificação e Análise de Colônia', marginX, y);
      y += 12;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(17, 24, 39); 
      pdf.text(`Bactéria Identificada: ${bact.nome}`, marginX, y);
      y += 10;
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(marginX, y, 195, y);
      y += 12;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Características Base', marginX, y);
      y += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Coloração de Gram:', marginX + 5, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(bact.gram || 'Não definida', marginX + 45, y);
      y += 7;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Morfologia Celular:', marginX + 5, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(bact.morfologia_celular || 'Não definida', marginX + 45, y);
      y += 7;
      
      if (bact.arranjo) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Arranjo Celular:', marginX + 5, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(bact.arranjo, marginX + 45, y);
        y += 10;
      } else {
        y += 5;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Perfil Fenotípico e Bioquímico Completo', marginX, y);
      y += 8;
      
      pdf.setFontSize(10);
      
      if (bact.caracteristicas && bact.caracteristicas.length > 0) {
        bact.caracteristicas.forEach((c) => {
          if (y > 275) { 
            pdf.addPage();
            y = 20;
          }
          
          const nomeCarac = c.caracteristica
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
            
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${nomeCarac}:`, marginX + 5, y);
          
          pdf.setFont('helvetica', 'normal');
          const offset = pdf.getTextWidth(`${nomeCarac}: `);
          pdf.text(c.valor, marginX + 5 + offset, y);
          
          y += 7;
        });
      } else {
         pdf.setFont('helvetica', 'normal');
         pdf.text('Sem dados adicionais registados.', marginX + 5, y);
         y += 7;
      }
      
      if (y > 275) {
        pdf.addPage();
        y = 20;
      }
      y += 15;
      pdf.setFontSize(9);
      pdf.setTextColor(150); 
      pdf.text(`Relatório oficial gerado pelo sistema SIAC em ${new Date().toLocaleString('pt-BR')}`, marginX, y);
      
      const nomeCepa = normalizar(bact.nome).replace(/\s+/g, '_');
      pdf.save(`SIAC_Relatorio_${nomeCepa}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 pb-20 pt-2 relative z-0">
        
        <div className="mb-8 mt-2 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm">
              <Microscope size={10} /> Laboratório Virtual
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Identificação de <span className="text-blue-600">Cepa</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Filtre as bactérias cruzando dados fenotípicos e bioquímicos.
            </p>
          </div>

          <button
            type="button"
            onClick={limparFiltros}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
          >
            <RotateCcw size={16} />
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative items-start">
          
          <div className="lg:col-span-3 space-y-8">
            
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500"><Microscope size={18} /></div>
                <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Microscopia</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FilterGroup titulo="Coloração de Gram" icone={Layers} categoria="gram" opcoes={opcoesDinamicas.gram} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Morfologia Celular" icone={Dna} categoria="morfologia_celular" opcoes={opcoesDinamicas.morfologia_celular} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Arranjo Celular" icone={Activity} categoria="arranjo" opcoes={opcoesDinamicas.arranjo} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
              </div>
            </div>
            
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="p-2 bg-pink-50 rounded-lg text-pink-500"><Layers size={18} /></div>
                <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Características da Colônia</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <FilterGroup titulo="Hemólise" icone={Activity} categoria="hemolise" opcoes={opcoesDinamicas.hemolise} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Cor da Colônia" icone={Activity} categoria="cor_colonia" opcoes={opcoesDinamicas.cor_colonia} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Pigmento" icone={Activity} categoria="pigmento" opcoes={opcoesDinamicas.pigmento} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Textura" icone={Activity} categoria="textura" opcoes={opcoesDinamicas.textura} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Tamanho Colônia" icone={Activity} categoria="tamanho_colonia" opcoes={opcoesDinamicas.tamanho_colonia} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Forma" icone={Activity} categoria="forma" opcoes={opcoesDinamicas.forma} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Crescimento Colônia" icone={Activity} categoria="crescimento" opcoes={opcoesDinamicas.crescimento} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Odor" icone={Activity} categoria="odor" opcoes={opcoesDinamicas.odor} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><TestTube2 size={18} /></div>
                <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Testes Bioquímicos Essenciais</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                <FilterGroup titulo="Catalase" icone={TestTube2} categoria="catalase" opcoes={opcoesDinamicas.catalase} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Coagulase" icone={TestTube2} categoria="coagulase" opcoes={opcoesDinamicas.coagulase} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Oxidase" icone={TestTube2} categoria="oxidase" opcoes={opcoesDinamicas.oxidase} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Lactose" icone={TestTube2} categoria="lactose" opcoes={opcoesDinamicas.lactose} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Indol" icone={TestTube2} categoria="indol" opcoes={opcoesDinamicas.indol} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Citrato" icone={TestTube2} categoria="citrato" opcoes={opcoesDinamicas.citrato} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Urease" icone={TestTube2} categoria="urease" opcoes={opcoesDinamicas.urease} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="H2S" icone={TestTube2} categoria="h2s" opcoes={opcoesDinamicas.h2s} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Motilidade" icone={TestTube2} categoria="motilidade" opcoes={opcoesDinamicas.motilidade} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Fermentação" icone={TestTube2} categoria="fermentacao" opcoes={opcoesDinamicas.fermentacao} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Bile Esculina" icone={TestTube2} categoria="bile_esculina" opcoes={opcoesDinamicas.bile_esculina} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="NaCl 6.5%" icone={TestTube2} categoria="nacl_6_5" opcoes={opcoesDinamicas.nacl_6_5} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><ThermometerSun size={18} /></div>
                <h2 className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Crescimento e Coloração</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <FilterGroup titulo="Atmosfera" icone={ThermometerSun} categoria="atmosfera" opcoes={opcoesDinamicas.atmosfera} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Anaeróbio" icone={ThermometerSun} categoria="crescimento_anaerobio" opcoes={opcoesDinamicas.crescimento_anaerobio} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Meio Específico" icone={ThermometerSun} categoria="meio_especifico" opcoes={opcoesDinamicas.meio_especifico} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Fatores X e V" icone={ThermometerSun} categoria="fatores_x_v" opcoes={opcoesDinamicas.fatores_x_v} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="AAR (Ziehl-Neelsen)" icone={ThermometerSun} categoria="acido_alcool_resistente" opcoes={opcoesDinamicas.acido_alcool_resistente} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Esporos" icone={ThermometerSun} categoria="formacao_esporos" opcoes={opcoesDinamicas.formacao_esporos} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
                <FilterGroup titulo="Velocidade" icone={ThermometerSun} categoria="velocidade_crescimento" opcoes={opcoesDinamicas.velocidade_crescimento} filtrosAtuais={filtros} onSelect={selecionarFiltro} />
              </div>
            </div>

          </div>

          <div className="lg:col-span-1 sticky top-28 self-start">
            <div className="bg-gradient-to-b from-blue-900 to-indigo-900 rounded-[2rem] p-6 shadow-2xl shadow-blue-900/20 border border-blue-800/50 text-white flex flex-col max-h-[calc(100vh-140px)]">
              
              <div className="flex items-center gap-3 border-b border-blue-800/50 pb-4 mb-4 shrink-0">
                <div className="p-2 bg-blue-800 rounded-lg text-blue-300 shadow-inner"><Search size={18} /></div>
                <div>
                  <h2 className="text-lg font-black tracking-tight leading-tight">Resultados</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
                    {resultados.length} cepa(s) compatível(is)
                  </p>
                </div>
              </div>

              {carregando ? (
                <div className="flex flex-col items-center justify-center py-12 text-blue-400">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <p className="font-bold text-[10px] uppercase tracking-widest">Consultando base...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-[200px]">
                    {resultados.length === 0 ? (
                      <div className="bg-blue-950/40 p-6 rounded-2xl text-center border border-blue-800/30 h-full flex flex-col items-center justify-center">
                        <AlertCircle size={32} className="text-blue-400 mx-auto mb-3 opacity-50" />
                        <p className="font-bold text-blue-200 text-sm">Sem correspondência</p>
                        <p className="text-xs text-blue-400 mt-1">Revise os filtros aplicados</p>
                      </div>
                    ) : (
                      <div className="space-y-3 pb-2">
                        {resultados.map((bact) => (
                          <div
                            key={bact.id}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 p-4 rounded-2xl shadow-lg transition-all cursor-pointer group"
                          >
                            <h3 className="font-black italic text-[15px] group-hover:text-blue-300 transition-colors mb-3 leading-tight">
                              {bact.nome}
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="bg-blue-950/50 text-blue-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                Gram {bact.gram}
                              </span>
                              <span className="bg-blue-950/50 text-blue-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {bact.morfologia_celular}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {resultados.length === 1 && (
                    <div className="mt-6 pt-5 border-t border-blue-800/50 flex flex-col gap-3 shrink-0">
                      {sucesso ? (
                        <div className="bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                          <CheckCircle2 size={16} />
                          Identificação Registrada!
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => confirmarIdentificacao(resultados[0].id)}
                          disabled={salvando}
                          className="w-full bg-blue-500 hover:bg-blue-400 disabled:bg-blue-800 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {salvando ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              A Guardar...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} />
                              Confirmar Identificação
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={gerarPDF}
                        disabled={gerandoPDF}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[10px] py-3.5 rounded-2xl border border-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        {gerandoPDF ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            A Gerar PDF...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Baixar Ficha (PDF)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}