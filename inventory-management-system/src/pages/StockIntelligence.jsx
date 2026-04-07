import { useState, useEffect } from 'react';
import { inventoryItems } from '../data/database';
import StockIntelligenceAI from '../utils/StockIntelligenceAI';

export default function StockIntelligence() {
  const [recommendations, setRecommendations] = useState([]);
  const [abcAnalysis, setAbcAnalysis] = useState([]);
  const [optimizations, setOptimizations] = useState([]);
  const [selectedTab, setSelectedTab] = useState('recommendations');

  useEffect(() => {
    const ai = new StockIntelligenceAI(inventoryItems);
    setRecommendations(ai.generateRecommendations());
    setAbcAnalysis(ai.abcAnalysis());
    setOptimizations(ai.identifyOptimizations());
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button
          onClick={() => setSelectedTab('recommendations')}
          style={{
            padding: '10px 20px',
            background: selectedTab === 'recommendations' ? '#2563eb' : 'transparent',
            color: selectedTab === 'recommendations' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
        >
          🎯 AI Recommendations ({recommendations.length})
        </button>
        <button
          onClick={() => setSelectedTab('abc')}
          style={{
            padding: '10px 20px',
            background: selectedTab === 'abc' ? '#2563eb' : 'transparent',
            color: selectedTab === 'abc' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
        >
          📊 ABC Analysis
        </button>
        <button
          onClick={() => setSelectedTab('optimizations')}
          style={{
            padding: '10px 20px',
            background: selectedTab === 'optimizations' ? '#2563eb' : 'transparent',
            color: selectedTab === 'optimizations' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s'
          }}
        >
          ⚡ Optimizations ({optimizations.length})
        </button>
      </div>

      {/* Recommendations Tab */}
      {selectedTab === 'recommendations' && (
        <div>
          {recommendations.length > 0 ? (
            recommendations.map(rec => (
              <div key={rec.id} className="card" style={{ marginBottom: '15px', borderLeft: `4px solid var(--${rec.severity === 'CRITICAL' ? 'danger' : 'warning'}-color)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{rec.itemName}</h3>
                  <span className={`badge badge-${getSeverityColor(rec.severity)}`}>{rec.severity}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{rec.message}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                    <strong>Recommended Action:</strong>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)' }}>{rec.action}</p>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '6px' }}>
                    <strong>Expected Impact:</strong>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)' }}>{rec.estimatedImpact}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>✓ All systems optimal</h3>
              <p>No critical recommendations at this time</p>
            </div>
          )}
        </div>
      )}

      {/* ABC Analysis Tab */}
      {selectedTab === 'abc' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h2>ABC Inventory Analysis</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Pareto Analysis classifies items based on their contribution to total inventory value. A items are high-value, B items are mid-value, and C items are low-value.
            </p>

            {['A', 'B', 'C'].map(classification => (
              <div key={classification} style={{ marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>
                  Class {classification} Items ({abcAnalysis.filter(i => i.classification === classification).length})
                </h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Stock Value</th>
                        <th>Turnover Rate</th>
                        <th>Cumulative %</th>
                        <th>Days of Inventory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abcAnalysis
                        .filter(item => item.classification === classification)
                        .map(item => (
                          <tr key={item.id}>
                            <td><strong>{item.name}</strong></td>
                            <td>{item.quantity} units</td>
                            <td>${item.stockValue.toFixed(2)}</td>
                            <td>{item.turnoverRate.toFixed(2)}</td>
                            <td>{item.cumulativePercentage.toFixed(1)}%</td>
                            <td>{item.daysOfInventory.toFixed(0)} days</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimizations Tab */}
      {selectedTab === 'optimizations' && (
        <div>
          {optimizations.length > 0 ? (
            optimizations.map((opt, idx) => (
              <div key={idx} className="card" style={{ marginBottom: '15px', borderLeft: '4px solid var(--warning-color)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                  {opt.type === 'OVERSTOCK' ? '📦 Overstock Detection: ' : '⚡ '}{opt.item}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px' }}>
                    <strong>Current Stock:</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', color: 'var(--primary-color)' }}>{opt.current} units</p>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px' }}>
                    <strong>Recommended:</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', color: 'var(--warning-color)' }}>{opt.recommended} units</p>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '6px' }}>
                    <strong>Potential Savings:</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem', color: 'var(--success-color)' }}>${opt.potentialSavings}</p>
                  </div>
                </div>
                <p style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>⚠️ {opt.risk}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>✓ Inventory well optimized</h3>
              <p>No significant optimization opportunities identified</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
