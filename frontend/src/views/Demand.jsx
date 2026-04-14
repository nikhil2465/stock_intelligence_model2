import React, { useEffect, useRef } from 'react';
import { createChart, baseOpts } from '../utils/chartHelpers';

const MONTHS_SHORT = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const FDATA = [
  { sku: '18mm BWP', curr: 480, f30: 596, f60: 680, f90: 712, sig: 'SURGE', ac: 'Pre-order 300 extra sheets now' },
  { sku: '12mm MR', curr: 420, f30: 448, f60: 436, f90: 380, sig: 'STABLE', ac: 'Normal ordering cycle' },
  { sku: '12mm BWP', curr: 380, f30: 432, f60: 498, f90: 524, sig: 'GROWING', ac: 'Increase stock by 25%' },
  { sku: 'Laminates', curr: 320, f30: 298, f60: 274, f90: 250, sig: 'DECLINING', ac: 'Reduce next order quantity' },
  { sku: '18mm MR', curr: 258, f30: 262, f60: 248, f90: 210, sig: 'STABLE', ac: 'Normal — monitor monsoon dip' },
  { sku: '8mm Flexi', curr: 72, f30: 88, f60: 102, f90: 118, sig: 'GROWING', ac: 'Fix supplier reliability first' },
  { sku: 'Commercial', curr: 24, f30: 20, f60: 16, f90: 12, sig: 'FALLING', ac: 'Do not reorder dead stock grade' },
];

const COLORS = { '18mm BWP': '#0f766e', '12mm MR': '#2563eb', '12mm BWP': '#0f766e', 'Laminates': '#9333ea', '18mm MR': '#d97706', '8mm Flexi': '#ea580c', 'Commercial': '#9ca3af' };

export default function Demand() {
  const sRef = useRef(null);

  useEffect(() => {
    return createChart(sRef, {
      type: 'line',
      data: {
        labels: MONTHS_SHORT,
        datasets: [{
          data: [88, 84, 90, 96, 100, 92, 76, 72, 94, 112, 128, 118],
          borderColor: '#0f766e', backgroundColor: '#0f766e10', borderWidth: 2.5, tension: .4,
          pointRadius: 3, pointBackgroundColor: '#0f766e', fill: true, label: 'Index (100=avg)'
        }]
      },
      options: baseOpts({ scales: { x: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9 } } }, y: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' } } } } })
    });
  }, []);

  return (
    <div className="view">
      <div className="ph">
        <div className="pg">Demand Forecasting — What Will Sell Next?</div>
        <div className="psub">AI-powered demand signals · 30/60/90-day forecast · Seasonal patterns · Pre-order alerts</div>
      </div>

      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="ch">
          <div><div className="ctit">30/60/90-Day Demand Forecast by SKU</div><div className="csub">AI prediction · Sheets/month</div></div>
          <span className="bdg bg">AI FORECAST</span>
        </div>
        <table className="tbl">
          <thead>
            <tr><th>SKU</th><th>Current Month</th><th>30-Day Forecast</th><th>60-Day</th><th>90-Day</th><th>AI Signal</th><th>Recommended Action</th></tr>
          </thead>
          <tbody>
            {FDATA.map(d => {
              const g30 = Math.round((d.f30 - d.curr) / d.curr * 100);
              const sc = d.sig === 'SURGE' ? 'br' : d.sig === 'GROWING' ? 'bg' : d.sig === 'DECLINING' || d.sig === 'FALLING' ? 'ba' : 'bb';
              const bg30 = d.f30 > d.curr ? '#0f766e' : d.f30 < d.curr ? '#dc2626' : '#2563eb';
              return (
                <tr key={d.sku}>
                  <td style={{ fontWeight: 600 }}>{d.sku}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--mono)' }}>{d.curr} sheets</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ background: bg30, borderRadius: '4px', padding: '5px 8px', color: '#fff', fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700, display: 'inline-block' }}>
                      {d.f30} ({g30 >= 0 ? '+' : ''}{g30}%)
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700, color: d.f60 > d.curr ? '#0f766e' : '#dc2626' }}>{d.f60}</td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700, color: d.f90 > d.curr ? '#0f766e' : '#dc2626' }}>{d.f90}</td>
                  <td style={{ textAlign: 'center' }}><span className={`bdg ${sc}`}>{d.sig}</span></td>
                  <td style={{ fontSize: '11px', color: 'var(--text2)' }}>{d.ac}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="gl g55">
        <div className="card">
          <div className="ch"><div><div className="ctit">30/60/90-Day Demand by SKU</div><div className="csub">Visual bars</div></div></div>
          {FDATA.slice(0, 6).map(d => {
            const c = COLORS[d.sku] || '#9ca3af';
            const mx = Math.max(d.curr, d.f30, d.f60, d.f90);
            return (
              <div key={d.sku} className="fc-row">
                <span className="fc-lbl">{d.sku}</span>
                <div className="fc-bs">
                  {[{ v: d.curr, o: '99' }, { v: d.f30, o: 'cc' }, { v: d.f60, o: 'bb' }, { v: d.f90, o: '99' }].map((b, i) => (
                    <div key={i} className="fc-b" style={{ height: `${Math.round(b.v / mx * 100)}%`, background: `${c}${b.o}` }}>{b.v}</div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: '3px', marginLeft: '100px', marginTop: '3px' }}>
            {['Now', '30d', '60d', '90d'].map(l => <div key={l} className="fc-pl">{l}</div>)}
          </div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">Seasonal Pattern — AI Detected</div><div className="csub">Based on last 3 years of sales data</div></div>
          <div style={{ height: '180px', position: 'relative' }}><canvas ref={sRef}></canvas></div>
          <div style={{ padding: '10px 12px', background: 'var(--b3)', border: '1px solid var(--b4)', borderRadius: '7px', marginTop: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--b2)', fontFamily: 'var(--mono)', marginBottom: '3px' }}>AI SEASONAL INSIGHT</div>
            <div style={{ fontSize: '12px', color: 'var(--blue)' }}>
              Oct–Dec is historically your strongest quarter (+28%). Start stocking up in September to avoid stockouts during the festive construction rush. Plan extra 400 sheets of BWP grades.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
