import { useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { inventoryItems } from '../data/database';
import './InventoryListing.css';

export default function InventoryListing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [...new Set(inventoryItems.map(item => item.category))];

  // Calculate KPIs
  const totalInventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const itemsLowStock = inventoryItems.filter(item => item.quantity < item.reorderLevel).length;
  const totalUnits = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const averageUnitPrice = (inventoryItems.reduce((sum, item) => sum + item.unitPrice, 0) / inventoryItems.length).toFixed(2);

  let filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  filteredItems = filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'quantity':
        return b.quantity - a.quantity;
      case 'value':
        return (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (item) => {
    if (item.quantity === 0) return 'danger';
    if (item.quantity < item.reorderLevel) return 'danger';
    if (item.quantity < item.reorderLevel * 1.5) return 'warning';
    return 'success';
  };

  // Chart data
  const categoryDistribution = categories.map(cat => {
    const items = inventoryItems.filter(item => item.category === cat);
    return {
      name: cat,
      value: items.reduce((sum, item) => sum + item.quantity, 0),
      count: items.length
    };
  });

  const statusDistribution = [
    { name: 'In Stock', value: inventoryItems.filter(item => item.quantity >= item.reorderLevel * 1.5).length },
    { name: 'Low Stock', value: inventoryItems.filter(item => item.quantity < item.reorderLevel * 1.5 && item.quantity >= item.reorderLevel).length },
    { name: 'Critical', value: inventoryItems.filter(item => item.quantity < item.reorderLevel && item.quantity > 0).length },
    { name: 'Out of Stock', value: inventoryItems.filter(item => item.quantity === 0).length }
  ];

  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#dc2626'];

  return (
    <div className="inventory-container">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-icon">📦</div>
        <div className="header-content">
          <h1>Inventory Management</h1>
          <p>Comprehensive inventory tracking and management system</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metrics-grid">
        <div className="metric-card metric-primary">
          <div className="metric-icon">💰</div>
          <div className="metric-body">
            <span className="metric-label">Total Inventory Value</span>
            <span className="metric-value">${(totalInventoryValue / 1000).toFixed(1)}K</span>
            <span className="metric-detail">All items combined</span>
          </div>
        </div>

        <div className="metric-card metric-info">
          <div className="metric-icon">📦</div>
          <div className="metric-body">
            <span className="metric-label">Total Units</span>
            <span className="metric-value">{totalUnits.toLocaleString()}</span>
            <span className="metric-detail">{inventoryItems.length} different items</span>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon">⚠️</div>
          <div className="metric-body">
            <span className="metric-label">Low Stock Items</span>
            <span className="metric-value">{itemsLowStock}</span>
            <span className="metric-detail">Require attention</span>
          </div>
        </div>

        <div className="metric-card metric-secondary">
          <div className="metric-icon">💵</div>
          <div className="metric-body">
            <span className="metric-label">Avg Unit Price</span>
            <span className="metric-value">${averageUnitPrice}</span>
            <span className="metric-detail">Average price per item</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Stock Health Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card">
        <div className="card-header">
          <h2>🔍 Search & Filter</h2>
          <button className="btn btn-primary">+ Add Item</button>
        </div>

        <div className="filters-grid">
          <div className="form-group">
            <label>Search Products</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Filter by Category</label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Product Name</option>
              <option value="quantity">Quantity (High to Low)</option>
              <option value="value">Inventory Value</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="card-header">
          <h2>📋 Inventory Records</h2>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                  className={selectedItem?.id === item.id ? 'selected' : ''}
                >
                  <td className="sku-cell">
                    <code>{item.sku}</code>
                  </td>
                  <td className="name-cell"><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td className="qty-cell">
                    <span className="qty-badge">{item.quantity}</span>
                  </td>
                  <td className="cost-cell">${item.unitPrice.toFixed(2)}</td>
                  <td className="value-cell">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                  <td>{item.reorderLevel}</td>
                  <td>
                    <span className={`badge badge-${getStatusColor(item)}`}>
                      {item.quantity === 0 ? 'Out of Stock' : item.quantity < item.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-primary btn-sm">Edit</button>
                      <button className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-item">
            <span className="summary-label">Showing {filteredItems.length} of {inventoryItems.length} items</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Value:</span>
            <span className="summary-value">${filteredItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Units:</span>
            <span className="summary-value">{filteredItems.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Item Details Panel */}
      {selectedItem && (
        <div className="item-details-panel">
          <div className="panel-header">
            <h3>Item Details: {selectedItem.name}</h3>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">SKU</span>
              <span className="detail-value">{selectedItem.sku}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{selectedItem.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Quantity on Hand</span>
              <span className="detail-value">{selectedItem.quantity} units</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Reorder Level</span>
              <span className="detail-value">{selectedItem.reorderLevel} units</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Unit Price</span>
              <span className="detail-value">${selectedItem.unitPrice.toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Value</span>
              <span className="detail-value">${(selectedItem.quantity * selectedItem.unitPrice).toFixed(2)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className={`badge badge-${getStatusColor(selectedItem)}`}>
                {selectedItem.quantity === 0 ? 'Out of Stock' : selectedItem.quantity < selectedItem.reorderLevel ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
