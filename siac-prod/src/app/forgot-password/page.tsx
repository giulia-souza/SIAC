'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'sucesso' | 'erro' | null, mensagem: string }>({
    type: null,
    mensagem: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setStatus({ type: null, mensagem: '' });

    try {
      //rota POST para enviar o e-mail
      const response = await fetch('/api/usuario/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ 
          type: 'sucesso', 
          mensagem: 'Se este e-mail estiver cadastrado, você receberá um link em breve.' 
        });
        setEmail(''); // Limpa o campo após sucesso
      } else {
        setStatus({ type: 'erro', mensagem: data.error || 'Erro ao processar solicitação.' });
      }
    } catch (error) {
      setStatus({ type: 'erro', mensagem: 'Erro de conexão com o servidor.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        {/* Botão de Voltar */}
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft size={16} className="mr-2" /> Voltar para o login
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
          <p className="text-gray-500 mt-2">
            Insira seu e-mail institucional para receber as instruções de redefinição.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail Cadastrado</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@utfpr.alunos.edu.br"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white font-semibold transition-all ${
              carregando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {carregando ? 'Enviando...' : (
              <>
                <Send size={18} /> Enviar Link de Recuperação
              </>
            )}
          </button>
        </form>

        {status.mensagem && (
          <div className={`mt-6 p-4 rounded-lg text-sm text-center leading-relaxed ${
            status.type === 'sucesso' 
              ? 'bg-green-50 text-green-700 border border-green-100' 
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {status.mensagem}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Problemas com o acesso? <br />
            <span className="text-blue-600 font-medium">Contate o administrador do laboratório.</span>
          </p>
        </div>
      </div>
    </main>
  );
}