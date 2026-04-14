import React, { useState, useRef, useEffect, useCallback } from 'react';

// ── CONSTANTS ──────────────────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    label: 'Stock & Inventory',
    icon: '📦',
    color: '#2563eb',
    queries: [
      'Which SKUs need immediate reorder?',
      'Show me dead stock recovery action plan',
      'What items are overstocked right now?',
    ],
  },
  {
    label: 'Finance & Margins',
    icon: '💰',
    color: '#15803d',
    queries: [
      'What is my real margin on 18mm BWP?',
      'Where is my cash locked right now?',
      'Why is my working capital stuck at 48 days?',
    ],
  },
  {
    label: 'Suppliers & Procurement',
    icon: '🏭',
    color: '#7c3aed',
    queries: [
      "What is Gauri Laminates' true landed cost?",
      'Which supplier should I expand orders with?',
      'How can I reduce freight cost by 20%?',
    ],
  },
  {
    label: 'Customers & Growth',
    icon: '👥',
    color: '#d97706',
    queries: [
      'Which customers are most at risk of churning?',
      'Send payment reminder to Sharma Constructions',
      'What should I do today to increase profit?',
    ],
  },
];

const MODE_CONFIG = {
  ask: {
    label: 'Ask', shortcut: '1',
    desc: 'Quick, data-backed answers with specific numbers.',
    color: '#2563eb', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe',
    badge: 'bb', icon: '💬', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  },
  explain: {
    label: 'Explain', shortcut: '2',
    desc: 'Deep Root Cause Analysis with 5-Why chains and business impact.',
    color: '#7c3aed', bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '#ddd6fe',
    badge: 'bp', icon: '🔍', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  },
  act: {
    label: 'Act', shortcut: '3',
    desc: 'Executable action plans with exact contacts, quantities and deadlines.',
    color: '#15803d', bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0',
    badge: 'bg', icon: '⚡', gradient: 'linear-gradient(135deg,#22c55e,#15803d)',
  },
};

const TOOL_LABELS = {
  stock: '📦 Stock', demand: '📈 Demand', supplier: '🏭 Supplier',
  customer: '👥 Customer', finance: '💰 Finance', order: '📋 Orders',
  freight: '🚛 Freight', email: '📧 Email',
};

// ── MARKDOWN RENDERER ──────────────────────────────────────────────────────────
function parseInline(text) {
  const tokens = String(text).split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**'))
      return <strong key={i}>{tok.slice(2, -2)}</strong>;
    if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2)
      return <em key={i}>{tok.slice(1, -1)}</em>;
    if (tok.startsWith('`') && tok.endsWith('`'))
      return <code key={i} className="md-code">{tok.slice(1, -1)}</code>;
    return tok;
  });
}

function MarkdownRenderer({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let orderedItems = [];
  let codeLines = [];
  let inCode = false;
  let codeKey = 0;

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="md-ul">
          {listItems.map((it, j) => <li key={j} className="md-li">{parseInline(it)}</li>)}
        </ul>
      );
      listItems = [];
    }
  };
  const flushOrdered = () => {
    if (orderedItems.length) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="md-ol">
          {orderedItems.map((it, j) => <li key={j} className="md-li">{parseInline(it)}</li>)}
        </ol>
      );
      orderedItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(<pre key={`pre-${codeKey++}`} className="md-pre"><code>{codeLines.join('\n')}</code></pre>);
        codeLines = [];
        inCode = false;
      } else {
        flushList(); flushOrdered();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    if (line.startsWith('### ')) {
      flushList(); flushOrdered();
      elements.push(<h4 key={`h4-${i}`} className="md-h4">{parseInline(line.slice(4))}</h4>);
    } else if (line.startsWith('## ')) {
      flushList(); flushOrdered();
      elements.push(<h3 key={`h3-${i}`} className="md-h3">{parseInline(line.slice(3))}</h3>);
    } else if (line.startsWith('# ')) {
      flushList(); flushOrdered();
      elements.push(<h2 key={`h2-${i}`} className="md-h2">{parseInline(line.slice(2))}</h2>);
    } else if (/^[-*•] /.test(line) || /^⚡ /.test(line)) {
      flushOrdered();
      listItems.push(line.replace(/^[-*•⚡] /, ''));
    } else if (/^\d+\. /.test(line)) {
      flushList();
      orderedItems.push(line.replace(/^\d+\. /, ''));
    } else if (line.trim() === '---' || line.trim() === '***') {
      flushList(); flushOrdered();
      elements.push(<hr key={`hr-${i}`} className="md-hr" />);
    } else if (line.trim() === '') {
      flushList(); flushOrdered();
      elements.push(<div key={`sp-${i}`} className="md-spacer" />);
    } else {
      flushList(); flushOrdered();
      elements.push(<p key={`p-${i}`} className="md-p">{parseInline(line)}</p>);
    }
  }
  flushList(); flushOrdered();
  return <div className="md-content">{elements}</div>;
}

