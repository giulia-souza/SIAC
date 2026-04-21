'use client';

import MainLayout from '@/components/MainLayout';
import { 
  Users, 
  Microscope, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react'; // Biblioteca de ícones (npm install lucide-react)

export default function AdminDashboard() {
  // Dados fictícios - Depois buscar do Prisma com useEffect
  const metricas = [
    { label: 'Total de Usuários', valor: '42', icon: <Users size={24} />, cor: 'bg-blue-500' },
    { label: 'Análises Realizadas', valor: '156', icon: <Microscope size={24} />, cor: 'bg-green-500' },
    { label: 'Pendentes de Revisão', valor: '12', icon: <AlertCircle size={24} />, cor: 'bg-yellow-500' },
    { label: 'Identificações Precisas', valor: '94%', icon: <CheckCircle2 size={24} />, cor: 'bg-purple-500' },
  ];

  const ultimasAnalises = [
    { id: 1, aluno: 'João Silva', microrganismo: 'Staphylococcus aureus', data: '20/04/2026', status: 'Concluído' },
    { id: 2, aluno: 'Maria Oliveira', microrganismo: 'Escherichia coli', data: '19/04/2026', status: 'Revisar' },
    { id: 3, aluno: 'Pedro Santos', microrganismo: 'Bacillus subtilis', data: '18/04/2026', status: 'Concluído' },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Seção de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricas.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className={`${item.cor} p-3 rounded-lg text-white`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-gray-800">{item.valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabela de Atividade Recente */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">Atividades Recentes de Análise</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Ver todas</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Estudante</th>
                  <th className="px-6 py-4">Sugestão de Espécie</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ultimasAnalises.map((analise) => (
                  <tr key={analise.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{analise.aluno}</td>
                    <td className="px-6 py-4 text-gray-600 italic">{analise.microrganismo}</td>
                    <td className="px-6 py-4 text-gray-500">{analise.data}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        analise.status === 'Concluído' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {analise.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}