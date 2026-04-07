import { useState } from 'react';
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
  {
    label: 'Revenue MTD',
    value: '₹28.4L',
    detail: '▲ 9.2% vs last month',
    accent: 'success',
  },
  {
    label: 'Gross Margin',
    value: '22.4%',
    detail: '▲ 1.1% vs last month',
    accent: 'success',
  },
  {
    label: 'Dead Stock Value',
    value: '₹4.2L',
    detail: '3 SKUs · 90+ days unsold',
    accent: 'warning',
  },
  {
    label: 'Outstanding Receivables',
    value: '₹12.8L',
    detail: '4 overdue accounts',
    accent: 'danger',
  },
  {
    label: 'Orders Today',
    value: '24',
    detail: '18 dispatched · 6 pending',
    accent: 'info',
  },
  {
    label: 'Low Stock Alerts',
    value: '7 SKUs',
    detail: '18mm BWP critical',
    accent: 'purple',
  },
];

const dealerCards = [
  {
    label: 'At-Risk Customers',
    value: '8 accounts',
    detail: '₹6.4L/mo revenue',
    accent: 'danger',
  },
  {
    label: 'Stock Turnover',
    value: '4.2×',
    detail: '18mm BWP best mover',
    accent: 'success',
  },
  {
    label: 'Purchase vs Sales',
    value: '1.18×',
    detail: 'Overstock risk',
    accent: 'warning',
  },
  {
    label: 'Average Stock Cover',
    value: '22 days',
    detail: '18mm BWP only 8 days',
    accent: 'info',
  },
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
  { name: 'BWP', value: 38 },
  { name: 'MR', value: 28 },
  { name: 'Commercial', value: 18 },
  { name: 'Laminates', value: 11 },
  { name: 'Others', value: 5 },
];

const customerTypeData = [
  { name: 'Contractors', value: 44 },
  { name: 'Interior Firms', value: 26 },
  { name: 'Retailers', value: 18 },
  { name: 'Carpenters', value: 12 },
];

const alerts = [
  {
    title: '₹4.2L Dead Stock — 3 SKUs Stagnant 90+ Days',
    description:
      '6mm Gurjan, 4mm MR plain, 19mm commercial. AI recommends discounting or returning to supplier.',
    level: 'Critical',
  },
  {
    title: 'City Interiors — 47 Days No Order',
    description:
      'Silent account worth ₹2.4L/mo. AI suggests sales outreach to avoid churn.',
    level: 'High',
  },
  {
    title: 'Gauri Laminates — 2 Delivery Delays',
    description:
      '8mm flexi board deliveries late. Evaluate alternate sourcing for pending orders.',
    level: 'Medium',
  },
  {
    title: '18mm BWP Stock at 8 Days',
    description:
      'Order 200 sheets today; lead time is 6 days and daily sale is 17 sheets.',
    level: 'Urgent',
  },
];

const topSkus = [
  { sku: '18mm BWP', sold: 46, trend: '+18%' },
  { sku: '12mm MR', sold: 38, trend: '+6%' },
  { sku: '12mm BWP', sold: 31, trend: '+9%' },
  { sku: '18mm MR', sold: 24, trend: '0%' },
  { sku: 'Laminates', sold: 18, trend: '-4%' },
];

const quickQuestions = [
  'Which products should I reorder today?',
  "Which customers haven't ordered in 30 days?",
  'What is my dead stock and how do I clear it?',
  'Which supplier is giving me the worst deal?',
  'Why did my margin drop this month?',
];