// ── TYPING INDICATOR ───────────────────────────────────────────────────────────
function TypingIndicator({ toolsBeingFetched }) {
  return (
    <div className="msg ai msg-enter">
      <div className="msg-avatar ai-avatar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="msg-bubble ai-bubble">
        <div className="typing-status">
          {toolsBeingFetched?.length > 0 ? (
            <>
              <div className="typing-pulse"><span/><span/><span/></div>
              <span className="typing-label">
                Analyzing with {toolsBeingFetched.map(t => TOOL_LABELS[t] || t).join(', ')}…
              </span>
            </>
          ) : (
            <>
              <div className="typing-pulse"><span/><span/><span/></div>
              <span className="typing-label">Thinking…</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── COPY BUTTON ────────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={`msg-action-btn${copied ? ' copied' : ''}`} onClick={copy} title="Copy to clipboard">
      {copied
        ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg> Copied</>
        : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy</>
      }
    </button>
  );
}

// ── REACTION BUTTONS ───────────────────────────────────────────────────────────
function ReactionButtons() {
  const [reaction, setReaction] = useState(null);
  return (
    <div className="reaction-btns">
      <button
        className={`reaction-btn${reaction === 'up' ? ' active-up' : ''}`}
        onClick={() => setReaction(r => r === 'up' ? null : 'up')}
        title="Helpful"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={reaction === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
          <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
        </svg>
      </button>
      <button
        className={`reaction-btn${reaction === 'down' ? ' active-down' : ''}`}
        onClick={() => setReaction(r => r === 'down' ? null : 'down')}
        title="Not helpful"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill={reaction === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z"/>
          <path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/>
        </svg>
      </button>
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────────────────────
function EmptyState({ onSelect, inputRef }) {
  return (
    <div className="chat-empty">
      <div className="chat-empty-hero">
        <div className="chat-empty-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="chat-empty-headline">StockSense AI</div>
        <div className="chat-empty-tagline">Your inventory intelligence advisor — live-connected to your DMS</div>
        <div className="chat-empty-pills">
          <span className="empty-pill"><span className="empty-pill-dot" style={{background:'#22c55e'}}/>GPT-4o</span>
          <span className="empty-pill"><span className="empty-pill-dot" style={{background:'#3b82f6'}}/>MCP Tools</span>
          <span className="empty-pill"><span className="empty-pill-dot" style={{background:'#a855f7'}}/>RCA Engine</span>
          <span className="empty-pill"><span className="empty-pill-dot" style={{background:'#f59e0b'}}/>Live DMS</span>
        </div>
      </div>
      <div className="suggestion-grid">
        {SUGGESTION_GROUPS.map(group => (
          <div key={group.label} className="suggestion-card">
            <div className="suggestion-card-header" style={{ color: group.color }}>
              <span className="suggestion-card-icon">{group.icon}</span>
              <span className="suggestion-card-label">{group.label}</span>
            </div>
            <div className="suggestion-card-queries">
              {group.queries.map(q => (
                <button
                  key={q}
                  className="suggestion-item"
                  onClick={() => { onSelect(q); inputRef.current?.focus(); }}
                >
                  <span>{q}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function AIAssistant({ pendingQuery, onPendingQueryConsumed }) {
  const [mode, setMode] = useState('ask');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streamingTools, setStreamingTools] = useState([]);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 180) + 'px';
    }
  }, [input]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === '1') { e.preventDefault(); setMode('ask'); }
      if (e.ctrlKey && e.key === '2') { e.preventDefault(); setMode('explain'); }
      if (e.ctrlKey && e.key === '3') { e.preventDefault(); setMode('act'); }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); clearChat(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Handle pending query from dashboard tile clicks
  useEffect(() => {
    if (pendingQuery) {
      onPendingQueryConsumed?.();
      sendMessage(pendingQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuery]);

  const sendMessage = useCallback(async (queryOverride) => {
    const query = (queryOverride || input || '').trim();
    if (!query || loading) return;

    setInput('');
    setError('');
    setStreamingTools([]);

    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: query, mode, timestamp };
    const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const aiPlaceholder = {
      role: 'assistant', content: '', mode, timestamp,
      tools_used: [], rca_performed: false, follow_ups: [],
      streaming: true,
    };
    setMessages(prev => [...prev, aiPlaceholder]);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const resp = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({ message: query, mode, history }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const updateLast = (updater) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = updater(updated[updated.length - 1]);
          return updated;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'meta') {
              setStreamingTools(event.tools_used || []);
              updateLast(msg => ({
                ...msg,
                tools_used: event.tools_used || [],
                rca_performed: event.rca_performed || false,
              }));
            } else if (event.type === 'token') {
              updateLast(msg => ({ ...msg, content: msg.content + event.content }));
            } else if (event.type === 'done') {
              updateLast(msg => ({ ...msg, streaming: false, follow_ups: event.follow_ups || [] }));
            } else if (event.type === 'error') {
              throw new Error(event.message);
            }
          } catch (_) { /* skip malformed */ }
        }
      }

      updateLast(msg => ({ ...msg, streaming: false }));

    } catch (e) {
      if (e.name === 'AbortError') return;
      setError(e.message || 'Connection error — is the backend running on port 8000?');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
      setStreamingTools([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, mode, messages, loading]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser && !loading) {
      setMessages(prev => prev.slice(0, prev.findLastIndex(m => m.role === 'user')));
      sendMessage(lastUser.content);
    }
  }, [messages, loading, sendMessage]);

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setError('');
    setLoading(false);
    setStreamingTools([]);
    inputRef.current?.focus();
  };

  const cfg = MODE_CONFIG[mode];
  const lastMsg = messages[messages.length - 1];
  const canRegenerate = !loading && lastMsg?.role === 'assistant' && !lastMsg?.streaming;
  const wordCount = (text) => text ? text.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="view chat-view">
      {/* ── TOP HEADER BAR ── */}
      <div className="chat-header-bar">
        <div className="chat-header-left">
          <div className="chat-header-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div className="chat-header-title">AI Assistant</div>
            <div className="chat-header-sub">Inventory Intelligence Advisor · GPT-4o</div>
          </div>
        </div>
        <div className="chat-header-right">
          <span className="chat-status-badge">
            <span className="status-dot-live" />
            Live DMS
          </span>
          <span className="chat-model-badge">GPT-4o</span>
          {messages.length > 0 && (
            <button className="chat-clear-top" onClick={clearChat} title="New chat (Ctrl+L)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New chat
            </button>
          )}
        </div>
      </div>

      {/* ── MODE SELECTOR ── */}
      <div className="mode-bar">
        <div className="mode-pills">
          {Object.entries(MODE_CONFIG).map(([key, c]) => (
            <button
              key={key}
              className={`mode-pill${mode === key ? ' active' : ''}`}
              style={mode === key ? { background: c.gradient, borderColor: 'transparent' } : {}}
              onClick={() => setMode(key)}
              title={`${c.desc} (Ctrl+${c.shortcut})`}
            >
              <span className="mode-pill-icon">{c.icon}</span>
              <span className="mode-pill-label">{c.label}</span>
              <kbd className="mode-pill-kbd">⌃{c.shortcut}</kbd>
            </button>
          ))}
        </div>
        <div className="mode-desc-inline" style={{ color: cfg.color }}>
          {cfg.desc}
        </div>
      </div>

      {/* ── CHAT CONTAINER ── */}
      <div className="chat-container">
        <div className="chat-messages">

          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <EmptyState onSelect={setInput} inputRef={inputRef} />
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === 'user' ? 'user' : 'ai'} msg-enter`}>
              {msg.role === 'user' ? (
                /* ── USER MESSAGE ── */
                <div className="msg-wrap user-wrap">
                  <div className="user-bubble">
                    <div className="user-meta">
                      <span className="user-mode-tag" style={{ color: MODE_CONFIG[msg.mode]?.color }}>
                        {MODE_CONFIG[msg.mode]?.icon} {MODE_CONFIG[msg.mode]?.label}
                      </span>
                      <span className="msg-time">{msg.timestamp}</span>
                    </div>
                    <div className="user-text">{msg.content}</div>
                  </div>
                  <div className="msg-avatar user-avatar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                </div>
              ) : (
                /* ── AI MESSAGE ── */
                <div className="msg-wrap ai-wrap">
                  <div className="msg-avatar ai-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div className="ai-bubble-wrap">
                    {/* Chips row */}
                    {(msg.tools_used?.length > 0 || msg.rca_performed) && (
                      <div className="ai-chips-row">
                        <span className={`mode-chip mode-chip-${msg.mode || 'ask'}`}>
                          {MODE_CONFIG[msg.mode]?.icon} {(msg.mode || 'ask').toUpperCase()}
                        </span>
                        {msg.rca_performed && (
                          <span className="rca-chip">🔬 RCA</span>
                        )}
                        {msg.tools_used?.map(t => (
                          <span key={t} className="tool-chip">{TOOL_LABELS[t] || t}</span>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="ai-content">
                      <MarkdownRenderer text={msg.content} />
                      {msg.streaming && <span className="stream-cursor" />}
                    </div>

                    {/* Footer */}
                    {!msg.streaming && (
                      <div className="ai-msg-footer">
                        <div className="ai-msg-meta">
                          <span className="msg-time">{msg.timestamp}</span>
                          {msg.content && (
                            <span className="word-count">{wordCount(msg.content)} words</span>
                          )}
                        </div>
                        <div className="ai-msg-actions">
                          <ReactionButtons />
                          <div className="action-divider" />
                          <CopyButton text={msg.content} />
                          {i === messages.length - 1 && canRegenerate && (
                            <button className="msg-action-btn" onClick={regenerate} title="Regenerate">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                              </svg>
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Follow-up suggestions */}
                    {!msg.streaming && msg.follow_ups?.length > 0 && (
                      <div className="follow-ups-row">
                        <span className="follow-ups-label">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                          </svg>
                          Ask next
                        </span>
                        <div className="follow-up-chips">
                          {msg.follow_ups.map(q => (
                            <button key={q} className="follow-up-chip"
                              onClick={() => { setInput(q); inputRef.current?.focus(); }}>
                              {q}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && streamingTools.length === 0 && (
            <TypingIndicator toolsBeingFetched={[]} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="chat-error">
            <div className="chat-error-inner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} title="Dismiss">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── INPUT AREA ── */}
        <div className="chat-input-area">
          <div className="input-box">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={`${cfg.icon} ${cfg.label} mode — ask anything about your inventory, margins, or suppliers…`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <div className="input-toolbar">
              <div className="input-toolbar-left">
                <span className="input-hint">↵ Send · ⇧↵ New line · ⌃L Clear</span>
              </div>
              <div className="input-toolbar-right">
                {input.length > 0 && (
                  <span className="input-char" style={{ color: input.length > 400 ? '#dc2626' : undefined }}>
                    {input.length}
                  </span>
                )}
                {(messages.length > 0 || loading) && (
                  <button className="input-clear-btn" onClick={clearChat} title="New chat">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                )}
                <button
                  className="send-btn"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  style={{ background: input.trim() && !loading ? cfg.gradient : undefined }}
                  title="Send (Enter)"
                >
                  {loading
                    ? <span className="send-spinner" />
                    : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                      </svg>
                    )
                  }
                </button>
              </div>
            </div>
          </div>
          <div className="input-footer-bar">
            <div className="input-footer-left">
              <span className="footer-lock">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Private · Encrypted
              </span>
              <span className="footer-sep">·</span>
              <span className="footer-model">GPT-4o · MCP · RCA</span>
            </div>
            <div className={`footer-status${loading ? ' busy' : ''}`}>
              {loading ? (
                <>
                  <span className="status-spinner" />
                  {streamingTools.length > 0 ? 'Streaming response…' : 'Fetching data…'}
                </>
              ) : (
                <>
                  <span className="status-dot-live" />
                  Connected · Live DMS
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
