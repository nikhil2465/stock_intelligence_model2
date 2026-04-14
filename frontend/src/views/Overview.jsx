import React, { useEffect, useRef } from 'react';
import { MONTHS, baseOpts, scaleXY, createChart } from '../utils/chartHelpers';

const KPI1 = [
  { cls: 'sg', label: 'Revenue MTD', conf: '96%', val: '₹28.4L', delta: '▲ 9.2% vs last month', deltaClass: 'up', sub: 'YTD: ₹2.84 Cr · Target: ₹3.0 Cr', bar: 78, barColor: 'var(--g2)', q: 'Why is revenue up 9.2% this month? What are the main drivers?' },
  { cls: 'sg', label: 'Gross Margin', conf: '93%', val: '22.4%', delta: '▲ 1.1% vs last month', deltaClass: 'up', sub: 'BWP grades highest · MR grades lowest', bar: 65, barColor: 'var(--g2)', q: 'What is my gross margin this month and which products have the highest margin?' },
  { cls: 'sa', label: 'Dead Stock Value', conf: '98%', val: '₹4.2L', delta: '▲ +₹0.8L this month', deltaClass: 'wn', sub: '3 SKUs · 90+ days unsold', bar: 62, barColor: 'var(--a2)', q: 'I have dead stock worth ₹4.2L. Which SKUs are these and what should I do?' },
  { cls: 'sr', label: 'Outstanding Receivable', conf: '95%', val: '₹12.8L', delta: '▼ 4 overdue accounts', deltaClass: 'dn', sub: 'Oldest: 78 days · High risk', bar: 72, barColor: 'var(--r2)', q: 'Why is my outstanding receivable high? Which customers owe the most?' },
  { cls: 'sb', label: 'Orders Today', conf: '99%', val: '24', delta: '▲ 6 vs yesterday', deltaClass: 'up', sub: '18 dispatched · 6 pending', bar: 82, barColor: 'var(--b2)', q: 'How many orders did I receive today vs target? Which orders are pending?' },
  { cls: 'sp', label: 'Low Stock Alerts', conf: '99%', val: '7 SKUs', delta: '▼ Below reorder level', deltaClass: 'dn', sub: '18mm BWP critical · Order now', bar: 45, barColor: 'var(--p2)', q: 'Which products are running low on stock and need to be reordered?' },
];

const KPI2 = [
  { cls: 'st', label: 'Working Capital Days', conf: 'AI', val: '48 days', delta: '▲ DIO 22 + DSO 34 − DPO 8', deltaClass: 'wn', sub: 'Target: <40d · Cash stuck longer', q: 'What is my working capital cycle in days?' },
  { cls: 'sg', label: 'Inventory Accuracy', conf: '97%', val: '96.8%', delta: '▲ Book vs Physical match', deltaClass: 'up', sub: 'Last audit: 3 days ago', q: 'What is my inventory accuracy after last audit?' },
  { cls: 'so', label: 'ABC Classification', conf: 'AI', val: 'A: 4 SKUs', delta: '▲ 78% revenue from 20% SKUs', deltaClass: 'up', sub: 'B: 8 · C: 30 · Focus on A', q: 'Show me ABC classification of my SKUs' },
  { cls: 'sa', label: 'At-Risk Customers', conf: '88%', val: '8 accounts', delta: '▼ No order 30+ days', deltaClass: 'dn', sub: 'Combined value: ₹6.4L/mo', q: 'Which customers havent ordered in a long time and are at risk of churning?' },
  { cls: 'si', label: 'Stock Turnover', conf: '92%', val: '4.2×', delta: '▲ 0.3× vs last month', deltaClass: 'up', sub: '18mm BWP: 6.8× · Best mover', q: 'What is my stock turnover ratio and which SKUs turn fastest?' },
  { cls: 'sb', label: 'GMROI', conf: 'AI', val: '₹1.98', delta: '▲ ₹1.98 gross margin per ₹1 stock', deltaClass: 'up', sub: 'Target: >₹2.0 · Fix dead stock', q: 'What is my GMROI and how can I improve it?' },
];