const cannedAnswers = [
  {
    test: /reorder|products should i reorder|restock|stock.*up|replenish/i,
    answer:
      'Reorder 18mm BWP immediately: only 8 days cover remains and daily sale is 17 sheets. Also order 12mm BWP this week to avoid a gap in the top SKUs.',
    intent: 'Reorder planning',
  },
  {
    test: /haven?t ordered|silent|30 days|churn|account/i,
    answer:
      'City Interiors has not ordered in 47 days; this is a ₹2.4L/mo account. Reach out with a targeted offer to keep the relationship active.',
    intent: 'Customer engagement',
  },
  {
    test: /dead stock|clear it|deadstock|slow moving|stagnant stock/i,
    answer:
      '₹4.2L is stuck in dead stock. Start with a 12% discount on 6mm Gurjan and bundle 4mm MR plain with larger 18mm BWP orders.',
    intent: 'Dead stock clearance',
  },
  {
    test: /supplier|worst deal|gauri|delivery delay|lead time|supply/i,
    answer:
      'Gauri Laminates is the weak supplier: 68% on-time delivery and +6% above market price. Consider shifting 8mm flexi business to Supreme Laminates or Century Plyboards.',
    intent: 'Supplier performance',
  },
  {
    test: /margin|profit drop|margin drop|profitability|gross margin/i,
    answer:
      'Margin is at 22.4%; the largest gap is on Commercial grade. Focus selling higher-margin BWP and reduce discounting to improve profitability.',
    intent: 'Margin analysis',
  },
];

const intentPatterns = [
  { label: 'Reorder planning', tests: [/reorder|restock|stock.*up|replenish/i], focus: 'replenishment and critical SKUs' },
  { label: 'Customer engagement', tests: [/haven?t ordered|silent|churn|customer/i], focus: 'inactive accounts and retention' },
  { label: 'Dead stock clearance', tests: [/dead stock|deadstock|slow moving|stagnant/i], focus: 'discounting and stock clearance' },
  { label: 'Supplier performance', tests: [/supplier|delivery delay|lead time|supply/i], focus: 'supplier reliability and lead time' },
  { label: 'Margin analysis', tests: [/margin|profit|profitability|gross margin/i], focus: 'pricing and profitability' },
  { label: 'Stock health', tests: [/coverage|days cover|reorder point|safety stock|stock health/i], focus: 'inventory coverage and stock status' },
  { label: 'Sales trend', tests: [/sales|trend|mover|demand/i], focus: 'top-selling SKUs and demand signals' },
];

function analyzeQuery(text) {
  const normalized = text.trim().toLowerCase();
  const matchedIntents = intentPatterns.filter((pattern) => pattern.tests.some((test) => test.test(normalized)));
  const primary = matchedIntents.length ? matchedIntents[0].label : 'General business query';
  const focus = matchedIntents.length ? matchedIntents[0].focus : 'key inventory, sales, and supplier signals';
  const confidence = Math.min(0.95, 0.6 + matchedIntents.length * 0.1).toFixed(2);
  const categories = matchedIntents.map((pattern) => pattern.label).join(', ') || 'General insight';

  return {
    primary,
    focus,
    categories,
    confidence,
    summary: `Analysis: Intent = ${primary}. Focus = ${focus}. Categories = ${categories}. Confidence = ${Math.round(confidence * 100)}%.`,
  };
}

function generateAnswer(text) {
  const normalized = text.trim();
  const candidate = cannedAnswers.find((item) => item.test.test(normalized));

  if (candidate) {
    return {
      answer: candidate.answer,
      intent: candidate.intent,
    };
  }

  const analysis = analyzeQuery(normalized);
  const { primary } = analysis;

  const fallbackAnswers = {
    'Reorder planning':
      'Based on current stock signals, prioritize reorder for 18mm BWP and 12mm BWP. Keep safety stock for high-demand SKUs and avoid gaps in top seller coverage.',
    'Customer engagement':
      'Check customer ordering frequency and reach out to silent accounts like City Interiors. Offer a targeted incentive to recover at-risk revenue.',
    'Dead stock clearance':
      'Focus on dead stock items such as 6mm Gurjan and 4mm MR plain. Use bundle discounts or promotions to move aged inventory.',
    'Supplier performance':
      'Review supplier delivery performance and prioritize stable suppliers for urgent orders. Poor on-time delivery should trigger alternate sourcing.',
    'Margin analysis':
      'Improve margins by pushing higher-margin BWP grades and reducing discounting on commercial products. Track profit drivers with current sales mix.',
    'Stock health':
      'Compare quantity on hand with reorder points and lead times. Use low stock alerts to restock critical products before cover falls below required days.',
    'Sales trend':
      'Review top-selling SKUs and recent trend data to align reorder decisions with demand. Maintain a strong buffer for the fastest-moving products.',
  };

  return {
    answer:
      fallbackAnswers[primary] ||
      'I am analyzing the inventory, customer, supplier, and sales signals now. Please clarify if you need inventory, supplier, customer, margin, or sales insight so I can provide the most accurate recommendation.',
    intent: primary,
  };
}

