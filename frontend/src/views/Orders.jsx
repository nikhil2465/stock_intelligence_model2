import React, { useEffect, useRef } from 'react';
import { createChart, baseOpts } from '../utils/chartHelpers';

export default function Orders() {
  const ordRef = useRef(null);

  useEffect(() => {
    const days = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    const data = [18, 22, 19, 24, 20, 14, 8, 21, 25, 28, 22, 19, 16, 11, 6, 23, 26, 24, 20, 18, 15, 9, 22, 28, 30, 24, 21, 17, 12, 24];
    return createChart(ordRef, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          { data, borderColor: '#0f766e', backgroundColor: '#0f766e10', borderWidth: 2, tension: .4, pointRadius: 0, fill: true },
          { data: data.map(() => 20), borderColor: '#d97706', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0 },
        ]
      },
      options: baseOpts({
        scales: {
          x: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 8 }, maxTicksLimit: 10 } },
          y: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' } } }
        }
      })
    });
  }, []);

  return (
    <div className="view">
      <div className="ph">
        <div className="pg">Orders &amp; Fulfilment Intelligence</div>
        <div className="psub">Live order pipeline · Pending dispatch · SLA performance</div>
      </div>

      <div className="kg g5">
        {[
          { cls: 'sb', l: 'Orders Today', v: '24', d: '▲ +6 vs yesterday', s: '18 dispatched · 6 pending' },
          { cls: 'sg', l: 'Dispatched', v: '18', d: '▲ 87% SLA hit', s: '4 missed window today' },
          { cls: 'sr', l: 'Pending', v: '6', d: '▼ 2 delayed >4hrs', s: 'Mehta order: 30 hours delayed' },
          { cls: 'st', l: 'Avg Fulfil Time', v: '3.2 hrs', d: '▲ Target: 2 hrs', s: 'QC bottleneck on MR grades' },
          { cls: 'sa', l: 'Orders MTD', v: '486', d: '▲ +42 vs last month', s: 'Target: 500 orders MTD' },
        ].map(k => (
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div>
            <div className="kd wn">{k.d}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="gl g55">
        <div className="card">
          <div className="ch"><div><div className="ctit">Order Volume — Last 30 Days</div><div className="csub">Daily orders vs 20-order target</div></div></div>
          <div style={{ height: '200px', position: 'relative' }}><canvas ref={ordRef}></canvas></div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">Pending Orders — Needs Action</div><span className="bdg br">6 Pending</span></div>
          <table className="tbl">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Value</th><th>Delayed</th><th>Reason</th><th>Action</th></tr>
            </thead>
            <tbody>
              {[
                ['ORD-2847', 'Mehta Constructions', '₹3.8L', '30 hours', '18mm BWP stock shortage', 'Order from Century NOW'],
                ['ORD-2852', 'Patel Contractors', '₹1.2L', '4 hours', 'QC pending on MR grade', 'Prioritise QC'],
                ['ORD-2855', 'Kumar & Sons', '₹0.8L', '1 hour', 'Packing in progress', 'ETA 30 min'],
                ['ORD-2856', 'Raj Carpentry', '₹0.4L', '30 min', 'Driver route optimisation', 'Dispatch by 3PM'],
              ].map(([id, c, v, d, r, a]) => (
                <tr key={id}>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--b2)', fontWeight: 600 }}>{id}</td>
                  <td style={{ fontWeight: 600 }}>{c}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{v}</td>
                  <td><span className={`bdg ${d.includes('30 h') ? 'br' : 'ba'}`}>{d}</span></td>
                  <td style={{ fontSize: '11px', color: 'var(--text2)' }}>{r}</td>
                  <td style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