export default function Overview({ onGoChat }) {
  const revRef = useRef(null);
  const donutRef = useRef(null);
  const custTypeRef = useRef(null);

  useEffect(() => {
    const d1 = createChart(revRef, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [
          { data: [19.2, 20.1, 21.4, 22.8, 21.6, 20.4, 22.1, 23.8, 24.4, 25.2, 26.0, 28.4], borderColor: '#0f766e', backgroundColor: '#0f766e12', borderWidth: 2.5, tension: .4, pointRadius: 0, fill: true, label: 'Revenue' },
          { data: [21, 21.5, 22, 22.5, 23, 23.5, 24, 24.5, 25, 25.5, 26, 26.5], borderColor: '#d97706', borderWidth: 1.5, borderDash: [5, 4], tension: .4, pointRadius: 0, label: 'Target' },
          { data: [4.1, 4.4, 4.6, 5.0, 4.8, 4.2, 4.8, 5.4, 5.5, 5.7, 5.8, 6.36], borderColor: '#2563eb', backgroundColor: '#2563eb08', borderWidth: 2, tension: .4, pointRadius: 0, label: 'Gross Profit' },
        ],
      },
      options: baseOpts({ scales: scaleXY(v => '₹' + v + 'L') }),
    });
    const d2 = createChart(donutRef, {
      type: 'doughnut',
      data: { labels: ['BWP', 'MR', 'Commercial', 'Laminates', 'Others'], datasets: [{ data: [38, 28, 18, 11, 5], backgroundColor: ['#0f766e', '#2563eb', '#d97706', '#9333ea', '#9ca3af'], borderWidth: 0, hoverOffset: 6 }] },
      options: baseOpts({ cutout: '70%' }),
    });
    const d3 = createChart(custTypeRef, {
      type: 'doughnut',
      data: { labels: ['Contractors', 'Interior Firms', 'Retailers', 'Carpenters'], datasets: [{ data: [44, 26, 18, 12], backgroundColor: ['#0f766e', '#2563eb', '#d97706', '#ea580c'], borderWidth: 0, hoverOffset: 6 }] },
      options: baseOpts({ cutout: '70%' }),
    });
    return () => { d1(); d2(); d3(); };
  }, []);

  return (
    <div className="view">
      <div className="src-banner">
        <div className="src-icon">API</div>
        <div className="src-text"><strong>StockSense AI reads directly from your Dealer Management System (DMS).</strong> All numbers below are pulled live from your existing inventory, billing, and order software — no manual entry required.</div>
        <div className="src-dots">
          {['Inventory', 'Billing', 'Orders', 'Purchases'].map(l => (
            <div key={l} className="src-dot"><span className="dot dg"></span>{l}</div>
          ))}
        </div>
      </div>

      <div className="ai-banner">
        <div className="ai-ic">AI</div>
        <div className="ai-b">
          <div className="ai-lbl">AI Daily Brief — Demo: Plywood Dealer Data · Any industry supported · Updated 08:00 AM</div>
          <div className="ai-txt">
            <strong>Revenue up 9.2% this month</strong> — 18mm BWP and 12mm MR are your top movers. <strong>Dead stock worth ₹4.2L</strong> sitting unsold for 90+ days — 3 SKUs identified for urgent action.
            <strong> Customer "City Interiors" hasn't ordered in 47 days</strong> — at-risk account worth ₹1.8L/month. <strong>Supplier "Gauri Laminates" has delayed 2 deliveries</strong> this month — consider alternate sourcing for 8mm boards.
          </div>
        </div>
        <div className="ai-ts">Today<br />08:00 AM</div>
      </div>

      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: 'var(--mono)', marginBottom: '7px' }}>
        Today's Business Health — Click any tile for AI explanation
      </div>
      <div className="kg g6">
        {KPI1.map(k => (
          <div key={k.label} className={`kc ${k.cls}`} onClick={() => onGoChat(k.q)} style={{ cursor: 'pointer' }}>
            <div className="kt"><div className="kl">{k.label}</div><span className="kconf">{k.conf}</span></div>
            <div className="kv">{k.val}</div>
            <div className={`kd ${k.deltaClass}`}>{k.delta}</div>
            <div className="ks">{k.sub}</div>
            <div className="kbar"><div className="kbf" style={{ width: `${k.bar}%`, background: k.barColor }}></div></div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: 'var(--mono)', marginBottom: '7px' }}>
        Dealership Operations KPIs · <span style={{ color: 'var(--g2)' }}>AI-Enhanced · Beyond Tally & Vyapar</span>
      </div>
      <div className="kg g6">
        {KPI2.map(k => (
          <div key={k.label} className={`kc ${k.cls}`} onClick={() => onGoChat(k.q)} style={{ cursor: 'pointer' }}>
            <div className="kt"><div className="kl">{k.label}</div><span className="kconf">{k.conf}</span></div>
            <div className="kv">{k.val}</div>
            <div className={`kd ${k.deltaClass}`}>{k.delta}</div>
            <div className="ks">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="gl g75">
        <div className="card">
          <div className="ch"><div><div className="ctit">Revenue Trend — Last 12 Months</div><div className="csub">₹ Lakhs · From your billing system</div></div><span className="bdg bg">FROM DMS</span></div>
          <div style={{ height: '210px', position: 'relative' }}><canvas ref={revRef}></canvas></div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
            {[['#0f766e', 'Revenue'], ['#d97706', 'AI Target'], ['#2563eb', 'Gross Profit']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text2)' }}>
                <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: c, display: 'inline-block' }}></span>{l}
              </span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">AI Alerts — Action Required</div><span className="bdg br">5 Active</span></div>
          <div className="ilist">
            {[
              ['icr', '!', '₹4.2L Dead Stock — 3 SKUs Stagnant 90+ Days', '6mm Gurjan (₹1.8L), 4mm MR plain (₹1.4L), 19mm commercial (₹1.0L). AI recommends discounting or returning to supplier.', 'STOCK AGEING · IMMEDIATE ACTION · HIGH IMPACT'],
              ['ica', '!', 'City Interiors — 47 Days No Order (₹1.8L/mo Account)', 'Was ordering weekly. Sudden silence. AI suggests competitor may have offered better credit terms. Call needed.', 'CUSTOMER CHURN RISK · HIGH VALUE · ACT NOW'],
              ['icr', '!', 'Gauri Laminates — 2 Delivery Delays This Month', '8mm flexi boards delayed 8 and 12 days. Orders pending. Evaluate alternate supplier.', 'SUPPLIER RISK · AFFECTING FULFILMENT'],
              ['ica', '₹', '18mm BWP Stock at 8 Days — Reorder Now', 'Current stock: 140 sheets. Daily sale: 17 sheets. Stockout in 8 days. Lead time 6 days.', 'CRITICAL REORDER · ORDER TODAY'],
            ].map(([icCls, icon, title, desc, meta]) => (
              <div key={title} className="ii">
                <div className={`iic ${icCls}`}>{icon}</div>
                <div><div className="iti">{title}</div><div className="ide">{desc}</div><div className="imt">{meta}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gl g333">
        <div className="card">
          <div className="ch"><div className="ctit">Revenue by Product Grade</div><div className="csub">MTD contribution %</div></div>
          <div style={{ height: '155px', position: 'relative' }}><canvas ref={donutRef}></canvas></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '7px' }}>
            {[['#0f766e', 'BWP 38%'], ['#2563eb', 'MR 28%'], ['#d97706', 'Commercial 18%'], ['#9333ea', 'Laminates 11%'], ['#9ca3af', 'Others 5%']].map(([c, l]) => (
              <span key={l} style={{ fontSize: '10px', color: 'var(--text3)' }}><span style={{ color: c, fontWeight: 700 }}>■</span> {l}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">Revenue by Customer Type</div><div className="csub">Who's buying from you</div></div>
          <div style={{ height: '155px', position: 'relative' }}><canvas ref={custTypeRef}></canvas></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '7px' }}>
            {[['#0f766e', 'Contractors 44%'], ['#2563eb', 'Interior Firms 26%'], ['#d97706', 'Retailers 18%'], ['#9333ea', 'Carpenters 12%']].map(([c, l]) => (
              <span key={l} style={{ fontSize: '10px', color: 'var(--text3)' }}><span style={{ color: c, fontWeight: 700 }}>■</span> {l}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">Top 5 Selling SKUs Today</div><div className="csub">Sheets sold</div></div>
          <div className="rlist">
            {[['18mm BWP', 92, '#0f766e', '46 sheets', '+18%', 'up'], ['12mm MR', 76, '#2563eb', '38 sheets', '+6%', 'up'], ['12mm BWP', 62, '#0f766e', '31 sheets', '+9%', 'up'], ['18mm MR', 48, '#d97706', '24 sheets', '0%', 'fl'], ['Laminates', 36, '#9333ea', '18 sheets', '-4%', 'dn']].map(([n, w, c, v, d, dc]) => (
              <div key={n} className="rrow">
                <span className="rn">{n}</span>
                <div className="rbw"><div className="rbf" style={{ width: `${w}%`, background: c }}></div></div>
                <span className="rv">{v}</span>
                <span className={`rd ${dc}`}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
