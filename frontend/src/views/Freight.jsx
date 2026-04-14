import React, { useEffect, useRef } from 'react';
import { createChart, baseOpts } from '../utils/chartHelpers';

export default function Freight() {
  const ftRef = useRef(null);

  useEffect(() => {
    const days = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
    const out = [16, 18, 15, 17, 20, 14, 0, 19, 17, 16, 18, 21, 15, 14, 0, 18, 16, 17, 19, 20, 16, 0, 18, 17, 15, 19, 18, 16, 0, 18];
    const inc = [9, 11, 8, 10, 12, 0, 0, 9, 11, 10, 8, 12, 10, 0, 0, 11, 9, 10, 12, 11, 9, 0, 10, 11, 9, 12, 10, 8, 0, 11];
    return createChart(ftRef, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          { data: out, borderColor: '#0f766e', backgroundColor: '#0f766e10', borderWidth: 2, tension: .4, pointRadius: 0, fill: true, label: 'Outbound ₹/sheet' },
          { data: inc, borderColor: '#9333ea', backgroundColor: '#9333ea10', borderWidth: 2, tension: .4, pointRadius: 0, fill: true, label: 'Inbound ₹/sheet' },
          { data: days.map(() => 16), borderColor: '#d97706', borderWidth: 1.5, borderDash: [4, 4], pointRadius: 0, label: 'Target ₹16/sh' },
        ]
      },
      options: baseOpts({
        scales: {
          x: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 8 }, maxTicksLimit: 10 } },
          y: { grid: { color: '#e2e6ec' }, ticks: { color: '#9ca3af', font: { size: 9, family: 'JetBrains Mono' }, callback: v => '₹' + v } }
        },
        plugins: { legend: { display: true, position: 'top', labels: { font: { size: 10, family: 'JetBrains Mono' }, padding: 12, boxWidth: 12, color: '#4b5563' } } }
      })
    });
  }, []);

  return (
    <div className="view">
      <div className="ph">
        <div className="pg">Freight Planning — AI-Optimized Logistics</div>
        <div className="psub">Outbound lane costs · Vehicle utilisation · Consolidation opportunities · Inbound freight analysis</div>
      </div>

      <div className="kg g5">
        {[
          { cls: 'sr', l: 'Outbound Cost/Sheet', v: '₹18.4', d: '▼ Target ₹16/sh', s: '₹2.4 above target' },
          { cls: 'sa', l: 'Vehicle Utilisation', v: '68%', d: '▼ Target 85%', s: '17% unused capacity daily' },
          { cls: 'sb', l: 'Best Lane', v: 'Whitefield', d: '▲ ₹14/sh · 78% fill', s: 'Consolidation possible today' },
          { cls: 'sr', l: 'Worst Lane', v: 'Electronic City', d: '▼ ₹24/sh · 54% fill', s: 'Set min order ₹15K for zone' },
          { cls: 'sg', l: 'Today Saving', v: '₹2,400', d: '▲ 3 Whitefield merges', s: 'Mehta + Patel + Gupta same zone' },
        ].map(k => (
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div>
            <div className="kd wn">{k.d}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>

      <div className="lane-grid">
        {[
          { r: 'Whitefield', c: '₹14/sh', f: '78%', s: 'BEST', sc: 'bg' },
          { r: 'Koramangala', c: '₹16/sh', f: '72%', s: 'OK', sc: 'bb' },
          { r: 'HSR Layout', c: '₹17/sh', f: '65%', s: 'OK', sc: 'bb' },
          { r: 'BTM Layout', c: '₹19/sh', f: '58%', s: 'HIGH', sc: 'ba' },
          { r: 'Electronic City', c: '₹24/sh', f: '54%', s: 'WORST', sc: 'br' },
          { r: 'Hebbal', c: '₹21/sh', f: '61%', s: 'HIGH', sc: 'ba' },
        ].map(lane => (
          <div key={lane.r} className="lane-card">
            <div className="lane-hd">
              <div className="lane-route">{lane.r}</div>
              <span className={`bdg ${lane.sc}`}>{lane.s}</span>
            </div>
            <div className="lane-detail">
              <div className="ld"><div className="ldv">{lane.c}</div><div className="ldl">Cost/Sheet</div></div>
              <div className="ld"><div className="ldv">{lane.f}</div><div className="ldl">Truck Fill</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="gl g55">
        <div className="card">
          <div className="ch"><div><div className="ctit">Freight Cost Trend — 30 Days</div><div className="csub">₹/sheet · Inbound vs Outbound</div></div></div>
          <div style={{ height: '200px', position: 'relative' }}><canvas ref={ftRef}></canvas></div>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">AI Freight Insights</div><span className="bdg bg">AI Generated</span></div>
          <div className="ilist">
            {[
              ['icg', '★', 'Consolidate 3 Whitefield deliveries → save ₹2,400 today', 'Mehta (40sh) + Patel (30sh) + Gupta (10sh) — all within 3km. One truck at 92% vs three at 35%.', 'ROUTE MERGE · IMMEDIATE SAVING'],
              ['icr', '!', 'Gauri inbound freight is 2.8× more expensive than Century', '₹22/sheet vs ₹8.4/sheet. True landed cost +11% above market.', 'TRUE COST · SWITCH SUPPLIER'],
              ['ica', '↑', 'Electronic City needs minimum order consolidation', 'Only 54% fill — ₹24/sh is 50% above avg. Set min ₹15K order value.', 'POLICY · MIN ORDER RULE'],
            ].map(([ic, icon, t, d, m]) => (
              <div key={t} className="ii">
                <div className={`iic ${ic}`}>{icon}</div>
                <div><div className="iti">{t}</div><div className="ide">{d}</div><div className="imt">{m}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
