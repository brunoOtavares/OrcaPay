import { useState } from 'react';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className={styles.landing}>
      {/* Header/Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <span className={styles.logoText}>CálculoCerto</span>
          </div>

          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksOpen : ''}`}>
            <a onClick={() => scrollToSection('features')}>Recursos</a>
            <a onClick={() => scrollToSection('how-it-works')}>Como Funciona</a>
            <a onClick={() => scrollToSection('pricing')}>Preços</a>
            <a onClick={() => scrollToSection('testimonials')}>Depoimentos</a>
            <button className={styles.loginBtn} onClick={onLogin}>Entrar</button>
            <button className={styles.signupBtn} onClick={onRegister}>Cadastrar</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>
              Calcule o <span className={styles.highlight}>Valor Certo</span> dos Seus Projetos
            </h1>
            <p className={styles.heroDescription}>
              Pare de cobrar menos do que merece! O CálculoCerto é a ferramenta definitiva 
              para freelancers e agências calcularem orçamentos precisos e lucrativos.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.ctaPrimary} onClick={onRegister}>
                Começar Grátis
              </button>
              <button className={styles.ctaSecondary} onClick={() => scrollToSection('how-it-works')}>
                Ver Como Funciona
              </button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>+1000</span>
                <span className={styles.statLabel}>Usuários Ativos</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>+5000</span>
                <span className={styles.statLabel}>Orçamentos Criados</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>95%</span>
                <span className={styles.statLabel}>Satisfação</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.mockupCard}>
              <div className={styles.mockupHeader}>
                <span className={styles.mockupDot}></span>
                <span className={styles.mockupDot}></span>
                <span className={styles.mockupDot}></span>
              </div>
              <div className={styles.mockupContent}>
                <div className={styles.mockupRow}>
                  <span>Projeto Web Design</span>
                  <span className={styles.mockupPrice}>R$ 2.500,00</span>
                </div>
                <div className={styles.mockupRow}>
                  <span>Logo + Identidade Visual</span>
                  <span className={styles.mockupPrice}>R$ 980,00</span>
                </div>
                <div className={styles.mockupRow}>
                  <span>Landing Page</span>
                  <span className={styles.mockupPrice}>R$ 500,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Tudo que Você Precisa em um Só Lugar</h2>
          <p>Ferramentas profissionais para calcular, gerenciar e lucrar mais</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>Cálculo de Valor/Hora</h3>
            <p>Descubra quanto vale sua hora considerando todos os seus custos fixos, variáveis e margem de lucro desejada.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Orçamentos Inteligentes</h3>
            <p>Crie orçamentos profissionais com ajustes automáticos de complexidade, urgência e uso comercial.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Gestão de Clientes</h3>
            <p>Organize todos os seus projetos, acompanhe status e mantenha histórico completo de cada cliente.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Relatórios e Métricas</h3>
            <p>Visualize estatísticas dos seus projetos, faturamento total e projetos concluídos em tempo real.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Configurações Personalizadas</h3>
            <p>Ajuste multiplicadores de complexidade e urgência de acordo com seu mercado e experiência.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Salvamento na Nuvem</h3>
            <p>Seus dados sempre seguros e acessíveis de qualquer dispositivo com sincronização em tempo real.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <h2>Como Funciona?</h2>
          <p>3 passos simples para nunca mais errar um orçamento</p>
        </div>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Calcule Seu Valor/Hora</h3>
            <p>Adicione todos os seus custos mensais (aluguel, internet, ferramentas) e defina quantas horas trabalha por mês. O sistema calcula automaticamente seu valor/hora ideal.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Crie Orçamentos Precisos</h3>
            <p>Informe o tempo estimado para cada etapa do projeto. O sistema aplica automaticamente os multiplicadores de complexidade e urgência.</p>
          </div>
          <div className={styles.stepArrow}>→</div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Gerencie e Lucre</h3>
            <p>Acompanhe todos os projetos, marque como concluídos e visualize seu faturamento total. Simples assim!</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHeader}>
          <h2>Planos e Preços</h2>
          <p>Escolha o plano ideal para você</p>
        </div>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3>Grátis</h3>
            <div className={styles.price}>
              <span className={styles.priceValue}>R$ 0</span>
              <span className={styles.pricePeriod}>/mês</span>
            </div>
            <ul className={styles.featuresList}>
              <li>Cálculo de valor/hora</li>
              <li>Até 5 orçamentos/mês</li>
              <li>Gestão básica de clientes</li>
              <li>Salvamento na nuvem</li>
              <li>Suporte por email</li>
            </ul>
            <button className={styles.pricingBtn} onClick={onRegister}>Começar Grátis</button>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <div className={styles.badge}>Mais Popular</div>
            <h3>Pro</h3>
            <div className={styles.price}>
              <span className={styles.priceValue}>R$ 19,99</span>
              <span className={styles.pricePeriod}>/mês</span>
            </div>
            <ul className={styles.featuresList}>
              <li>Tudo do plano Grátis</li>
              <li>Orçamentos ilimitados</li>
              <li>Relatórios avançados</li>
              <li>Exportação em PDF</li>
              <li>Suporte prioritário</li>
              <li>Sem marca d'água</li>
            </ul>
            <button className={styles.pricingBtnFeatured} onClick={onRegister}>Escolher Pro</button>
          </div>
          <div className={`${styles.pricingCard} ${styles.pricingCardDisabled}`}>
            <div className={styles.badge}>Em Construção</div>
            <h3>Agência</h3>
            <div className={styles.price}>
              <span className={styles.priceValue}>R$ 99,99</span>
              <span className={styles.pricePeriod}>/mês</span>
            </div>
            <ul className={styles.featuresList}>
              <li>Tudo do plano Pro</li>
              <li>Múltiplos usuários</li>
              <li>Marca personalizada</li>
              <li>API de integração</li>
              <li>Suporte 24/7</li>
              <li>Treinamento incluído</li>
            </ul>
            <button className={styles.pricingBtn} disabled style={{opacity: 0.6, cursor: 'not-allowed'}}>Em Construção</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className={styles.testimonials}>
        <div className={styles.sectionHeader}>
          <h2>O Que Dizem Nossos Usuários</h2>
          <p>Milhares de profissionais já transformaram seus negócios</p>
        </div>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <p>"Antes eu cobrava no achismo e muitas vezes saía no prejuízo. Com o CálculoCerto aprendi a valorizar meu trabalho e meu faturamento aumentou 40%!"</p>
            <div className={styles.author}>
              <div className={styles.authorAvatar}>M</div>
              <div>
                <strong>Maria Silva</strong>
                <span>Designer Freelancer</span>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <p>"Ferramenta indispensável! Consegui organizar todos os meus projetos e agora tenho visibilidade total do meu negócio. Super recomendo!"</p>
            <div className={styles.author}>
              <div className={styles.authorAvatar}>J</div>
              <div>
                <strong>João Santos</strong>
                <span>Desenvolvedor Web</span>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <p>"Simplesmente perfeito! Interface limpa, fácil de usar e os cálculos são muito precisos. Minha agência não vive mais sem!"</p>
            <div className={styles.author}>
              <div className={styles.authorAvatar}>A</div>
              <div>
                <strong>Ana Costa</strong>
                <span>Diretora Criativa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <h2>Pronto Para Cobrar o Que Você Merece?</h2>
        <p>Comece agora mesmo e transforme a forma como você precifica seus projetos</p>
        <button className={styles.ctaFinalBtn} onClick={onRegister}>
          Criar Conta Grátis
        </button>
        <span className={styles.ctaNote}>Não precisa cartão de crédito • Configuração em 2 minutos</span>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>CálculoCerto</h4>
            <p>A forma inteligente de precificar projetos criativos e digitais.</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Produto</h4>
            <a onClick={() => scrollToSection('features')}>Recursos</a>
            <a onClick={() => scrollToSection('pricing')}>Preços</a>
            <a onClick={() => scrollToSection('how-it-works')}>Como Funciona</a>
          </div>
          <div className={styles.footerSection}>
            <h4>Empresa</h4>
            <a href="#">Sobre Nós</a>
            <a href="#">Blog</a>
            <a href="#">Contato</a>
          </div>
          <div className={styles.footerSection}>
            <h4>Legal</h4>
            <a href="#">Termos de Uso</a>
            <a href="#">Privacidade</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 CálculoCerto. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
