import { useState, useEffect } from 'react'
import { BudgetCalculator } from './components/BudgetCalculator'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Clients } from './components/Clients'
import { Profile } from './components/Profile'
import { MakeQuote } from './components/MakeQuote'
import { Settings } from './components/Settings'
import { PaymentResult } from './components/PaymentResult'
import Login from './components/Login'
import Register from './components/Register'
import { LandingPage } from './components/LandingPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

export interface SavedQuote {
  id: string;
  clientName: string;
  projectType: string;
  description: string;
  deliveryDate: string;
  totalHours: number;
  finalPrice: number;
  complexity: string;
  urgency: boolean;
  commercialUse: string;
  revisions: number;
  createdAt: string;
  completed?: boolean;
  completedAt?: string;
}

function AppContent() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('calc-hour')
  const [quotes, setQuotes] = useState<SavedQuote[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showLanding, setShowLanding] = useState(!currentUser)
  const [showPaymentResult, setShowPaymentResult] = useState(false)

  // Atualiza showLanding quando o estado de autenticação mudar
  useEffect(() => {
    if (!currentUser) {
      setShowLanding(true);
    }
  }, [currentUser]);

  // Detectar retorno do pagamento do Mercado Pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    
    // Se retornou do pagamento, mostrar a página de resultado
    if (
      path.includes('/payment/') ||
      urlParams.has('payment_id') ||
      urlParams.has('collection_status') ||
      urlParams.has('payment') ||
      urlParams.has('status') ||
      path.includes('/payment')
    ) {
      setShowPaymentResult(true);
    }
  }, []);

  // Sincronizar quotes do Firebase com o estado local
  useEffect(() => {
    if (userProfile) {
      setQuotes(userProfile.quotes || [])
    }
  }, [userProfile])

  const handleSaveQuote = async (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => {
    console.log('💾 handleSaveQuote chamado');
    
    // Verificar limite de orçamentos para plano gratuito
    const isFreePlan = !userProfile?.subscription || 
                       userProfile.subscription.plan === 'free' ||
                       userProfile.subscription.status !== 'active';
    
    console.log('📋 Verificação de limite:', {
      isFreePlan,
      totalQuotes: quotes.length,
      subscription: userProfile?.subscription
    });
    
    if (isFreePlan) {
      // Contar orçamentos deste mês
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const quotesThisMonth = quotes.filter(q => {
        const quoteDate = new Date(q.createdAt);
        return quoteDate >= firstDayOfMonth;
      }).length;
      
      console.log('📅 Orçamentos este mês:', quotesThisMonth);
      
      if (quotesThisMonth >= 5) {
        console.log('🚫 BLOQUEADO - Limite atingido!');
        alert('Você atingiu o limite de 5 orçamentos no plano gratuito. Faça upgrade para continuar!');
        setActiveTab('profile'); // Redirecionar para a aba de perfil/assinaturas
        return;
      }
    }

    const newQuote: SavedQuote = {
      ...quote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    // Atualizar localmente primeiro para feedback imediato
    const updatedQuotes = [...quotes, newQuote]
    setQuotes(updatedQuotes)
    
    // Salvar no Firebase
    if (currentUser) {
      try {
        const { saveQuote } = await import('./services/firestoreService')
        await saveQuote(currentUser.uid, newQuote)
        await refreshUserProfile()
      } catch (error) {
        console.error('Erro ao salvar orçamento:', error)
      }
    }
    
    setActiveTab('clients')
  }

  const handleDeleteQuote = async (id: string) => {
    // Atualizar localmente primeiro
    const updatedQuotes = quotes.filter(q => q.id !== id)
    setQuotes(updatedQuotes)
    
    // Deletar no Firebase
    if (currentUser) {
      try {
        const { deleteQuote } = await import('./services/firestoreService')
        await deleteQuote(currentUser.uid, id)
        await refreshUserProfile()
      } catch (error) {
        console.error('Erro ao deletar orçamento:', error)
      }
    }
  }

  const handleUpdateQuote = async (id: string, updatedQuote: SavedQuote) => {
    // Atualizar localmente primeiro
    const updatedQuotes = quotes.map(q => q.id === id ? updatedQuote : q)
    setQuotes(updatedQuotes)
    
    // Atualizar no Firebase
    if (currentUser) {
      try {
        const { updateQuote } = await import('./services/firestoreService')
        await updateQuote(currentUser.uid, id, updatedQuote)
        await refreshUserProfile()
      } catch (error) {
        console.error('Erro ao atualizar orçamento:', error)
      }
    }
  }

  // Se não estiver autenticado, mostrar landing page ou login/registro
  if (!currentUser) {
    if (showLanding) {
      return (
        <LandingPage 
          onLogin={() => {
            setShowLanding(false);
            setAuthMode('login');
          }}
          onRegister={() => {
            setShowLanding(false);
            setAuthMode('register');
          }}
        />
      );
    }
    
    if (authMode === 'login') {
      return <Login onSwitchToRegister={() => setAuthMode('register')} />
    } else {
      return <Register onSwitchToLogin={() => setAuthMode('login')} />
    }
  }

  const renderContent = () => {
    // Se está retornando do pagamento, mostrar a página de resultado
    if (showPaymentResult) {
      return (
        <PaymentResult
          onBackToApp={() => {
            setShowPaymentResult(false);
            // Limpar URL
            window.history.replaceState({}, document.title, '/');
            // Atualizar perfil e redirecionar para a aba de perfil
            refreshUserProfile();
            setActiveTab('profile');
          }}
        />
      );
    }

    switch (activeTab) {
      case 'calc-hour':
        return <BudgetCalculator />
      case 'budget':
        return <MakeQuote onSaveQuote={handleSaveQuote} />
      case 'clients':
        return <Clients quotes={quotes} onDeleteQuote={handleDeleteQuote} onUpdateQuote={handleUpdateQuote} />
      case 'profile':
        return <Profile />
      case 'settings':
        return <Settings />
      default:
        return <BudgetCalculator />
    }
  }

  return (
    <div className="app">
      {/* Menu Hamburguer para Mobile */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Overlay para fechar sidebar no mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab)
          setSidebarOpen(false)
        }} 
        isOpen={sidebarOpen}
      />
      <div className="main-content">
        <Header activeTab={activeTab} />
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

// Wrapper principal com AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
