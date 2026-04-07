import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { inventoryItems, monthlySalesData, dailySalesData, categoryData } from '../data/database';
import StockIntelligenceAI from '../utils/StockIntelligenceAI';
import './Dashboard.css';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const ai = new StockIntelligenceAI(inventoryItems);
    const calculatedKPIs = ai.calculateKPIs(inventoryItems, monthlySalesData);
    setKpis(calculatedKPIs);

    const lowStock = inventoryItems.filter(item => item.quantity < item.reorderLevel).slice(0, 5);
    setLowStockItems(lowStock);
  }, []);

  if (!kpis) return <div className="spinner"></div>;

  return (
    <div className="dashboard-container">
      {/* KPIs Grid */}
      <div className="kpi-grid">
        <div className="stat-card info">
          <h3>💰 Total Inventory Value</h3>
          <div className="value">${kpis.totalInventoryValue}</div>
          <div className="trend">+2.5% from last month</div>
        </div>
        <div className="stat-card success">
          <h3>📈 Monthly Growth</h3>
          <div className="value">{kpis.monthlyGrowthRate}%</div>
          <div className="trend">Last month performance</div>
        </div>
        <div className="stat-card warning">
          <h3>⚠️ Low Stock Items</h3>
          <div className="value">{kpis.lowStockItems}</div>
          <div className="trend">Requires attention</div>
        </div>
        <div className="stat-card success">
          <h3>❤️ Health Score</h3>
          <div className="value">{kpis.inventoryHealthScore}</div>
          <div className="trend">Overall inventory status</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Sales Trend */}
        <div className="card">
          <div className="card-header">
            <h2>📊 Monthly Sales Trend</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1e40af" strokeWidth={2} dot={{ fill: '#1e40af', r: 5 }} />
                <Line type="monotone" dataKey="units" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h2>🏷️ Inventory by Category</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="card">
        <div className="card-header">
          <h2>⚠️ Low Stock Alert</h2>
        </div>
        {lowStockItems.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.quantity} units</td>
                    <td>{item.reorderLevel} units</td>
                    <td>
                      <span className={`badge badge-${item.quantity === 0 ? 'danger' : item.quantity < item.reorderLevel / 2 ? 'danger' : 'warning'}`}>
                        {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm">Reorder</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>✓ All items are well stocked</h3>
            <p>No low stock warnings at the moment</p>
          </div>
        )}
      </div>

      {/* Daily Sales */}
      <div className="card">
        <div className="card-header">
          <h2>📅 Daily Sales (Last 30 Days)</h2>
        </div>
        <div className="chart-container chart-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#1e40af" />
              <Bar dataKey="returns" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
