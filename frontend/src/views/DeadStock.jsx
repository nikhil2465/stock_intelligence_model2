import React, { useEffect, useRef } from 'react';
import { createChart, baseOpts } from '../utils/chartHelpers';

export default function DeadStock() {
  const agingRef = useRef(null);
  useEffect(() => {
    return createChart(agingRef, {
      type:'bar', indexAxis:'y',
      data:{ labels:['6mm Gurjan (118d)','4mm MR Plain (97d)','19mm Commercial (91d)','10mm Flexi (74d)','16mm MR Teak (62d)'],
        datasets:[{data:[179000,139000,99000,109000,102000],backgroundColor:['#dc2626aa','#dc2626aa','#dc2626aa','#d97706aa','#d97706aa'],borderWidth:0,borderRadius:3}]},
      options:baseOpts({scales:{x:{grid:{color:'#e2e6ec'},ticks:{color:'#9ca3af',font:{size:9,family:'JetBrains Mono'},callback:v=>'₹'+(v/1000).toFixed(0)+'K'}},y:{grid:{display:false},ticks:{color:'#4b5563',font:{size:9}}}}})
    });
  }, []);

  return (
    <div className="view">
      <div className="ph"><div className="pg">Dead Stock & Ageing Analysis</div><div className="psub">AI identifies cash locked in slow-moving inventory and recommends actions to free it</div></div>
      <div className="kg g4">
        {[{cls:'sr',l:'Dead Stock (90d+)',v:'₹4.2L',d:'▼ 3 SKUs · Zero movement',s:'Highest: ₹1.8L in 6mm Gurjan'},
          {cls:'sa',l:'Slow Stock (60–90d)',v:'₹3.6L',d:'▲ 8 SKUs · Very slow',s:'Trending toward dead if not sold'},
          {cls:'sb',l:'Total Cash Locked',v:'₹7.8L',d:'▲ In slow + dead stock',s:'Could fund 3 months of fast-movers'},
          {cls:'sg',l:'AI Recovery Potential',v:'₹6.1L',d:'▲ If AI plan followed',s:'78% recovery in 45 days estimated'},
        ].map(k=>(
          <div key={k.l} className={`kc ${k.cls}`}>
            <div className="kt"><div className="kl">{k.l}</div></div>
            <div className="kv">{k.v}</div><div className="kd wn">{k.d}</div><div className="ks">{k.s}</div>
          </div>
        ))}
      </div>
      <div className="gl g57">
        <div className="card">
          <div className="ch"><div><div className="ctit">Ageing Inventory — AI Action Plan</div></div></div>
          <table className="tbl">
            <thead><tr><th>Product / SKU</th><th>Stock</th><th>Buy Price</th><th>Days Old</th><th>Value Locked</th><th>AI Recommendation</th><th>Expected Recovery</th></tr></thead>
            <tbody>
              {[['6mm Gurjan BWP','186 sheets','₹960/sheet',118,'₹1.79L','Discount 12% + call 3 contractors','₹1.57L','br'],
                ['4mm MR Plain','240 sheets','₹580/sheet',97,'₹1.39L','Bundle with 18mm orders · 8% off','₹1.28L','br'],
                ['19mm Commercial','102 sheets','₹980/sheet',91,'₹0.99L','Return to supplier if possible','₹0.90L','br'],
                ['10mm Flexi BWP','88 sheets','₹1,240/sheet',74,'₹1.09L','Offer to interior design firms','₹1.09L','ba'],
                ['16mm MR Teak','124 sheets','₹820/sheet',62,'₹1.02L','Price okay · Promote to carpenters','₹1.02L','ba'],
              ].map(([n,stk,bp,d,vl,rec,er,sc])=>(
                <tr key={n}>
                  <td style={{fontWeight:600}}>{n}</td>
                  <td style={{fontFamily:'var(--mono)'}}>{stk}</td>
                  <td style={{fontFamily:'var(--mono)'}}>{bp}</td>
                  <td><span className={`bdg ${sc}`}>{d} days</span></td>
                  <td style={{fontFamily:'var(--mono)',fontWeight:700,color:'var(--r2)'}}>{vl}</td>
                  <td><span className="bdg ba">{rec}</span></td>
                  <td style={{fontFamily:'var(--mono)',color:'var(--g2)'}}>{er}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="ch"><div className="ctit">Cash Recovery AI Plan</div><span className="bdg bg">₹6.1L Recoverable</span></div>
          <div style={{height:'160px',position:'relative',marginBottom:'14px'}}><canvas ref={agingRef}></canvas></div>
          <div className="div"></div>
          <div style={{fontSize:'12px',fontWeight:700,marginBottom:'10px'}}>AI-Suggested 30-Day Actions</div>
          {[{num:1,cls:'br',bg:'var(--r3)',t:'Call top 5 contractors today about 6mm Gurjan deal',m:'Offer: Buy 30+ sheets → get 12% off · Expected: ₹84K recovered in 7 days'},
            {num:2,cls:'ba',bg:'var(--a3)',t:'Bundle 4mm MR plain with 18mm BWP orders',m:'Auto-add 5 sheets 4mm to every order >50 sheets BWP · Expected: clears in 45 days'},
            {num:3,cls:'bb',bg:'var(--b3)',t:'WhatsApp blast to interior design customer segment',m:'Promote 10mm Flexi and 16mm Teak to 28 interior firm contacts'},
            {num:4,cls:'bg',bg:'var(--g3)',t:'Contact Gauri Laminates about returning 19mm commercial',m:'Check return/credit policy. ₹99K at stake.'},
          ].map(r=>(
            <div key={r.num} className="ri">
              <div className="rinum" style={{background:r.bg,border:`1px solid`,color:r.num<=2?'var(--r2)':r.num===3?'var(--b2)':'var(--g2)'}}>{r.num}</div>
              <div><div style={{fontSize:'12px',fontWeight:600,color:'var(--text)'}}>{r.t}</div><div className="imt">{r.m}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
