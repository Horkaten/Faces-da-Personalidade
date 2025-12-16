import React from 'react';
// Se você usar Lucide Icons (padrão em muitos projetos Next.js), descomente as linhas abaixo.
// Se usar FontAwesome, mantenha as tags <i> como estão.
// import { Target, Zap, Lock, Map, CheckCircle, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-gray-800 selection:bg-amber-300 selection:text-black">
      
      {/* --- 1. HEADER (Glassmorphism) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo com Gradiente Dourado */}
          <div className="text-2xl font-bold tracking-wider uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Faces da Personalidade
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            {['O Valor do Perfil', 'Corporate', 'O Processo'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="hover:text-amber-400 transition-colors duration-300 uppercase tracking-widest text-xs">
                {item}
              </a>
            ))}
            <a href="login" className="group relative px-6 py-2 rounded-full bg-gradient-to-r from-amber-300 to-yellow-600 text-black font-bold text-xs tracking-widest uppercase overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-300">
              <span className="relative z-10">Acesse Agora</span>
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out transform -skew-x-12 origin-left" />
            </a>
          </nav>
        </div>
      </header>

      {/* --- 2. HERO SECTION (Impacto Visual) --- */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32 bg-black overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-neutral-900"></div>
        
        {/* Efeito de Glow Dourado no fundo */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-3/5 text-center lg:text-left">
            <div className="inline-block px-3 py-1 mb-6 border border-amber-500/30 rounded-full bg-amber-500/10 backdrop-blur-sm">
              <span className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase">Evolução Profissional & Pessoal</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Transforme <br />
              <span className="bg-gradient-to-r from-amber-200 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Autoconhecimento
              </span> <br />
              em Poder.
            </h1>
            <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              Acesse a plataforma definitiva de Eneagrama. Descrições claras, práticas e transformadoras para alavancar sua carreira e liderança.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold text-lg shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform duration-300 hover:shadow-amber-500/40">
                INICIAR AVALIAÇÃO
              </button>
              <button className="px-8 py-4 rounded-lg border border-gray-700 text-white font-semibold hover:bg-white/5 transition-all duration-300">
                Saiba Mais
              </button>
            </div>
          </div>

          {/* Elemento Visual Abstrato (Representando o Mindset) */}
          <div className="w-full lg:w-2/5 mt-16 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-80 h-80 lg:w-[500px] lg:h-[500px]">
               {/* Círculos concêntricos animados simulando o Eneagrama/Alvo */}
               <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
               <div className="absolute inset-8 border border-amber-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
               <div className="absolute inset-16 border border-white/5 rounded-full"></div>
               
               {/* Imagem Central com máscara */}
               <div className="absolute inset-10 rounded-full overflow-hidden border-2 border-amber-500/50 shadow-[0_0_50px_rgba(217,119,6,0.3)]">
                  <img 
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop" 
                    alt="Business Mindset" 
                    className="w-full h-full object-cover opacity-80 grayscale hover:grayscale-0 transition-all duration-700"
                  />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. VALOR ESTRATÉGICO (Clean & Minimal) --- */}
      <section id="valor-do-perfil" className="py-32 bg-neutral-50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">O Direcionamento Real para Sua Evolução.</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Foco e Clareza', desc: 'Trace metas de carreira assertivas.', icon: 'fa-bullseye' },
              { title: 'Forças Reais', desc: 'Potencialize seu desempenho natural.', icon: 'fa-bolt' },
              { title: 'Desbloqueio', desc: 'Mapeie limitações que impedem o crescimento.', icon: 'fa-lock-open' },
              { title: 'Plano Prático', desc: 'Orientações reais, sem misticismo.', icon: 'fa-road' }
            ].map((item, idx) => (
              <div key={idx} className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                  <i className={`fas ${item.icon} text-2xl text-amber-600 group-hover:text-white transition-colors`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. CORPORATE SECTION (Dark & Premium) --- */}
      <section id="corporate" className="py-32 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-800/50 -skew-x-12 translate-x-20"></div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          
          <div className="w-full lg:w-1/2">
            <span className="text-amber-400 font-bold tracking-widest uppercase text-xs mb-2 block">Para Empresas</span>
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Alta Performance <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-600">Corporativa</span>
            </h3>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Não é apenas sobre entender pessoas, é sobre alocar talentos e reter líderes. Utilize o Eneagrama como ferramenta estratégica de gestão.
            </p>
            
            <div className="space-y-4 mb-10">
              {['Visão 360º da Equipe', 'Comunicação Interna Otimizada', 'Retenção de Talentos'].map((feat, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <i className="fas fa-check text-xs"></i>
                  </div>
                  <span className="text-gray-300 font-medium">{feat}</span>
                </div>
              ))}
            </div>

            <a href="#" className="inline-flex items-center text-amber-400 font-bold border-b border-amber-400/30 pb-1 hover:text-white hover:border-white transition-all">
              Solicitar Demo para RH <i className="fas fa-arrow-right ml-2"></i>
            </a>
          </div>

          {/* Card Visual do Processo */}
          <div className="w-full lg:w-5/12 bg-neutral-800/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
            <h4 className="text-xl font-semibold mb-8 text-center">O Processo Simplificado</h4>
            <div className="space-y-8 relative">
              {/* Linha conectora vertical */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-700"></div>
              
              {['Cadastro Rápido', 'Questionário Inteligente', 'Relatório Estratégico'].map((step, index) => (
                <div key={index} className="relative flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-amber-500 z-10 flex items-center justify-center text-amber-500 font-bold text-sm shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    {index + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-white">{step}</h5>
                    <p className="text-xs text-gray-500 mt-1">Etapa {index + 1} de 3</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. CTA FINAL --- */}
      <section className="py-24 bg-black text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black"></div>
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Pronto para mudar sua trajetória?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Aproxime-se da nossa metodologia e comece sua evolução hoje.
            </p>
            <button className="px-10 py-5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              GARANTIR MEU RELATÓRIO
            </button>
         </div>
      </section>

      {/* Footer simples */}
      <footer className="bg-neutral-950 py-8 text-center text-gray-600 text-sm border-t border-white/5">
        <p>&copy; 2025 Faces da Personalidade. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;