import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InventoryListing from './pages/InventoryListing';
import StockIntelligence from './pages/StockIntelligence';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import Forecasting from './pages/Forecasting';
import Settings from './pages/Settings';
import StockSenseAI from './pages/StockSenseAI';
import './index.css';

const routeTitleMap = {
  '/': 'Dashboard',
  '/inventory': 'Inventory',
  '/stock-intelligence': 'Stock Intelligence',
  '/analytics': 'Analytics',
  '/forecasting': 'Forecasting',
  '/settings': 'Settings',
  '/stock-ai': 'StockSense AI',
};

function RouteTitleSetter({ setCurrentPage }) {
  const location = useLocation();

  useEffect(() => {
    setCurrentPage(routeTitleMap[location.pathname] || 'Dashboard');
  }, [location.pathname, setCurrentPage]);

  return null;
}

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');

  return (
    <Router>
      <RouteTitleSetter setCurrentPage={setCurrentPage} />
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Navbar currentPage={currentPage} />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryListing />} />
              <Route path="/stock-intelligence" element={<StockIntelligence />} />
              <Route path="/analytics" element={<PerformanceAnalytics />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stock-ai" element={<StockSenseAI />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
