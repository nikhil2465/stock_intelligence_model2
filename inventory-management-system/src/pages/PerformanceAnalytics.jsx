import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { inventoryItems, monthlySalesData, supplierPerformance } from '../data/database';
import StockIntelligenceAI from '../utils/StockIntelligenceAI';

export default function PerformanceAnalytics() {
  const [trendAnalysis, setTrendAnalysis] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);

  useEffect(() => {
    const ai = new StockIntelligenceAI(inventoryItems);
    const trends = ai.analyzeTrends(monthlySalesData);
    setTrendAnalysis(trends);
    setSuppliersData(supplierPerformance);
  }, []);

  return (
    <div>
      {/* Performance Metrics */}
      <div className="grid grid-3">
        <div className="stat-card success">
          <h3>Average Growth Rate</h3>
          <div className="value">
            {trendAnalysis.length > 0 
              ? (trendAnalysis.reduce((sum, t) => sum + parseFloat(t.growthRate), 0) / trendAnalysis.length).toFixed(2) 
              : '0'}
            %
          </div>
          <div className="trend">Last 5 months average</div>
        </div>
        <div className="stat-card">
          <h3>Total Revenue (6 months)</h3>
          <div className="value">
            ${monthlySalesData.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}
          </div>
          <div className="trend">All months combined</div>
        </div>
        <div className="stat-card success">
          <h3>Average Units/Month</h3>
          <div className="value">
            {(monthlySalesData.reduce((sum, m) => sum + m.units, 0) / monthlySalesData.length).toFixed(0)}
          </div>
          <div className="trend">Across 6 months</div>
        </div>
      </div>

      {/* Sales Performance Trend */}
      <div className="card">
        <div className="card-header">
          <h2>Sales Performance & Growth Analysis</h2>
        </div>
        <div className="chart-container chart-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Sales ($)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Units Sold', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} name="Sales ($)" />
              <Line yAxisId="right" type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} name="Units Sold" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Rate Analysis */}
      <div className="card">
        <div className="card-header">
          <h2>Month-over-Month Growth Rate</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Growth Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => `${value.toFixed(2)}%`}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar 
                dataKey="growthRate" 
                fill={({ growthRate }) => parseFloat(growthRate) > 0 ? '#10b981' : '#ef4444'}
                name="Growth Rate"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Contribution */}
      <div className="card">
        <div className="card-header">
          <h2>Revenue Contribution by Month</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#2563eb" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supplier Performance */}
      <div className="card">
        <div className="card-header">
          <h2>Supplier Performance Matrix</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Analyzing delivery time vs quality score for all suppliers
        </p>
        <div className="chart-container chart-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="deliveryTime" name="Delivery Time (Days)" />
              <YAxis type="number" dataKey="qualityScore" name="Quality Score" domain={[0, 5]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Suppliers" data={suppliersData} fill="#2563eb" line shape="circle" />
              {suppliersData.map((supplier, idx) => (
                <Scatter 
                  key={idx} 
                  data={[supplier]} 
                  fill="#2563eb"
                  label={{
                    value: supplier.name.substring(0, 8),
                    position: 'top',
                    offset: 10,
                    fontSize: 12,
                    fill: '#64748b'
                  }}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <div className="card-header">
          <h2>Detailed Monthly Performance</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Sales ($)</th>
                <th>Revenue ($)</th>
                <th>Units Sold</th>
                <th>Growth Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trendAnalysis.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.month}</strong></td>
                  <td>${item.sales.toLocaleString()}</td>
                  <td><strong>${item.revenue.toLocaleString()}</strong></td>
                  <td>{item.units} units</td>
                  <td>
                    <span style={{ 
                      color: parseFloat(item.growthRate) > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 600
                    }}>
                      {parseFloat(item.growthRate) > 0 ? '📈' : '📉'} {item.growthRate}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${item.trend.includes('Growth') ? 'success' : item.trend.includes('Decline') ? 'danger' : 'info'}`}>
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
