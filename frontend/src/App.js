import React, { useState, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './views/Overview';
import Inventory from './views/Inventory';
import DeadStock from './views/DeadStock';
import Inward from './views/Inward';
import Sales from './views/Sales';
import Customers from './views/Customers';
import Orders from './views/Orders';
import Procurement from './views/Procurement';
import POGRN from './views/POGRN';
import Freight from './views/Freight';
import Finance from './views/Finance';
import Demand from './views/Demand';
import AIAssistant from './views/AIAssistant';

const VIEW_TITLES = {
  overview: 'Business Overview — AI Intelligence Dashboard',
  inventory: 'Stock Intelligence — AI Inventory Analysis',
  deadstock: 'Dead Stock & Ageing — Cash Recovery Plan',
  inward: 'Inward & Outward — Stock Movement Intelligence',
  sales: 'Sales Performance — Revenue & Margin Intelligence',
  customers: 'Customer Intelligence — Know Every Account',
  orders: 'Orders & Fulfilment Intelligence',
  procurement: 'Supplier & Procurement Intelligence',
  pogrn: 'PO & GRN — End-to-End Procurement Lifecycle',
  freight: 'Freight Planning — AI-Optimized Logistics',
  finance: 'Profitability & Cash Intelligence — Owner View',
  demand: 'Demand Forecasting — What Will Sell Next?',
  chatbot: 'AI Assistant — Ask Anything About Your Business',
};

export default function App() {
  const [activeView, setActiveView] = useState('overview');
  const [period, setPeriod] = useState('Today');
  const [pendingChatQuery, setPendingChatQuery] = useState('');

  const goChat = useCallback((query) => {
    setPendingChatQuery(query);
    setActiveView('chatbot');
  }, []);

  const clearPendingQuery = useCallback(() => setPendingChatQuery(''), []);

  return (
    <div>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <Topbar title={VIEW_TITLES[activeView]} period={period} onPeriodChange={setPeriod} />
      <main className="main">
        {activeView === 'overview'     && <Overview onGoChat={goChat} />}
        {activeView === 'inventory'    && <Inventory onGoChat={goChat} />}
        {activeView === 'deadstock'    && <DeadStock />}
        {activeView === 'inward'       && <Inward />}
        {activeView === 'sales'        && <Sales />}
        {activeView === 'customers'    && <Customers />}
        {activeView === 'orders'       && <Orders />}
        {activeView === 'procurement'  && <Procurement />}
        {activeView === 'pogrn'        && <POGRN />}
        {activeView === 'freight'      && <Freight />}
        {activeView === 'finance'      && <Finance />}
        {activeView === 'demand'       && <Demand />}
        {activeView === 'chatbot'      && (
          <AIAssistant
            pendingQuery={pendingChatQuery}
            onPendingQueryConsumed={clearPendingQuery}
          />
        )}
      </main>
    </div>
  );
}
