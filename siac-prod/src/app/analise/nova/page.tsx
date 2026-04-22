'use client';

import { useState, useMemo } from 'react';
import MainLayout from '@/components/MainLayout';
import { 
  Microscope, 
  Dna, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

const MOCK_BACTERIAS = [
  { id: 1, nome: 'Staphylococcus aureus', gram: 'Positivo', formato: 'Cocos', arranjo: 'Cachos', respiracao: 'Facultativa', patogeno: true },
  { id: 2, nome: 'Escherichia coli', gram: 'Negativo', formato: 'Bacilos', arranjo: 'Isolados', respiracao: 'Facultativa', patogeno: true },
  { id: 3, nome: 'Streptococcus pneumoniae', gram: 'Positivo', formato: 'Cocos', arranjo: 'Pares/Cadeias', respiracao: 'Facultativa', patogeno: true },
  { id: 4, nome: 'Pseudomonas aeruginosa', gram: 'Negativo', formato: 'Bacilos', arranjo: 'Isolados', respiracao: 'Estritamente Aeróbia', patogeno: true },
  { id: 5, nome: 'Lactobacillus acidophilus', gram: 'Positivo', formato: 'Bacilos', arranjo: 'Cadeias', respiracao: 'Aerotolerante', patogeno: false },
  { id: 6, nome: 'Neisseria gonorrhoeae', gram: 'Negativo', formato: 'Cocos', arranjo: 'Pares (Diplococos)', respiracao: 'Aeróbia', patogeno: true },
];

const OPCOES = {
  gram: ['Positivo', 'Negativo'],
  formato: ['Cocos', 'Bacilos', 'Espirilos'],
  arranjo: ['Isolados', 'Pares/Cadeias', 'Cachos', 'Pares (Diplococos)', 'Cadeias'],
  respiracao: ['Aeróbia', 'Estritamente Aeróbia', 'Anaeróbia', 'Facultativa', 'Aerotolerante']
};


export default function NovaAnalise() {

  const [filtros, setFiltros] = useState({
    gram: '',
    formato: '',
    arranjo: '',
    respiracao: ''
  });

  const handleSelect = (categoria: keyof typeof filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [categoria]: prev[categoria] === valor ? '' : valor 
    }));
  };

  const limparFiltros = () => {
    setFiltros({ gram: '', formato: '', arranjo: '', respiracao: '' });
  };

  // Filtra as bactérias em tempo real com base no que foi selecionado
  const resultados = useMemo(() => {
    return MOCK_BACTERIAS.filter(bacteria => {
      const matchGram = !filtros.gram || bacteria.gram === filtros.gram;
      const matchFormato = !filtros.formato || bacteria.formato === filtros.formato;
      const matchArranjo = !filtros.arranjo || bacteria.arranjo === filtros.arranjo;
      const matchResp = !filtros.respiracao || bacteria.respiracao === filtros.respiracao;
      
      return matchGram && matchFormato && matchArranjo && matchResp;
    });
  }, [filtros]);

  // Componente auxiliar para os botões de seleção
  const FilterGroup = ({ titulo, icone: Icon, categoria, opcoes }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
        <Icon size={16} className="text-blue-600" /> {titulo}
      </h3>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((opcao: string) => {
          const isSelected = filtros[categoria as keyof typeof filtros] === opcao;
          return (
            <button
              key={opcao}
              onClick={() => handleSelect(categoria, opcao)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isSelected 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {opcao}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-2">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Microscope size={24} />
              </div>
              Identificação de Cepa
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Selecione as características observadas no microscópio.</p>
          </div>
          
          <button 
            onClick={limparFiltros}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-bold transition active:scale-95"
          >
            <RotateCcw size={18} />
            Limpar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Filtros (Características) */}
          <div className="lg:col-span-2 space-y-6">
            <FilterGroup titulo="Coloração de Gram" icone={Layers} categoria="gram" opcoes={OPCOES.gram} />
            <FilterGroup titulo="Morfologia (Formato)" icone={Dna} categoria="formato" opcoes={OPCOES.formato} />
            <FilterGroup titulo="Arranjo Celular" icone={Activity} categoria="arranjo" opcoes={OPCOES.arranjo} />
            <FilterGroup titulo="Metabolismo/Respiração" icone={Activity} categoria="respiracao" opcoes={OPCOES.respiracao} />
          </div>

          {/* Coluna Direita: Resultados */}
          <div className="lg:col-span-1">
            <div className="bg-blue-900 rounded-[2rem] p-8 shadow-2xl text-white sticky top-24">
              <h2 className="text-xl font-extrabold tracking-tight mb-2">Resultados da Análise</h2>
              <p className="text-blue-200 text-sm font-medium mb-6">
                {resultados.length} {resultados.length === 1 ? 'cepa compatível encontrada' : 'cepas compatíveis encontradas'}
              </p>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {resultados.length === 0 ? (
                  <div className="bg-blue-800/50 p-6 rounded-2xl text-center border border-blue-700/50">
                    <AlertCircle size={32} className="text-blue-300 mx-auto mb-3" />
                    <p className="font-bold text-blue-100">Nenhuma correspondência</p>
                    <p className="text-xs text-blue-300 mt-1">Altere os filtros ou registre uma nova cepa no banco de dados.</p>
                  </div>
                ) : (
                  resultados.map(bact => (
                    <div key={bact.id} className="bg-white text-gray-900 p-5 rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-400 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold italic text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                          {bact.nome}
                        </h3>
                        {bact.patogeno ? (
                          <span className="bg-red-100 text-red-700 p-1.5 rounded-lg" title="Patógeno">
                            <AlertCircle size={16} />
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 p-1.5 rounded-lg" title="Inofensiva">
                            <CheckCircle2 size={16} />
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          Gram {bact.gram}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                          {bact.formato}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {resultados.length === 1 && (
                <button className="w-full mt-6 bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
                  Confirmar Identificação
                </button>
              )}

            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}