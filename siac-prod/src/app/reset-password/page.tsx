'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [status, setStatus] = useState<{ type: 'sucesso' | 'erro' | null, mensagem: string }>({
    type: null,
    mensagem: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica de senha
    if (novaSenha !== confirmarSenha) {
      setStatus({ type: 'erro', mensagem: 'As senhas não coincidem.' });
      return;
    }

    if (novaSenha.length < 6) {
      setStatus({ type: 'erro', mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setCarregando(true);
    setStatus({ type: null, mensagem: '' });

    try {
      const response = await fetch('/api/usuario/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'sucesso', mensagem: 'Senha alterada com sucesso! Redirecionando...' });
        // Redireciona para o login após 3 segundos
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setStatus({ type: 'erro', mensagem: data.error || 'Erro ao redefinir senha.' });
      }
    } catch (error) {
      setStatus({ type: 'erro', mensagem: 'Erro de conexão com o servidor.' });
    } finally {
      setCarregando(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center p-10">
        <h1 className="text-red-500 font-bold">Link inválido!</h1>
        <p>O token de recuperação não foi encontrado na URL.</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Redefinir Senha
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite a nova senha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-2 rounded-md text-white font-semibold transition-colors ${
              carregando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {carregando ? 'Processando...' : 'Atualizar Senha'}
          </button>
        </form>

        {status.mensagem && (
          <div className={`mt-4 p-3 rounded-md text-sm text-center ${
            status.type === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {status.mensagem}
          </div>
        )}
      </div>
    </main>
  );
}

// O Next.js exige Suspense ao usar useSearchParams em páginas client-side
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}