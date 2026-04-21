import MainLayout from '@/components/MainLayout';

export default function AnalisePage() {
  return (
    <MainLayout>
      <h2 className="text-xl mb-4">Bem-vinda à análise de colônias!</h2>
      <p>Aqui você poderá inserir as características da sua placa de Petri.</p>
      {/* Seu conteúdo da análise aqui */}
    </MainLayout>
  );
}