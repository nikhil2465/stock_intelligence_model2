import React, { useState } from 'react';

const CUSTS = [
  { n: 'Mehta Constructions', t: 'Contractor', r: '₹3.8L', sc: 92, mg: '19.2%', lo: '2 days ago', dso: 18, out: '₹0', st: 'top' },
  { n: 'City Interiors', t: 'Interior Firm', r: '₹2.4L', sc: 88, mg: '28.4%', lo: '47 days ago', dso: 24, out: '₹0', st: 'risk' },
  { n: 'Kumar & Sons', t: 'Retailer', r: '₹2.1L', sc: 85, mg: '21.8%', lo: '3 days ago', dso: 22, out: '₹0.4L', st: 'top' },
  { n: 'Sharma Constructions', t: 'Contractor', r: '₹1.8L', sc: 42, mg: '14.2%', lo: '10 days ago', dso: 78, out: '₹3.4L', st: 'overdue' },
  { n: 'Design Studio Patel', t: 'Interior Firm', r: '₹1.6L', sc: 91, mg: '31.2%', lo: '1 day ago', dso: 14, out: '₹0', st: 'top' },
  { n: 'Raj Carpentry Works', t: 'Carpenter', r: '₹0.9L', sc: 76, mg: '22.1%', lo: '8 days ago', dso: 12, out: '₹0', st: 'ok' },
  { n: 'Gupta Materials Retail', t: 'Retailer', r: '₹0.8L', sc: 48, mg: '18.4%', lo: '38 days ago', dso: 44, out: '₹2.1L', st: 'risk' },
  { n: 'Royal Interiors', t: 'Interior Firm', r: '₹0.6L', sc: 62, mg: '26.8%', lo: '5 days ago', dso: 20, out: '₹0', st: 'ok' },
];

export default function Customers() {
  const [filter, setFilter] = useState('all');
  const list = filter === 'all' ? CUSTS
    : filter === 'top' ? CUSTS.filter(c => c.st === 'top')
    : filter === 'risk' ? CUSTS.filter(c => c.st === 'risk')
    : CUSTS.filter(c => c.st === 'overdue');

  return (
    <div className="view">
      <div className="ph">
        <div className="pg">Customer Intelligence — Know Every Account</div>
        <div className="psub">Payment behaviour · At-risk accounts · Margin by customer · Discount leakage</div>
      </div>

      <div className="kg g4">
        {[
          { cls: 'sg', l: 'Active Customers', v: '148', d: '▲ 12 new this month', s: '148 buying accounts' },
          { cls: 'sa', l: 'At-Risk Accounts', v: '8', d: '▼ No order 30+ days', s: 'Combined ₹6.4L/mo at risk' },
          { cls: 'sr', l: 'Total Outstanding', v: '₹12.8L', d: '▼ 4 overdue 60d+', s: 'Sharma ₹3.4L — 78 days' },
          { cls: 'si', l: 'Best Segment', v: 'Interior Firms', d: '▲ 31% avg margin', s: '26% of customers, 38% of profit' },
        ].map(k => (
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div>
            <div className="kd wn">{k.d}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="ch">
          <div><div className="ctit">Customer Health — All Accounts</div></div>
          <div className="chip-row">
            {[['all', 'All'], ['top', 'Top Accounts'], ['risk', 'At Risk'], ['overdue', 'Overdue']].map(([f, l]) => (
              <div key={f} className={`chip${filter === f ? ' sel' : ''}`} onClick={() => setFilter(f)}>{l}</div>
            ))}
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Customer</th><th>Type</th><th>Monthly Revenue</th><th>AI Score</th>
              <th>Margin</th><th>Last Order</th><th>DSO</th><th>Outstanding</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => {
              const sc = c.st === 'top' ? 'bg' : c.st === 'risk' ? 'ba' : c.st === 'overdue' ? 'br' : 'bsl';
              const sl = c.st === 'top' ? 'TOP ACCOUNT' : c.st === 'risk' ? 'AT RISK' : c.st === 'overdue' ? 'OVERDUE' : 'ACTIVE';
              return (
                <tr key={c.n}>
                  <td style={{ fontWeight: 600 }}>{c.n}</td>
                  <td style={{ fontSize: '10px', color: 'var(--text2)' }}>{c.t}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{c.r}</td>
                  <td>
                    <div className="sbar">
                      <div className="str">
                        <div className="sf2" style={{ width: `${c.sc}%`, background: c.sc > 80 ? '#16a34a' : c.sc > 60 ? '#d97706' : '#dc2626' }}></div>
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '9px' }}>{c.sc}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: parseFloat(c.mg) > 25 ? '#16a34a' : parseFloat(c.mg) > 18 ? '#d97706' : '#dc2626' }}>{c.mg}</td>
                  <td style={{ fontSize: '11px', color: c.lo.includes('47') || c.lo.includes('38') ? '#dc2626' : c.lo.includes('10') ? '#d97706' : '#4b5563' }}>{c.lo}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: c.dso > 60 ? '#dc2626' : c.dso > 30 ? '#d97706' : '#16a34a' }}>{c.dso}d</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: c.out === '₹0' ? '#16a34a' : '#dc2626' }}>{c.out}</td>
                  <td><span className={`bdg ${sc}`}>{sl}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
