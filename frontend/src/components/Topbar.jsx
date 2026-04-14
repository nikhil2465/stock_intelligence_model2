import React, { useState } from 'react';

const PERIODS = ['Today', 'MTD', 'YTD'];

export default function Topbar({ title, period, onPeriodChange }) {
  return (
    <div className="topbar">
      <div className="tl">
        <div className="tc">STOCKSENSE AI · INVENTORY INTELLIGENCE PLATFORM · DEMO: PLYWOOD DEALER · ANY INDUSTRY SUPPORTED</div>
        <div className="tt">{title}</div>
      </div>
      <div className="ptabs">
        {PERIODS.map(p => (
          <button
            key={p}
            className={`pt${period === p ? ' active' : ''}`}
            onClick={() => onPeriodChange(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="conn-badge"><span className="dot dg"></span>Your DMS Live</div>
      <div className="ai-badge"><span className="dot dg"></span>AI Active</div>
      <div className="ava">AI</div>
    </div>
  );
}
