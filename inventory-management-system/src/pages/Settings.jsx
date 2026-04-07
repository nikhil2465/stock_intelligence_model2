import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'Stock Intelligence Co.',
    email: 'admin@stockai.com',
    currency: 'USD',
    timezone: 'UTC-5',
    lowStockThreshold: 20,
    criticalStockThreshold: 5,
    enableNotifications: true,
    emailAlerts: true,
    darkMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      {saved && (
        <div className="alert alert-success">
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="grid grid-2">
        {/* Company Settings */}
        <div className="card">
          <div className="card-header">
            <h2>Company Settings</h2>
          </div>

          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={settings.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={settings.currency} onChange={handleChange}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select name="timezone" value={settings.timezone} onChange={handleChange}>
              <option value="UTC-8">Pacific (UTC-8)</option>
              <option value="UTC-6">Central (UTC-6)</option>
              <option value="UTC-5">Eastern (UTC-5)</option>
              <option value="UTC">UTC</option>
              <option value="UTC+1">Central Europe (UTC+1)</option>
              <option value="UTC+5:30">Indian (UTC+5:30)</option>
            </select>
          </div>
        </div>

        {/* Inventory Thresholds */}
        <div className="card">
          <div className="card-header">
            <h2>Inventory Thresholds</h2>
          </div>

          <div className="form-group">
            <label>Low Stock Warning Level (units)</label>
            <input
              type="number"
              name="lowStockThreshold"
              value={settings.lowStockThreshold}
              onChange={handleChange}
              min="1"
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
              Items below this level will show as "Low Stock"
            </small>
          </div>

          <div className="form-group">
            <label>Critical Stock Level (units)</label>
            <input
              type="number"
              name="criticalStockThreshold"
              value={settings.criticalStockThreshold}
              onChange={handleChange}
              min="1"
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
              Items below this level will show as "Critical"
            </small>
          </div>

          <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '6px', marginTop: '15px' }}>
            <strong style={{ color: '#1e40af' }}>Current Thresholds Applied:</strong>
            <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>
              Low Stock: {settings.lowStockThreshold} units | Critical: {settings.criticalStockThreshold} units
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="card-header">
          <h2>Notification & Alert Settings</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="notifications"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
            />
            <label htmlFor="notifications" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
              Enable In-App Notifications
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="emailAlerts"
              name="emailAlerts"
              checked={settings.emailAlerts}
              onChange={handleChange}
            />
            <label htmlFor="emailAlerts" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer' }}>
              Enable Email Alerts
            </label>
          </div>
        </div>

        <div style={{ marginTop: '20px', background: '#f0fdf4', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #10b981' }}>
          <strong style={{ color: '#059669' }}>Alert Triggers:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: 'var(--text-secondary)' }}>
            <li>Low stock levels detected</li>
            <li>Critical inventory items</li>
            <li>Slow-moving inventory</li>
            <li>Sales anomalies</li>
            <li>Supplier performance issues</li>
            <li>Forecast threshold breaches</li>
          </ul>
        </div>
      </div>

      {/* Display Settings */}
      <div className="card">
        <div className="card-header">
          <h2>Display Settings</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>Dark Mode</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Switch to dark theme for reduced eye strain
            </p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px', marginRight: '0' }}>
            <input
              type="checkbox"
              name="darkMode"
              checked={settings.darkMode}
              onChange={handleChange}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.darkMode ? '#2563eb' : '#ccc',
              transition: '.3s',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: settings.darkMode ? 'flex-end' : 'flex-start',
              paddingRight: settings.darkMode ? '4px' : '0',
              paddingLeft: settings.darkMode ? '0' : '4px'
            }}>
              <span style={{
                content: '""',
                height: '18px',
                width: '18px',
                left: settings.darkMode ? '4px' : '1px',
                bottom: '3px',
                backgroundColor: 'white',
                position: 'absolute',
                transition: '.3s',
                borderRadius: '50%',
              }}></span>
            </span>
          </label>
        </div>
      </div>

      {/* API & Integration Settings */}
      <div className="card">
        <div className="card-header">
          <h2>API & Integration</h2>
        </div>

        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <strong>API Status:</strong> ✓ Connected
          </p>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <strong>Last Sync:</strong> 2 minutes ago
          </p>
        </div>

        <button className="btn btn-primary" style={{ marginRight: '10px' }}>
          Generate API Key
        </button>
        <button className="btn btn-secondary">
          Test Connection
        </button>
      </div>

      {/* Database & Backup */}
      <div className="card">
        <div className="card-header">
          <h2>Data Management</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#b45309' }}>📊 Database</h3>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Status: <strong style={{ color: '#b45309' }}>Active</strong>
            </p>
            <button className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '5px' }}>
              Export Data
            </button>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Clear Cache
            </button>
          </div>

          <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #2563eb' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💾 Backup</h3>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Last Backup: <strong>Today at 2:30 PM</strong>
            </p>
            <button className="btn btn-primary btn-sm" style={{ width: '100%', marginBottom: '5px' }}>
              Backup Now
            </button>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Restore
            </button>
          </div>

          <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#991b1b' }}>⚠️ Danger Zone</h3>
            <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Irreversible actions
            </p>
            <button className="btn btn-danger btn-sm" style={{ width: '100%' }}>
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px', paddingBottom: '20px' }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: '1rem', padding: '12px 30px' }}>
          💾 Save Settings
        </button>
        <button className="btn btn-secondary" style={{ fontSize: '1rem', padding: '12px 30px' }}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
