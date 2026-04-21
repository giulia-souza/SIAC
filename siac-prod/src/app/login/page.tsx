'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'sucesso' | 'erro' | null, mensagem: string }>({
    type: null,
    mensagem: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setCarregando(true);
  setStatus({ type: null, mensagem: '' });

  try {
    const response = await fetch('/api/usuario/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        const { user } = data;

        // O valor '1' representa 1 dia (24 horas)
        Cookies.set('siac_session', JSON.stringify(user), { expires: 1 });

        setStatus({ type: 'sucesso', mensagem: `Bem-vinda, ${user.nome}!` });

        setTimeout(() => {
            if (user.regra === 'ADMINISTRADOR') {
            router.push('/admin/dashboard');
            } else {
            router.push('/analise');
            }
        }, 1500);
        } 
else {
      setStatus({ type: 'erro', mensagem: data.error || 'E-mail ou senha incorretos.' });
    }
  } catch (error) {
    setStatus({ type: 'erro', mensagem: 'Erro de conexão.' });
  } finally {
    setCarregando(false);
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">SIAC</h1>
          <p className="text-gray-500 mt-2">Sistema de Identificação e Análise de Colônias</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@utfpr.edu.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
          </div>

          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-xs text-blue-600 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-2 rounded-md text-white font-semibold transition-all ${
              carregando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        {status.mensagem && (
          <div className={`mt-4 p-3 rounded-md text-sm text-center animate-pulse ${
            status.type === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {status.mensagem}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-blue-600 font-bold hover:underline">
            Cadastre-se como Estudante
          </Link>
        </div>
      </div>
    </main>
  );
}