export default function StockSenseAI() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am StockSense AI. I can answer questions about inventory, customers, suppliers, sales, and cash flow from your dealer management data.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((current) => [...current, { role: 'user', text }]);
    setInput('');

    const analysis = analyzeQuery(text);
    const { answer } = generateAnswer(text);

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: 'analysis', text: analysis.summary },
        { role: 'assistant', text: answer },
      ]);
    }, 250);
  };

  const handleQuickQuestion = (question) => {
    setMessages((current) => [...current, { role: 'user', text: question }]);
    const analysis = analyzeQuery(question);
    const { answer } = generateAnswer(question);

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: 'analysis', text: analysis.summary },
        { role: 'assistant', text: answer },
      ]);
    }, 250);
  };

  return (
    <div className="stock-ai-page">
      <section className="ai-hero card">
        <div>
          <span className="eyebrow">StockSense AI</span>
          <h1>Inventory Intelligence for Dealers</h1>
          <p>
            A dealer-grade intelligence layer powered by your existing inventory and order data. This page uses the same business insights, AI briefing, and dealer-focused metrics
            shown in the original StockSense AI platform demo.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-success">DMS Connected</span>
          <span className="badge badge-info">AI Active</span>
          <span className="badge badge-purple">Demo: Plywood Dealer</span>
        </div>
      </section>

      <section className="banner-row">
        <div className="data-source card">
          <strong>Live data from your dealer management system.</strong>
          StockSense AI reads stock, purchase prices, selling prices, and movement history to generate actionable recommendations.
        </div>
        <div className="ai-brief card">
          <div className="brief-label">AI Daily Brief</div>
          <p>
            Revenue is up 9.2% this month. 18mm BWP and 12mm MR are top movers. Dead stock worth ₹4.2L is sitting unsold for 90+ days, and customer City Interiors is silent for 47 days.
          </p>
          <p>
            Supplier delays from Gauri Laminates are affecting fulfilment, and 18mm BWP only has 8 days of cover remaining.
          </p>
        </div>
      </section>

      <section className="kpi-grid">
        {overviewCards.map((item) => (
          <div key={item.label} className={`metric-card metric-${item.accent}`}>
            <span className="metric-label">{item.label}</span>
            <div className="metric-value">{item.value}</div>
            <div className="metric-detail">{item.detail}</div>
          </div>
        ))}
      </section>

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
                  <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={3} dot={false} />
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
                      <Cell key={entry.name} fill={['#0f766e', '#2563eb', '#d97706', '#9333ea', '#9ca3af'][index]} />
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
                      <Cell key={entry.name} fill={['#0f766e', '#2563eb', '#d97706', '#9333ea'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

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

      <section className="section two-column-grid">
        <div className="card">
          <div className="card-header">
            <h2>AI Alerts — Action Required</h2>
          </div>
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
          <div className="card-header">
            <h2>Top 5 Selling SKUs Today</h2>
          </div>
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

      <section className="section chat-section">
        <div className="card chat-card">
          <div className="card-header">
            <h2>AI Assistant</h2>
          </div>
          <div className="chat-body">
            <div className="quick-questions">
              {quickQuestions.map((question) => (
                <button key={question} className="quick-btn" onClick={() => handleQuickQuestion(question)}>
                  {question}
                </button>
              ))}
            </div>
            <div className="chat-messages">
              {messages.map((message, idx) => (
                <div key={`${message.role}-${idx}`} className={`chat-message chat-${message.role}`}>
                  {message.role === 'assistant' && <div className="chat-role">StockSense AI</div>}
                  {message.role === 'analysis' && <div className="chat-role chat-analysis-role">Analysis</div>}
                  <div>{message.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask your inventory assistant..."
                onKeyDown={(event) => event.key === 'Enter' && handleSend()}
              />
              <button className="btn btn-primary" onClick={handleSend}>
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
