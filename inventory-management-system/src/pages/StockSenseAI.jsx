import { useState, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './StockSenseAI.css';

const overviewCards = [
  { label: 'Revenue MTD',            value: '₹28.4L',  detail: '▲ 9.2% vs last month',        accent: 'success' },
  { label: 'Gross Margin',           value: '22.4%',   detail: '▲ 1.1% vs last month',        accent: 'success' },
  { label: 'Dead Stock Value',       value: '₹4.2L',   detail: '3 SKUs · 90+ days unsold',    accent: 'warning' },
  { label: 'Outstanding Receivables',value: '₹12.8L',  detail: '4 overdue accounts',          accent: 'danger'  },
  { label: 'Orders Today',           value: '24',      detail: '18 dispatched · 6 pending',   accent: 'info'    },
  { label: 'Low Stock Alerts',       value: '7 SKUs',  detail: '18mm BWP critical',           accent: 'purple'  },
];

const dealerCards = [
  { label: 'At-Risk Customers',   value: '8 accounts', detail: '₹6.4L/mo revenue', accent: 'danger'  },
  { label: 'Stock Turnover',      value: '4.2×',       detail: '18mm BWP best mover', accent: 'success' },
  { label: 'Purchase vs Sales',   value: '1.18×',      detail: 'Overstock risk',    accent: 'warning' },
  { label: 'Average Stock Cover', value: '22 days',    detail: '18mm BWP only 8 days', accent: 'info' },
];

const revenueTrend = [
  { month: 'Jul', revenue: 19.2, profit: 4.1 },
  { month: 'Aug', revenue: 20.1, profit: 4.4 },
  { month: 'Sep', revenue: 21.4, profit: 4.6 },
  { month: 'Oct', revenue: 22.8, profit: 5.0 },
  { month: 'Nov', revenue: 21.6, profit: 4.8 },
  { month: 'Dec', revenue: 20.4, profit: 4.2 },
  { month: 'Jan', revenue: 22.1, profit: 4.8 },
  { month: 'Feb', revenue: 23.8, profit: 5.4 },
  { month: 'Mar', revenue: 24.4, profit: 5.5 },
  { month: 'Apr', revenue: 25.2, profit: 5.7 },
  { month: 'May', revenue: 26.0, profit: 5.8 },
  { month: 'Jun', revenue: 28.4, profit: 6.36 },
];

const gradeData = [
  { name: 'BWP',        value: 38 },
  { name: 'MR',         value: 28 },
  { name: 'Commercial', value: 18 },
  { name: 'Laminates',  value: 11 },
  { name: 'Others',     value: 5  },
];

const customerTypeData = [
  { name: 'Contractors',    value: 44 },
  { name: 'Interior Firms', value: 26 },
  { name: 'Retailers',      value: 18 },
  { name: 'Carpenters',     value: 12 },
];

const alerts = [
  {
    title: '₹4.2L Dead Stock — 3 SKUs Stagnant 90+ Days',
    description: '6mm Gurjan, 4mm MR plain, 19mm commercial. AI recommends discounting or returning to supplier.',
    level: 'Critical',
  },
  {
    title: 'City Interiors — 47 Days No Order',
    description: 'Silent account worth ₹2.4L/mo. AI suggests sales outreach to avoid churn.',
    level: 'High',
  },
  {
    title: 'Gauri Laminates — 2 Delivery Delays',
    description: '8mm flexi board deliveries late. Evaluate alternate sourcing for pending orders.',
    level: 'Medium',
  },
  {
    title: '18mm BWP Stock at 8 Days',
    description: 'Order 200 sheets today; lead time is 6 days and daily sale is 17 sheets.',
    level: 'Urgent',
  },
];

const topSkus = [
  { sku: '18mm BWP',  sold: 46, trend: '+18%' },
  { sku: '12mm MR',   sold: 38, trend: '+6%'  },
  { sku: '12mm BWP',  sold: 31, trend: '+9%'  },
  { sku: '18mm MR',   sold: 24, trend: '0%'   },
  { sku: 'Laminates', sold: 18, trend: '-4%'  },
];

const quickQuestions = [
  'Which products should I reorder today?',
  "Which customers haven't ordered in 30 days?",
  'What is my dead stock and how do I clear it?',
  'Which supplier is giving me the worst deal?',
  'Why did my margin drop this month?',
];

const MODES = [
  {
    id: 'ask',
    label: 'Ask',
    icon: '💬',
    description: 'Direct answers — fast, precise responses',
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: '🔍',
    description: 'Deep analysis with RCA — structured breakdown',
  },
  {
    id: 'act',
    label: 'Act',
    icon: '⚡',
    description: 'Action plan — numbered steps you can execute now',
  },
];

const API_BASE = '/api';

function getBackendBadgeClass(online) {
  if (online === null) return 'badge-muted';
  return online ? 'badge-info' : 'badge-danger';
}

function getBackendBadgeText(online) {
  if (online === null) return 'AI Connecting…';
  return online ? 'AI Active · GPT-4o' : 'AI Offline';
}

export default function StockSenseAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am StockSense AI — powered by GPT-4o. Select a mode below, then ask me anything about your inventory, customers, suppliers, sales, or cash flow.',
      meta: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('ask');
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const buildHistory = () =>
    messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text }));

  const sendMessage = async (question) => {
    if (!question.trim() || loading) return;
    const text = question.trim();
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', text, meta: null }]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          mode,
          history: buildHistory(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Server error');
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          meta: {
            mode: data.mode,
            intent: data.intent,
            tools: data.tools_used,
            rca: data.rca_summary,
          },
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          text: `⚠️ ${err.message || 'Could not reach the AI backend. Make sure the FastAPI server is running on port 8000.'}`,
          meta: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);
  const handleQuickQuestion = (q) => sendMessage(q);

  return (
    <div className="stock-ai-page">
      {/* Hero */}
      <section className="ai-hero card">
        <div>
          <span className="eyebrow">StockSense AI</span>
          <h1>Inventory Intelligence for Dealers</h1>
          <p>
            A dealer-grade intelligence layer powered by your existing inventory and order data.
            This page uses the same business insights, AI briefing, and dealer-focused metrics
            shown in the original StockSense AI platform demo.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-success">DMS Connected</span>
          <span className={`badge ${getBackendBadgeClass(backendOnline)}`}>
            {getBackendBadgeText(backendOnline)}
          </span>
          <span className="badge badge-purple">Demo: Plywood Dealer</span>
        </div>
      </section>

      {/* Banner */}
      <section className="banner-row">
        <div className="data-source card">
          <strong>Live data from your dealer management system.</strong>
          StockSense AI reads stock, purchase prices, selling prices, and movement history to generate actionable recommendations.
        </div>
        <div className="ai-brief card">
          <div className="brief-label">AI Daily Brief</div>
          <p>
            Revenue is up 9.2% this month. 18mm BWP and 12mm MR are top movers. Dead stock worth ₹4.2L is sitting
            unsold for 90+ days, and customer City Interiors is silent for 47 days.
          </p>
          <p>
            Supplier delays from Gauri Laminates are affecting fulfilment, and 18mm BWP only has 8 days of cover remaining.
          </p>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpi-grid">
        {overviewCards.map((item) => (
          <div key={item.label} className={`metric-card metric-${item.accent}`}>
            <span className="metric-label">{item.label}</span>
            <div className="metric-value">{item.value}</div>
            <div className="metric-detail">{item.detail}</div>
          </div>
        ))}
      </section>

      {/* Charts */}
      <section className="section">
        <div className="section-title-row">
          <div>
            <h2>Revenue & Market Intelligence</h2>
            <p>Monthly trend, product grade composition, and customer segment mix for your dealer business.</p>
          </div>
        </div>
        <div className="chart-row chart-grid-3">
          <div className="chart-card card chart-large">
            <div className="chart-header">Revenue & Gross Profit</div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueTrend} margin={{ top: 18, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e6ec" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="profit"  stroke="#2563eb" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card card chart-small">
            <div className="chart-header">Revenue by Product Grade</div>
            <div className="chart-wrapper chart-pie">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={gradeData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={4}>
                    {gradeData.map((entry, index) => (
                      <Cell key={entry.name} fill={['#0f766e','#2563eb','#d97706','#9333ea','#9ca3af'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card card chart-small">
            <div className="chart-header">Customer Mix</div>
            <div className="chart-wrapper chart-pie">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={customerTypeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={4}>
                    {customerTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={['#0f766e','#2563eb','#d97706','#9333ea'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Dealer KPIs */}
      <section className="section">
        <div className="section-title-row">
          <div>
            <h2>Dealer Operations KPIs</h2>
            <p>Operational intelligence for stock, customer risk, purchasing, and fulfilment.</p>
          </div>
        </div>
        <div className="dealer-grid">
          {dealerCards.map((item) => (
            <div key={item.label} className={`metric-card metric-${item.accent}`}>
              <span className="metric-label">{item.label}</span>
              <div className="metric-value">{item.value}</div>
              <div className="metric-detail">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alerts + Top SKUs */}
      <section className="section two-column-grid">
        <div className="card">
          <div className="card-header"><h2>AI Alerts — Action Required</h2></div>
          <div className="alert-list">
            {alerts.map((alert) => (
              <div key={alert.title} className="alert-card">
                <strong>{alert.title}</strong>
                <p>{alert.description}</p>
                <span className={`alert-badge alert-${alert.level.toLowerCase()}`}>{alert.level}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Top 5 Selling SKUs Today</h2></div>
          <div className="sku-list">
            {topSkus.map((sku) => (
              <div key={sku.sku} className="sku-row">
                <div>
                  <strong>{sku.sku}</strong>
                  <div className="sku-meta">{sku.sold} sheets sold</div>
                </div>
                <span className="sku-trend">{sku.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      <section className="section chat-section">
        <div className="card chat-card">
          <div className="card-header chat-card-header">
            <h2>AI Assistant</h2>
            <span className="powered-badge">Powered by GPT-4o</span>
          </div>

          {/* Mode selector */}
          <div className="mode-selector">
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`mode-btn ${mode === m.id ? 'mode-btn-active' : ''}`}
                onClick={() => setMode(m.id)}
                title={m.description}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-label">{m.label}</span>
                <span className="mode-desc">{m.description}</span>
              </button>
            ))}
          </div>

          <div className="chat-body">
            {/* Quick questions */}
            <div className="quick-questions">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(question)}
                  disabled={loading}
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((message, idx) => (
                <div
                  key={`${message.role}-${idx}`}
                  className={`chat-message chat-${message.role}`}
                >
                  {message.role === 'assistant' && (
                    <div className="chat-role">
                      StockSense AI
                      {message.meta && (
                        <span className="chat-meta-tags">
                          <span className="meta-tag meta-mode">{message.meta.mode}</span>
                          <span className="meta-tag meta-intent">{message.meta.intent}</span>
                          {message.meta.tools?.length > 0 && (
                            <span className="meta-tag meta-tools" title={message.meta.tools.join(', ')}>
                              🔧 {message.meta.tools.length} tool{message.meta.tools.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  {message.role === 'error' && <div className="chat-role chat-error-role">Error</div>}
                  {(message.role === 'assistant' || message.role === 'error') ? (
                    <div className="chat-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(message.text) }} />
                  ) : (
                    <div className="chat-text">{message.text}</div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="chat-message chat-assistant">
                  <div className="chat-role">StockSense AI</div>
                  <div className="chat-loading">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                    <span className="loading-label">Analyzing with {MODES.find((m) => m.id === mode)?.label} mode…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input row */}
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask in ${MODES.find((m) => m.id === mode)?.label} mode…`}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                disabled={loading}
              />
              <button
                className={`btn btn-primary mode-send-btn mode-send-${mode}`}
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {MODES.find((m) => m.id === mode)?.icon} {MODES.find((m) => m.id === mode)?.label}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Safely escapes a string for use inside HTML attribute or text content
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Minimal markdown-to-HTML formatter (headers, bold, bullets).
// HTML-escaping is applied to each captured group so injected tags
// are always safe and the source text cannot break out of context.
function formatMarkdown(text) {
  if (!text) return '';
  // Split on lines, process each line, then rejoin
  return text
    .split('\n')
    .map((line) => {
      const h2 = line.match(/^## (.+)$/);
      if (h2) return `<strong class="md-h2">${escapeHtml(h2[1])}</strong>`;

      const h3 = line.match(/^### (.+)$/);
      if (h3) return `<strong class="md-h3">${escapeHtml(h3[1])}</strong>`;

      const oli = line.match(/^(\d+)\. (.+)$/);
      if (oli) return `<span class="md-li md-oli"><span class="md-num">${escapeHtml(oli[1])}.</span> ${inlineMarkdown(escapeHtml(oli[2]))}</span>`;

      const uli = line.match(/^[-•] (.+)$/);
      if (uli) return `<span class="md-li"><span class="md-bullet">•</span> ${inlineMarkdown(escapeHtml(uli[1]))}</span>`;

      return inlineMarkdown(escapeHtml(line));
    })
    .join('<br/>');
}

// Apply inline bold/italic after HTML-escaping
function inlineMarkdown(escaped) {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}
