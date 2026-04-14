import React from 'react';

const NAV_ITEMS = [
  { section: 'Business Overview' },
  { id: 'overview', label: 'Business Overview', icon: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="white" opacity=".9"/><rect x="8.5" y="1" width="6.5" height="6.5" rx="1.5" fill="white" opacity=".55"/><rect x="1" y="8.5" width="6.5" height="6.5" rx="1.5" fill="white" opacity=".55"/><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.5" fill="white" opacity=".9"/></svg> },

  { section: 'Inventory & Stock' },
  { id: 'inventory', label: 'Stock Intelligence', badge: '!', badgeClass: 'nb-a', icon: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="white" strokeWidth="1.4" opacity=".9"/><path d="M4 7h8M4 10h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".8"/></svg> },
  { id: 'deadstock', label: 'Dead Stock & Ageing', badge: '3', badgeClass: 'nb-r', icon: <svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.4" opacity=".85"/><path d="M8 5v4M8 11v.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/></svg> },
  { id: 'inward', label: 'Inward & Outward', badge: 'NEW', badgeClass: 'nb-b', icon: <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v10M5 9l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/><path d="M2 14h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/></svg> },

  { section: 'Sales & Customers' },
  { id: 'sales', label: 'Sales Performance', icon: <svg viewBox="0 0 16 16" fill="none"><path d="M2 12L5.5 7L9 10L12 5L14.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/></svg> },
  { id: 'customers', label: 'Customer Intelligence', icon: <svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="white" strokeWidth="1.4" opacity=".9"/><path d="M1 13c0-2.8 2.2-5 5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".7"/><circle cx="11" cy="5" r="2.5" stroke="white" strokeWidth="1.4" opacity=".7"/><path d="M11 10c2.8 0 4 2.2 4 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".6"/></svg> },
  { id: 'orders', label: 'Orders & Fulfilment', icon: <svg viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="white" strokeWidth="1.4" opacity=".8"/><path d="M5 5h6M5 8h6M5 11h4" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".7"/></svg> },

  { section: 'Purchasing' },
  { id: 'procurement', label: 'Supplier & Procurement', icon: <svg viewBox="0 0 16 16" fill="none"><path d="M1 3h14M1 3l2 10h10L15 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".85"/><circle cx="6" cy="14" r="1" fill="white" opacity=".7"/><circle cx="10" cy="14" r="1" fill="white" opacity=".7"/></svg> },
  { id: 'pogrn', label: 'PO & GRN', badge: 'NEW', badgeClass: 'nb-b', icon: <svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="white" strokeWidth="1.3" opacity=".85"/><path d="M5 5h6M5 8h4M5 11h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity=".75"/><path d="M11 9l1.5 1.5L15 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/></svg> },
  { id: 'freight', label: 'Freight Planning', badge: 'NEW', badgeClass: 'nb-b', icon: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="7" rx="1" stroke="white" strokeWidth="1.3" opacity=".85"/><path d="M11 6h2.5l1.5 2v3h-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".8"/><circle cx="4.5" cy="12.5" r="1.5" stroke="white" strokeWidth="1.2" opacity=".9"/><circle cx="12" cy="12.5" r="1.5" stroke="white" strokeWidth="1.2" opacity=".9"/></svg> },

  { section: 'Finance' },
  { id: 'finance', label: 'Profitability & Cash', badge: '!', badgeClass: 'nb-a', icon: <svg viewBox="0 0 16 16" fill="none"><path d="M8 1v14M4 5h6a2 2 0 010 4H6a2 2 0 010 4h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".9"/></svg> },

  { section: 'Demand & Market' },
  { id: 'demand', label: 'Demand Forecasting', icon: <svg viewBox="0 0 16 16" fill="none"><path d="M2 14L5 9l3 2 3-5 3 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/></svg> },

  { section: 'AI Tools' },
  { id: 'chatbot', label: 'AI Assistant', icon: <svg viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="9.5" rx="2" stroke="white" strokeWidth="1.5" opacity=".9"/><path d="M4.5 13.5l1.5-2H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/><circle cx="5" cy="6.75" r="1" fill="white" opacity=".8"/><circle cx="8" cy="6.75" r="1" fill="white" opacity=".8"/><circle cx="11" cy="6.75" r="1" fill="white" opacity=".8"/></svg> },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="logo-area">
        <div className="logo-row">
          <div className="logo-mark">
            <svg viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" fill="#15803d"/>
              <rect x="10" y="1" width="7" height="7" rx="1.5" fill="#16a34a"/>
              <rect x="1" y="10" width="7" height="7" rx="1.5" fill="#16a34a"/>
              <rect x="10" y="10" width="7" height="7" rx="1.5" fill="#15803d"/>
            </svg>
          </div>
          <span className="logo-name">StockSense AI</span>
        </div>
        <div className="logo-tag">AI Intelligence Layer for Dealers &amp; Distributors</div>
      </div>

      <div className="nav">
        {NAV_ITEMS.map((item, idx) => {
          if (item.section) {
            return <div key={`sec-${idx}`} className="nav-sec">{item.section}</div>;
          }
          return (
            <button
              key={item.id}
              className={`ni${activeView === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.icon}
              {item.label}
              {item.badge && <span className={`nb ${item.badgeClass}`}>{item.badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="sf">
        <div className="live-r">
          <span className="dot dg"></span>
          Connected to your DMS · 4 min ago
        </div>
      </div>
    </nav>
  );
}
