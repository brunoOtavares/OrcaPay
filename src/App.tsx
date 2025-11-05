import { useState, useEffect } from 'react'
import { BudgetCalculator } from './components/BudgetCalculator'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Clients } from './components/Clients'
import { Profile } from './components/Profile'
import { MakeQuote } from './components/MakeQuote'
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
}

function App() {
  const [activeTab, setActiveTab] = useState('calc-hour')
  const [quotes, setQuotes] = useState<SavedQuote[]>([])

  useEffect(() => {
    const savedQuotes = localStorage.getItem('orcapay_quotes')
    if (savedQuotes) {
      setQuotes(JSON.parse(savedQuotes))
    }
  }, [])

  const handleSaveQuote = (quote: Omit<SavedQuote, 'id' | 'createdAt'>) => {
    const newQuote: SavedQuote = {
      ...quote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    const updatedQuotes = [...quotes, newQuote]
    setQuotes(updatedQuotes)
    localStorage.setItem('orcapay_quotes', JSON.stringify(updatedQuotes))
    setActiveTab('clients')
  }

  const handleDeleteQuote = (id: string) => {
    const updatedQuotes = quotes.filter(q => q.id !== id)
    setQuotes(updatedQuotes)
    localStorage.setItem('orcapay_quotes', JSON.stringify(updatedQuotes))
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'calc-hour':
        return <BudgetCalculator />
      case 'budget':
        return <MakeQuote onSaveQuote={handleSaveQuote} />
      case 'clients':
        return <Clients quotes={quotes} onDeleteQuote={handleDeleteQuote} />
      case 'profile':
        return <Profile />
      default:
        return <BudgetCalculator />
    }
  }

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        <Header activeTab={activeTab} />
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default App
