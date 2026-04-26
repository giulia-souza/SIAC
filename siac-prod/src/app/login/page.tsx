'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  Microscope, 
  Beaker, 
  ShieldCheck, 
  ArrowLeft, 
  Loader2 
} from 'lucide-react';

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
  
        Cookies.set('siac_session', JSON.stringify(user), { expires: 1 });
        setStatus({ type: 'sucesso', mensagem: `Bem-vinda, ${user.nome}!` });

        setTimeout(() => {
          if (user.regra === 'ADMINISTRADOR') {
            router.push('/admin/dashboard');
          } else {
            router.push('/analise/nova');
          }
        }, 1500);
      } else {
        setStatus({ type: 'erro', mensagem: data.error || 'E-mail ou senha incorretos.' });
      }
    } catch (error) {
      setStatus({ type: 'erro', mensagem: 'Erro de conexão com o servidor.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      <nav className="p-6 border-b border-gray-100 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-blue-900 text-white p-2 rounded-lg font-bold">SIAC</div>
          <span className="font-semibold text-gray-800 tracking-tight">SAGI LABS</span>
        </div>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
        >
          Página Inicial
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 bg-white rounded-3xl shadow-xl border border-gray-100 items-center">
          
          <div className="flex flex-col items-start lg:items-start text-center lg:text-left gap-6 flex-1 lg:pr-10">
             <div className="flex items-center gap-4 text-left justify-start self-start">
               <div className="text-blue-600 flex-shrink-0"><Microscope size={48} /></div>
               <div>
                  <div className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                    SAGI - LABS
                  </div>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                     Bem-vindo ao <br />
                     <span className="text-blue-600 font-medium italic">SIAC</span>
                   </h1>
               </div>
             </div>
            <p className="text-gray-500 max-w-lg mb-8 text-lg leading-relaxed">
              Sistema de Identificação e Análise de Colônias. Transformando a microbiologia 
              com tecnologia de ponta para pesquisadores e estudantes. Acesse sua conta.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-lg w-full">
              <div className="p-5 text-left bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-blue-600 mb-3"><Beaker size={24} /></div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Análise Prática</h3>
                <p className="text-xs text-gray-500">Gestão centralizada de análises e históricos no laboratório.</p>
              </div>
              <div className="p-5 text-left bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-blue-600 mb-3"><ShieldCheck size={24} /></div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Segurança Institucional</h3>
                <p className="text-xs text-gray-500">Autenticação segura seguindo padrões UTFPR.</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col items-center lg:items-start p-10 bg-gray-50 rounded-3xl border border-gray-100">
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Acessar Conta</h2>
            <p className="text-gray-500 mb-10 text-lg leading-relaxed">Faça seu login para iniciar a análise.</p>
            
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-medium text-gray-700 text-sm pl-1">E-mail Institucional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@utfpr.edu.br"
                    className="w-full pl-14 pr-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center pl-1">
                  <label htmlFor="password" className="font-medium text-gray-700 text-sm">Senha</label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha segura"
                    className="w-full pl-14 pr-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition outline-none"
                  />
                </div>
              </div>

              {status.mensagem && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${
                  status.type === 'sucesso' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {status.mensagem}
                </div>
              )}

              <button 
                type="submit" 
                disabled={carregando}
                className={`flex items-center justify-center gap-3 w-full text-white px-8 py-4 rounded-xl font-bold transition shadow-lg text-lg ${
                  carregando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 hover:bg-black active:scale-[0.98]'
                }`}
              >
                {carregando ? (
                  <><Loader2 className="animate-spin" size={20} /> Verificando...</>
                ) : (
                  <>Acessar Painel</>
                )}
              </button>

              <div className="text-center w-full mt-4">
                <span className="text-sm text-gray-500">Ainda não tem conta?</span>{' '}
                <Link href="/register" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">
                  Cadastre-se aqui
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="p-8 border-t border-gray-100 text-center text-gray-400 text-sm">
        © 2026 SIAC - UTFPR. Desenvolvido por SAGI LABS
      </footer>
    </div>
  );
}