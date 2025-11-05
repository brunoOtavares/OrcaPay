import { useState, useEffect } from 'react'
import { BudgetCalculator } from './components/BudgetCalculator'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { Clients } from './components/Clients'
import { Profile } from './components/Profile'
import { MakeQuote } from './components/MakeQuote'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('calc-hour')

  const renderContent = () => {
    switch (activeTab) {
      case 'calc-hour':
        return <BudgetCalculator />
      case 'budget':
        return <MakeQuote />
      case 'clients':
        return <Clients />
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
