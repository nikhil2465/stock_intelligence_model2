import React from 'react';

export default function Inward() {
  return (
    <div className="view">
      <div className="ph">
        <div className="pg">Inward &amp; Outward — Stock Movement Intelligence</div>
        <div className="psub">AI tracks every unit entering and leaving your warehouse · Shrinkage detection · Dispatch velocity</div>
      </div>
      <div className="ai-banner">
        <div className="ai-ic">AI</div>
        <div className="ai-b">
          <div className="ai-lbl">AI Movement Brief — Real-time</div>
          <div className="ai-txt">
            <strong>Inward velocity is 18% faster</strong> than last month. <strong>Outward bottleneck detected:</strong> 4
            dispatches stuck in QC check &gt;2 hrs. <strong>Shrinkage alert:</strong> 12mm MR shows 0.6% variance.
          </div>
        </div>
        <div className="ai-ts">Live<br />Real-time</div>
      </div>

      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: 'var(--mono)', marginBottom: '7px' }}>
        Today's Stock Flow Pipeline
      </div>

      <div className="flow-grid">
        {[
          { label: 'Goods Received', val: 14, sub: '₹6.8L value · 4 suppliers', color: 'var(--b2)' },
          { label: 'QC / Inspection', val: 6, sub: '2 pending >2hrs · Avg 38 min', color: 'var(--a2)' },
          { label: 'Put-Away / Shelved', val: 11, sub: '98% accuracy · 1 mismatch', color: 'var(--teal)' },
          { label: 'Pick & Pack', val: 18, sub: 'Avg pick time: 12 min', color: 'var(--purple)' },
          { label: 'Dispatched Out', val: 16, sub: '₹8.2L value · 12 customers', color: 'var(--green)' },
        ].reduce((acc, item, i, arr) => {
          acc.push(
            <div key={item.label} className="flow-card" style={{ borderTop: `3px solid ${item.color}` }}>
              <div className="fl2">{item.label}</div>
              <div className="fv" style={{ color: item.color }}>{item.val}</div>
              <div className="fd">{item.sub}</div>
            </div>
          );
          if (i < arr.length - 1) acc.push(<div key={`arrow-${i}`} className="flow-arrow">→</div>);
          return acc;
        }, [])}
      </div>

      <div className="kg g6">
        {[
          { cls: 'sb', l: 'Inward Today', v: '₹6.8L', d: '▲ 14 consignments', s: '4 suppliers · 680 sheets' },
          { cls: 'sg', l: 'Outward Today', v: '₹8.2L', d: '▲ 16 dispatches', s: '12 customers · 520 sheets' },
          { cls: 'st', l: 'Net Stock Change', v: '+160', d: '▲ sheets added net', s: 'Inward > Outward today' },
          { cls: 'sa', l: 'Avg Inward Cycle', v: '2.4 hrs', d: '▲ 18% faster vs last month', s: 'GRN to shelf time' },
          { cls: 'sr', l: 'Shrinkage Rate', v: '0.3%', d: '▲ 12mm MR variance flagged', s: 'Industry avg: 0.5%' },
          { cls: 'sp', l: 'Dispatch SLA Hit', v: '87%', d: '▼ Target: 95%', s: '4 orders missed 4-hr window' },
        ].map(k => (
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div>
            <div className="kd wn">{k.d}</div>
            <div className="ks">{k.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
