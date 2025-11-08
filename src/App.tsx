import { useState, useEffect } from 'react'
import { BudgetCalculator } from './components/BudgetCalculator'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Clients } from './components/Clients'
import { Profile } from './components/Profile'
import { MakeQuote } from './components/MakeQuote'
import { Settings } from './components/Settings'
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
    
    // Se retornou do pagamento, redirecionar para o perfil
    if (path.includes('/payment/') || urlParams.has('payment_id') || urlParams.has('collection_status')) {
      // Limpar URL
      window.history.replaceState({}, document.title, '/');
      
      // Atualizar perfil
      if (currentUser) {
        refreshUserProfile();
        
        // Redirecionar para perfil após 1 segundo
        setTimeout(() => {
          setActiveTab('profile');
          alert('Pagamento processado! Aguarde alguns segundos para ver sua assinatura ativada.');
        }, 1000);
      }
    }
  }, [currentUser, refreshUserProfile]);

  // Sincronizar quotes do Firebase com o estado local
  useEffect(() => {
    if (userProfile) {
      setQuotes(userProfile.quotes || [])
    }
  }, [userProfile])

  const handleSaveQuote = async (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => {
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
