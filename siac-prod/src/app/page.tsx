'use client';

import Link from 'next/link';
import { Microscope, Beaker, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar Minimalista */}
      <nav className="p-6 border-b border-gray-100 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-blue-900 text-white p-2 rounded-lg font-bold">SIAC</div>
          <span className="font-semibold text-gray-800 tracking-tight">SAGI LABS</span>
        </div>
        <Link 
          href="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition"
        >
          Acessar Sistema
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
          UTFPR - Campus Curitiba
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          SIAC <br />
          <span className="text-blue-600 font-medium italic text-4xl md:text-5xl">Sistema de Identificação e Análise de Colônias. </span>
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg mb-10 leading-relaxed">
          Transformando a microbiologia 
          com tecnologia de ponta para pesquisadores e estudantes da Engenharia.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition shadow-lg"
          >
            Iniciar Análise <ArrowRight size={20} />
          </Link>
          <Link 
            href="/forgot-password" 
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Recuperar Acesso
          </Link>
        </div>

        {/* Mini Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
          <div className="p-6 text-left">
            <div className="text-blue-600 mb-4"><Microscope size={32} /></div>
            <h3 className="font-bold text-gray-800 mb-2">Análise Morfológica</h3>
            <p className="text-sm text-gray-500 text-balance">Identificação baseada em cor, borda, elevação e forma da colônia.</p>
          </div>
          <div className="p-6 text-left">
            <div className="text-blue-600 mb-4"><Beaker size={32} /></div>
            <h3 className="font-bold text-gray-800 mb-2">Gestão de Laboratório</h3>
            <p className="text-sm text-gray-500 text-balance">Controle total de usuários e históricos de análises feitas no SAGI LABS.</p>
          </div>
          <div className="p-6 text-left">
            <div className="text-blue-600 mb-4"><ShieldCheck size={32} /></div>
            <h3 className="font-bold text-gray-800 mb-2">Segurança UTFPR</h3>
            <p className="text-sm text-gray-500 text-balance">Autenticação segura e proteção de dados seguindo padrões institucionais.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-gray-100 text-center text-gray-400 text-sm">
        © 2026 SIAC - UTFPR. Desenvolvido por SAGI LABS
      </footer>
    </div>
  );
}