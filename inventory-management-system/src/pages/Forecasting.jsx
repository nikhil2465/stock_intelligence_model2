import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { inventoryItems, monthlySalesData } from '../data/database';
import StockIntelligenceAI from '../utils/StockIntelligenceAI';

export default function Forecasting() {
  const [forecast, setForecast] = useState([]);
  const [forecastWithHistory, setForecastWithHistory] = useState([]);

  useEffect(() => {
    const ai = new StockIntelligenceAI(inventoryItems);
    const predictions = ai.forecastDemand(monthlySalesData, 6);
    setForecast(predictions);

    // Combine historical and forecast data
    const combined = [
      ...monthlySalesData.map(m => ({
        month: m.month,
        sales: m.sales,
        type: 'historical',
        isForecast: false
      })),
      ...predictions.map(p => ({
        month: p.month,
        sales: p.predictedSales,
        type: 'forecast',
        isForecast: true,
        confidence: p.confidence
      }))
    ];
    setForecastWithHistory(combined);
  }, []);

  return (
    <div>
      <div className="alert alert-info">
        <strong>📊 AI-Powered Demand Forecasting:</strong> Using historical sales data and trend analysis to predict future demand with confidence intervals. These predictions help optimize inventory levels and supply chain planning.
      </div>

      {/* Forecast Accuracy Info */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Forecast Model</h2>
          </div>
          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p><strong>Method:</strong> Time Series Analysis with Trend Extrapolation</p>
            <p><strong>Data Points:</strong> {monthlySalesData.length} months of historical data</p>
            <p><strong>Forecast Horizon:</strong> 6 months ahead</p>
            <p><strong>Confidence Level:</strong> Decreases by 5% for each month ahead</p>
            <p><strong>Model Updates:</strong> Monthly with new actual sales data</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Forecast Summary</h2>
          </div>
          {forecast.length > 0 && (
            <div style={{ color: 'var(--text-secondary)', lineHeight: 2 }}>
              <div>
                <strong>Average Predicted Sales:</strong>&nbsp;
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  ${(forecast.reduce((sum, f) => sum + f.predictedSales, 0) / forecast.length).toLocaleString()}
                </span>
              </div>
              <div>
                <strong>Total Forecasted Revenue:</strong>&nbsp;
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
                  ${forecast.reduce((sum, f) => sum + f.predictedRevenue, 0).toLocaleString()}
                </span>
              </div>
              <div>
                <strong>Overall Average Confidence:</strong>&nbsp;
                <span style={{ color: 'var(--info-color)', fontWeight: 'bold' }}>
                  {(forecast.reduce((sum, f) => sum + parseFloat(f.confidence), 0) / forecast.length).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historical + Forecast Chart */}
      <div className="card">
        <div className="card-header">
          <h2>Sales Forecast - Historical vs Predicted</h2>
        </div>
        <div className="chart-container chart-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastWithHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => value.toLocaleString()}
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Sales"
                dot={({ isForecast }) => isForecast ? { fill: '#f59e0b', r: 5 } : { fill: '#2563eb', r: 4 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Forecast Table */}
      <div className="card">
        <div className="card-header">
          <h2>6-Month Sales Forecast Details</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Predicted Sales</th>
                <th>Predicted Revenue</th>
                <th>Confidence Level</th>
                <th>Range (Low-High)</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.month}</strong></td>
                  <td>${item.predictedSales.toLocaleString()}</td>
                  <td>${item.predictedRevenue.toLocaleString()}</td>
                  <td>
                    <span style={{
                      fontWeight: 'bold',
                      color: parseFloat(item.confidence) > 80 ? '#10b981' : parseFloat(item.confidence) > 70 ? '#f59e0b' : '#ef4444'
                    }}>
                      {item.confidence}%
                    </span>
                  </td>
                  <td>{item.range}</td>
                  <td style={{ fontSize: '0.9rem' }}>
                    {idx < 2 && <span className="badge badge-success">High Confidence</span>}
                    {idx >= 2 && idx < 4 && <span className="badge badge-warning">Medium Confidence</span>}
                    {idx >= 4 && <span className="badge badge-info">Use with Caution</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Items */}
      <div className="card">
        <div className="card-header">
          <h2>📋 Recommendations Based on Forecast</h2>
        </div>
        <div className="grid grid-2">
          <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#059669' }}>✓ Procurement Planning</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>Increase orders by 15-20% in months 3-4 to meet predicted demand surge</li>
              <li>Negotiate volume discounts with suppliers for upcoming high-demand months</li>
              <li>Schedule vendor deliveries strategically to optimize warehouse space</li>
            </ul>
          </div>

          <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#b45309' }}>⚠️ Inventory Optimization</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>Maintain higher safety stock levels in months 1-2</li>
              <li>Review slow-moving items in low-demand forecast periods</li>
              <li>Adjust reorder points based on predicted seasonal variations</li>
            </ul>
          </div>

          <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💰 Financial Planning</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>Allocate budget for increased inventory investment</li>
              <li>Plan marketing campaigns to align with high-demand months</li>
              <li>Project cash flow based on revenue forecast</li>
            </ul>
          </div>

          <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>🎯 Risk Mitigation</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>Develop contingency plans for lower-than-expected demand</li>
              <li>Build relationships with backup suppliers for high-demand items</li>
              <li>Monitor actual vs. predicted sales weekly and adjust inventory</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="alert alert-warning" style={{ marginTop: '20px' }}>
        <strong>⚠️ Model Limitations:</strong> Forecasts assume normal market conditions and historical patterns continue. External factors (seasonality, market disruptions, competitor actions) may affect accuracy. Use forecasts as guidance combined with domain expertise and real-time monitoring.
      </div>
    </div>
  );
}
