import { useRef, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';

const SUGGESTIONS = [
  "Did the simulation converge?",
  "What are the final residuals?",
  "Were there any warnings or errors?",
  "What is the max Courant number?",
  "Summarize the simulation results",
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const styles = {
    wrap: { display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: 16 },
    bubble: {
      maxWidth: '75%', padding: '12px 16px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: isUser ? '#2563eb' : '#1f2937', color: '#e5e7eb',
      fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word'
    },
    sources: { marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 },
    sourceTag: { background: '#0f172a', border: '1px solid #334155', color: '#64748b', fontSize: 11, padding: '2px 8px', borderRadius: 12 },
    role: { fontSize: 11, color: '#6b7280', marginBottom: 4 }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.role}>{isUser ? 'You' : '🤖 CFD Assistant'}</div>
      <div style={styles.bubble}>{msg.content}</div>
      {!isUser && msg.sources?.length > 0 && (
        <div style={styles.sources}>
          {msg.sources.map(s => <span key={s} style={styles.sourceTag}>📄 {s}</span>)}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 0', marginBottom: 16 }}>
      <span style={{ color: '#6b7280', fontSize: 13 }}>🤖 CFD Assistant is thinking</span>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#4b5563',
          animation: 'pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
    </div>
  );
}

export default function ChatWindow() {
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submit = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const styles = {
    container: { flex: 1, display: 'flex', flexDirection: 'column', background: '#0f172a', overflow: 'hidden' },
    header: { background: '#111827', borderBottom: '1px solid #1f2937', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { color: '#f1f5f9', fontWeight: 700, fontSize: 16 },
    headerSub: { color: '#6b7280', fontSize: 12 },
    clearBtn: { background: 'none', border: '1px solid #374151', color: '#9ca3af', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
    messages: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
    suggestions: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    sugBtn: { background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 12 },
    inputArea: { borderTop: '1px solid #1f2937', padding: '14px 20px', display: 'flex', gap: 10, background: '#111827' },
    input: { flex: 1, background: '#1f2937', border: '1px solid #374151', borderRadius: 10, padding: '12px 16px', color: '#f1f5f9', fontSize: 14, outline: 'none', resize: 'none' },
    sendBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', cursor: 'pointer', fontWeight: 600, fontSize: 14, flexShrink: 0 },
    error: { background: '#7f1d1d22', color: '#f87171', padding: '8px 16px', fontSize: 13, margin: '0 24px 12px' },
    empty: { textAlign: 'center', marginTop: 60, color: '#374151' },
    emptyTitle: { fontSize: 20, fontWeight: 700, color: '#4b5563', marginBottom: 8 },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>CFD Simulation Assistant</div>
          <div style={styles.headerSub}>Ask questions about your simulation results</div>
        </div>
        {messages.length > 0 && (
          <button style={styles.clearBtn} onClick={clearChat}>Clear chat</button>
        )}
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌊</div>
            <div style={styles.emptyTitle}>CFD Chatbot Ready</div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Upload your simulation log files and start asking questions</div>
            <div style={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <button key={s} style={styles.sugBtn} onClick={() => { setInput(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      <div style={styles.inputArea}>
        <textarea
          style={styles.input}
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about residuals, convergence, warnings, flow parameters..."
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <button style={styles.sendBtn} onClick={submit} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
