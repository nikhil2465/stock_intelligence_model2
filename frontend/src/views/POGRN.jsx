import React from 'react';

export default function POGRN() {
  return (
    <div className="view">
      <div className="ph">
        <div className="pg">PO &amp; GRN — End-to-End Procurement Lifecycle</div>
        <div className="psub">Purchase orders · Goods received · 3-way match · AI discrepancy detection</div>
      </div>

      <div className="kg g5">
        {[
          { cls: 'sb', l: 'Open POs', v: '8', d: '₹12.4L total', s: '4 AI auto-generated' },
          { cls: 'sr', l: 'Overdue POs', v: '2', d: '▼ Gauri +4d, Greenply +2d', s: 'Follow up required today' },
          { cls: 'sg', l: 'GRN Match Rate', v: '96%', d: '▲ 3 mismatches MTD', s: '₹8,400 variance flagged' },
          { cls: 'sa', l: 'Partial POs', v: '3', d: '▲ 60-87% filled', s: 'Gauri only 38% — ETA unknown' },
          { cls: 'st', l: 'AI Auto-POs', v: '4', d: '▲ This month', s: 'Based on reorder triggers' },
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
        <div className="ch"><div className="ctit">Open Purchase Orders</div><span className="bdg ba">8 Open</span></div>
        <table className="tbl">
          <thead>
            <tr><th>PO#</th><th>Supplier</th><th>SKU</th><th>Ordered</th><th>Received</th><th>Fill %</th><th>Value</th><th>ETA</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              ['PO-7734', 'Greenply Industries', '12mm MR Plain', 300, 180, '60%', '₹2.16L', 'Overdue +2d', 'br'],
              ['PO-7733', 'Century Plyboards', '18mm BWP', 200, 200, '100%', '₹2.84L', 'Received', 'bg'],
              ['PO-7732', 'Century Plyboards', '12mm BWP', 150, 130, '87%', '₹1.73L', 'ETA 2d', 'ba'],
              ['PO-7731', 'Gauri Laminates', '8mm Flexi', 200, 76, '38%', '₹0.49L', 'Overdue +4d', 'br'],
              ['PO-7730', 'Supreme Laminates', 'Laminates Teak', 100, 100, '100%', '₹0.34L', 'Received', 'bg'],
            ].map(([po, sup, sku, ord, rec, fill, val, eta, sc]) => (
              <tr key={po}>
                <td style={{ fontFamily: 'var(--mono)', color: 'var(--b2)', fontWeight: 600 }}>{po}</td>
                <td style={{ fontWeight: 600 }}>{sup}</td>
                <td>{sku}</td>
                <td style={{ fontFamily: 'var(--mono)' }}>{ord}</td>
                <td style={{ fontFamily: 'var(--mono)' }}>{rec}</td>
                <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: fill === '100%' ? '#16a34a' : fill >= '80%' ? '#d97706' : '#dc2626' }}>{fill}</td>
                <td style={{ fontFamily: 'var(--mono)' }}>{val}</td>
                <td><span className={`bdg ${sc}`}>{eta}</span></td>
                <td><span className={`bdg ${sc}`}>{sc === 'bg' ? 'COMPLETE' : sc === 'br' ? 'OVERDUE' : 'IN PROGRESS'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '12px' }}>
        <div className="ch"><div className="ctit">GRN Discrepancy Log — AI Flagged</div><span className="bdg br">3 Mismatches</span></div>
        <table className="tbl">
          <thead>
            <tr><th>GRN#</th><th>PO#</th><th>Supplier</th><th>Expected</th><th>Received</th><th>Variance</th><th>Value Impact</th><th>Action</th></tr>
          </thead>
          <tbody>
            {[
              ['GRN-4421', 'PO-7728', 'Gauri Laminates', '8mm BWP', '8mm MR', 'Wrong Grade', '₹3,200', 'Return & Reorder'],
              ['GRN-4418', 'PO-7725', 'Gauri Laminates', '200 sheets', '186 sheets', 'Short 14 sheets', '₹2,800', 'Raise Credit Note'],
              ['GRN-4412', 'PO-7719', 'Gauri Laminates', 'Rate ₹142', 'Invoice ₹156', 'Price Mismatch', '₹2,400', 'Block Payment'],
            ].map(([grn, po, sup, exp, rec, v, val, act]) => (
              <tr key={grn}>
                <td style={{ fontFamily: 'var(--mono)', color: 'var(--b2)' }}>{grn}</td>
                <td style={{ fontFamily: 'var(--mono)' }}>{po}</td>
                <td>{sup}</td>
                <td style={{ fontSize: '11px' }}>{exp}</td>
                <td style={{ fontSize: '11px', color: '#dc2626' }}>{rec}</td>
                <td><span className="bdg br">{v}</span></td>
                <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: '#dc2626' }}>{val}</td>
                <td style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>{act}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
