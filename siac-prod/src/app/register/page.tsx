'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  ArrowLeft, 
  Loader2, 
  Microscope, 
  Beaker, 
  ShieldCheck 
} from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    regra: 'ESTUDANTE'
  });

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
      const dadosParaEnviar = {
        nome: formData.nome,
        email: formData.email,
        password: formData.senha,
        regra: formData.regra
      };

      const response = await fetch('/api/usuario/user_cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar),
      });

      const data = await response.json();

      if (response.ok) {

        setStatus({ 
          type: 'sucesso', 
          mensagem: data.message || 'Cadastro realizado com sucesso!' 
        });

        setFormData({ nome: '', email: '', senha: '', regra: 'ESTUDANTE' });

        setTimeout(() => {
          router.push('/login');
        }, 2500);

      } else {
        setStatus({ 
          type: 'erro', 
          mensagem: data.error || 'Erro ao realizar cadastro.' 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'erro', 
        mensagem: 'Erro de conexão com o servidor.' 
      });
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
                    UTFPR - Campus Curitiba
                  </div>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                     Junte-se ao <br />
                     <span className="text-blue-600 font-medium italic">SIAC</span>
                   </h1>
               </div>
             </div>
            <p className="text-gray-500 max-w-lg mb-8 text-lg leading-relaxed">
              Crie sua conta para começar a utilizar nossa plataforma de identificação e análise de colônias. 
              Acesso exclusivo para a comunidade acadêmica.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-lg w-full">
              <div className="p-5 text-left bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-blue-600 mb-3"><Beaker size={24} /></div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Pesquisa Digital</h3>
                <p className="text-xs text-gray-500">Transforme seus resultados laboratoriais em dados estruturados.</p>
              </div>
              <div className="p-5 text-left bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-blue-600 mb-3"><ShieldCheck size={24} /></div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Privacidade</h3>
                <p className="text-xs text-gray-500">Seus experimentos e análises protegidos e criptografados.</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[480px] flex-shrink-0 flex flex-col items-center lg:items-start p-10 bg-gray-50 rounded-3xl border border-gray-100">
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Criar Conta</h2>
            <p className="text-gray-500 mb-8 text-lg leading-relaxed">Preencha os dados abaixo para se cadastrar.</p>
            
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm pl-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Seu nome completo"
                    className="w-full pl-14 pr-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm pl-1">E-mail Institucional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="exemplo@utfpr.edu.br"
                    className="w-full pl-14 pr-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm pl-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.senha}
                    onChange={(e) => setFormData({...formData, senha: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm pl-1">Tipo de Usuário</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                    <Shield size={20} />
                  </div>
                  <select
                    value={formData.regra}
                    onChange={(e) => setFormData({...formData, regra: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-800 appearance-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition outline-none cursor-pointer"
                  >
                    <option value="ESTUDANTE">Estudante</option>
                  </select>
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
                className={`flex items-center justify-center gap-3 w-full text-white px-8 py-4 rounded-xl font-bold transition shadow-lg text-lg mt-2 ${
                  carregando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 hover:bg-black active:scale-[0.98]'
                }`}
              >
                {carregando ? (
                  <><Loader2 className="animate-spin" size={20} /> Criando...</>
                ) : (
                  <><UserPlus size={20} /> Criar minha conta</>
                )}
              </button>

              <div className="text-center w-full mt-4">
                <span className="text-sm text-gray-500">Já tem uma conta?</span>{' '}
                <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">
                  Fazer Login
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