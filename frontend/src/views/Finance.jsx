import React, { useEffect, useRef, useState } from 'react';
import { createChart, baseOpts } from '../utils/chartHelpers';

export default function Finance() {
  const mRef = useRef(null), cfRef = useRef(null);
  const [disc, setDisc] = useState(4.8);

  useEffect(() => {
    const d1 = createChart(mRef, {
      type: 'bar',
      data: {
        labels: ['18mm BWP', '12mm BWP', '10mm Flexi', 'Laminates', '18mm MR', '12mm MR', 'Commercial', 'Dead Stock'],
        datasets: [{
          data: [28.4, 25.6, 24.1, 22.8, 19.6, 17.4, 8.2, -12],
          backgroundColor: (ctx) => ctx.raw < 0 ? '#dc2626aa' : ctx.raw > 25 ? '#0f766ecc' : ctx.raw > 20 ? '#16a34acc' : '#d97706cc',
          borderWidth: 0, borderRadius: 3
        }]
      },
      options: baseOpts({ scales: { x: { grid: { color: '#e2e6ec' }, ticks: { color: '#4b5563', font: { size: 9 } } }, y: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' }, callback: v => v + '%' } } } })
    });
    const d2 = createChart(cfRef, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          { label: 'Collections', data: [18.4, 21.2, 19.8, 22.4, 24.1, 26.8], backgroundColor: '#16a34acc', borderRadius: 3, borderWidth: 0 },
          { label: 'Purchases', data: [16.2, 19.4, 18.1, 20.8, 22.4, 24.2], backgroundColor: '#2563ebaa', borderRadius: 3, borderWidth: 0 }
        ]
      },
      options: baseOpts({
        scales: {
          x: { grid: { display: false }, ticks: { color: '#4b5563', font: { size: 10 } } },
          y: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' }, callback: v => '₹' + v + 'L' } }
        },
        plugins: { legend: { display: true, position: 'top', labels: { font: { size: 10, family: 'JetBrains Mono' }, padding: 12, boxWidth: 12, color: '#4b5563' } } }
      })
    });
    return () => { d1(); d2(); };
  }, []);

  const baseRev = 28.4, baseProfit = 6.36;
  const savedDisc = (4.8 - disc) / 100 * baseRev;
  const newProfit = (baseProfit + savedDisc).toFixed(2);
  const newMargin = ((newProfit / baseRev) * 100).toFixed(1);
  const gain = (newProfit - baseProfit).toFixed(2);

  return (
    <div className="view">
      <div className="ph">
        <div className="pg">Profitability &amp; Cash Intelligence — Owner View</div>
        <div className="psub">True profit by product · Cash flow · Receivables · What's actually in your pocket</div>
      </div>

      <div className="kg g5">
        {[
          { cls: 'sg', l: 'Gross Revenue MTD', v: '₹28.4L', d: '▲ 9.2% MoM', s: 'YTD: ₹2.84 Cr' },
          { cls: 'sg', l: 'Gross Profit MTD', v: '₹6.36L', d: '▲ Margin: 22.4%', s: 'After buy price, freight, losses' },
          { cls: 'sr', l: 'Cash Receivable', v: '₹12.8L', d: '▼ 4 accounts overdue 60d+', s: '₹3.4L overdue >60 days' },
          { cls: 'sa', l: 'Cash in Dead Stock', v: '₹7.8L', d: '▲ Locked, not working', s: 'Actionable recovery: ₹6.1L' },
          { cls: 'sb', l: 'Net Operating Cash', v: '₹4.1L', d: '▲ Healthy this month', s: 'After payables and collections' },
        ].map(k => (
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div>
            <div className="kd up">{k.d}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="gl g55">
        <div className="card">
          <div className="ch"><div><div className="ctit">Profit by Product Category</div><div className="csub">Which products actually make you money?</div></div></div>
          <div style={{ height: '200px', position: 'relative' }}><canvas ref={mRef}></canvas></div>
        </div>
        <div className="card">
          <div className="ch"><div><div className="ctit">Cash Flow — Collections vs Purchases</div></div></div>
          <div style={{ height: '200px', position: 'relative' }}><canvas ref={cfRef}></canvas></div>
        </div>
      </div>

      <div className="gl g57">
        <div className="card">
          <div className="ch"><div className="ctit">What-If: Margin Simulator</div><span className="bdg bg">Live AI Tool</span></div>
          <div className="scbox">
            <div className="sclbl">If I reduce discount by X% across all orders...</div>
            <input type="range" min="0" max="10" step="0.1" value={disc} onChange={e => setDisc(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text3)', marginBottom: '8px' }}>
              <span>0%</span><span style={{ color: 'var(--green)', fontWeight: 700 }}>{disc.toFixed(1)}%</span><span>10%</span>
            </div>
            <div className="scout">
              <div className="scit"><div className="scv" style={{ color: 'var(--g2)' }}>₹{newProfit}L</div><div className="scl">Monthly Profit</div></div>
              <div className="scit"><div className="scv" style={{ color: 'var(--b2)' }}>{newMargin}%</div><div className="scl">Margin %</div></div>
              <div className="scit"><div className="scv" style={{ color: gain >= 0 ? 'var(--green)' : 'var(--r2)' }}>{gain >= 0 ? '+' : ''}{gain}L</div><div className="scl">Extra Gain</div></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">Overdue Receivables — Action Required</div><span className="bdg br">₹12.8L Outstanding</span></div>
          <table className="tbl">
            <thead><tr><th>Customer</th><th>Amount Due</th><th>Days Overdue</th><th>AI Risk</th><th>Action</th></tr></thead>
            <tbody>
              {[
                ['Sharma Constructions', '₹3.4L', 78, 'HIGH', 'br', 'Legal notice if not paid by Friday'],
                ['Mehta Brothers', '₹2.1L', 52, 'MEDIUM', 'ba', 'Call + offer 2% early pay discount'],
                ['Patel Contractors', '₹1.8L', 44, 'MEDIUM', 'ba', 'WhatsApp reminder today'],
                ['Rajan Interior', '₹1.2L', 31, 'LOW', 'bg', 'Polite reminder — good customer'],
                ['Others (12 accounts)', '₹4.3L', '<30', 'LOW', 'bg', 'Normal collection cycle'],
              ].map(([c, a, d, r, sc, act]) => (
                <tr key={c}>
                  <td style={{ fontWeight: 600 }}>{c}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: sc === 'br' ? 'var(--r2)' : sc === 'ba' ? 'var(--a2)' : 'var(--text)' }}>{a}</td>
                  <td><span className={`bdg ${sc}`}>{d} days</span></td>
                  <td><span className={`bdg ${sc}`}>{r}</span></td>
                  <td style={{ fontSize: '11px' }}>{act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
