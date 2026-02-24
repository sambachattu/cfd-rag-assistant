import { useState, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

// simple uuid fallback
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sessionId = useRef(genId());

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || loading) return;

    const userMsg = { id: genId(), role: 'user', content: question, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const { data } = await chatAPI.sendMessage(question, sessionId.current);
      const botMsg = {
        id: genId(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        ts: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearChat = useCallback(async () => {
    await chatAPI.clearSession(sessionId.current).catch(() => {});
    sessionId.current = genId();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}
