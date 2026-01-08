"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const router = useRouter();

  // Função para Scroll Suave
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-gray-200 selection:bg-amber-300 selection:text-black overflow-x-hidden">
      {/* Importação de Ícones */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* --- 1. HEADER OTIMIZADO --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 md:py-5 flex justify-between items-center">
          <div 
            className="text-lg md:text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Faces<span className="hidden md:inline"> da Personalidade</span>
          </div>

          <nav className="hidden lg:flex items-center space-x-12">
            {[
              { label: 'O Valor do Perfil', id: 'o-valor-do-perfil' },
              { label: 'Corporate', id: 'corporate' },
              { label: 'O Processo', id: 'o-processo' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={`#${item.id}`}
                onClick={(e) => handleScroll(e, item.id)}
                className="text-gray-400 hover:text-amber-400 transition-colors duration-300 uppercase tracking-[0.2em] text-[11px] font-bold cursor-pointer"
              >
                {item.label}
              </a>
            ))}
            <Link href="/login" className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-all duration-300">
              Acesse Agora
            </Link>
          </nav>

          {/* Botão Mobile */}
          <Link href="/login" className="lg:hidden px-6 py-2 rounded-full bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest">
            Entrar
          </Link>
        </div>
      </header>

      {/* --- 2. HERO SECTION --- */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-52 bg-black overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-3/5 text-center lg:text-left">
            <div className="inline-block px-5 py-2 mb-8 border border-amber-500/20 rounded-full bg-amber-500/5 backdrop-blur-md text-amber-400 text-[11px] font-black tracking-[0.3em] uppercase">
              Evolução de Alta Performance
            </div>
            <h1 className="text-5xl lg:text-[100px] font-black text-white leading-[0.85] mb-10 tracking-tighter uppercase">
              Transforme <br />
              <span className="bg-gradient-to-r from-amber-100 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
                Autoconhecimento
              </span> <br />
              em Poder.
            </h1>
            <p className="text-lg lg:text-2xl text-gray-400 mb-14 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              A plataforma definitiva de Eneagrama para quem busca o próximo nível na carreira e liderança consciente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <button 
                onClick={() => router.push('/login')}
                className="group relative px-10 lg:px-14 py-6 lg:py-7 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black font-black text-lg lg:text-xl tracking-widest uppercase shadow-[0_20px_40px_-15px_rgba(245,158,11,0.5)] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 overflow-hidden min-w-[280px]"
              >
                <span className="relative z-10">Iniciar Avaliação</span>
                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out transform -skew-x-12" />
              </button>
              
              <a 
                href="#o-valor-do-perfil"
                onClick={(e) => handleScroll(e, 'o-valor-do-perfil')}
                className="px-10 lg:px-14 py-6 lg:py-7 rounded-2xl border-2 border-white/20 text-white font-black text-lg lg:text-xl tracking-widest uppercase hover:bg-white/10 transition-all duration-300 backdrop-blur-md min-w-[280px] active:scale-95 flex items-center justify-center cursor-pointer"
              >
                Saiba Mais
              </a>
            </div>
          </div>

          <div className="hidden lg:flex w-full lg:w-2/5 mt-24 lg:mt-0 justify-center lg:justify-end">
            <div className="relative w-[450px] h-[450px]">
               <div className="absolute inset-0 border border-amber-500/10 rounded-full animate-[spin_25s_linear_infinite]"></div>
               <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_35s_linear_infinite_reverse]"></div>
               <div className="absolute inset-10 rounded-full overflow-hidden border-2 border-amber-500/20 shadow-[0_0_100px_rgba(217,119,6,0.2)]">
                  <img 
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop" 
                    alt="Premium Mindset" 
                    className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 hover:brightness-100 transition-all duration-1000"
                  />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. VALOR ESTRATÉGICO --- */}
      <section id="o-valor-do-perfil" className="py-32 lg:py-40 bg-black relative border-y border-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-24">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tighter uppercase">Direcionamento Estratégico</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-amber-700 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {[
              { title: 'Foco e Clareza', desc: 'Metas assertivas de carreira com precisão absoluta.', path: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-3a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6z" },
              { title: 'Forças Reais', desc: 'Potencialize seu desempenho e talentos naturais.', path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
              { title: 'Pontos Cegos', desc: 'Identifique limitações ocultas que travam sua evolução.', path: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 5a5 5 0 100-10 5 5 0 000 10zm0-2a3 3 0 110-6 3 3 0 010 6z" },
              { title: 'Liderança', desc: 'Desenvolva uma gestão influente e resiliente.', path: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { title: 'Alta Performance', desc: 'Alcance resultados consistentes em alto nível.', path: "M13 10V3L4 14h7v7l9-11h-7z" },
              { title: 'Plano Estratégico', desc: 'Estratégias reais e acionáveis para o dia a dia.', path: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" }
            ].map((item, idx) => (
              <div key={idx} className="group relative p-10 bg-neutral-900/40 border border-white/10 rounded-[32px] hover:border-amber-500/50 transition-all duration-500 flex flex-col items-center">
                <div className="relative w-24 h-24 mb-8 flex items-center justify-center bg-neutral-800/50 rounded-2xl group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d={item.path} />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-widest">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. CORPORATE SECTION --- */}
      <section id="corporate" className="py-32 lg:py-40 bg-black">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-24 text-center lg:text-left">
          <div className="w-full lg:w-1/2">
            <h3 className="text-5xl lg:text-7xl font-black text-white mb-10 tracking-tighter uppercase leading-[0.9]">
              Performance <br /> <span className="text-amber-500">Corporativa</span>
            </h3>
            <p className="text-gray-400 text-lg lg:text-xl mb-14 font-light leading-relaxed">
              Utilize o Eneagrama como inteligência estratégica para alocação de talentos e retenção de lideranças.
            </p>
            <button 
              onClick={() => window.open('https://wa.me/5500000000000', '_blank')}
              className="px-12 py-6 rounded-2xl border-2 border-amber-500/50 text-amber-500 font-black text-sm tracking-[0.2em] uppercase hover:bg-amber-500 hover:text-black transition-all duration-500"
            >
              Solicitar Demo para RH
            </button>
          </div>
          <div id="o-processo" className="w-full lg:w-5/12 bg-neutral-900/50 p-10 lg:p-14 rounded-[50px] border border-white/10 relative">
            <h4 className="text-xl font-black mb-12 uppercase tracking-widest text-white text-center">O Processo</h4>
            <div className="space-y-12 text-left">
              {['Cadastro', 'Avaliação', 'Relatório'].map((step, index) => (
                <div key={index} className="flex items-center gap-8 group">
                  <div className="text-4xl font-black text-amber-500/20">{index + 1}</div>
                  <div className="h-0.5 flex-1 bg-white/5 relative">
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-amber-500"></div>
                    <span className="absolute -top-7 left-0 font-bold text-white uppercase text-[10px] tracking-widest">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. CTA FINAL --- */}
      <section className="py-40 lg:py-52 bg-black text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#251b05_0%,_transparent_70%)] opacity-30"></div>
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black text-white mb-16 tracking-tighter uppercase leading-[0.85]">Pronto para mudar <br/>sua trajetória?</h2>
            <button 
              onClick={() => router.push('/login')}
              className="group relative px-10 lg:px-20 py-8 lg:py-10 rounded-full bg-white text-black font-black text-xl lg:text-3xl tracking-tighter hover:bg-amber-400 transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-4 lg:gap-6">
                GARANTIR MEU RELATÓRIO
                <i className="fas fa-arrow-right text-base lg:text-xl group-hover:translate-x-4 transition-transform duration-300"></i>
              </span>
            </button>
            <p className="mt-12 text-gray-500 font-bold tracking-[0.5em] uppercase text-[10px]">Faces da Personalidade © 2026</p>
         </div>
      </section>

      <footer className="bg-black py-12 text-center text-gray-700 text-[10px] tracking-[0.4em] uppercase border-t border-white/5">
        <p>Todos os direitos reservados. Excellence in Personal Development.</p>
      </footer>
    </div>
  );
};

export default LandingPage;