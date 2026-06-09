import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { Bot, Menu, X, LayoutDashboard } from 'lucide-react';
import { useUser } from '../../context/UserContext';

// ── Demo conversation seeds ───────────────────────────────────────────────────

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I'm **Nexus AI**, your intelligent assistant. I can help you with:

- Writing, editing, and brainstorming
- Answering questions and research
- Code generation and debugging
- Data analysis and summaries

What can I help you with today?`,
  timestamp: new Date(),
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function makeConversation(title, preview) {
  return { id: makeId(), title, preview, timestamp: new Date(), messages: [WELCOME_MESSAGE] };
}

const INITIAL_CONVERSATIONS = [
  makeConversation('Getting started', 'Hello! I\'m Nexus AI…'),
];

// ── Simulated AI response ─────────────────────────────────────────────────────

const DEMO_RESPONSES = [
  `Great question! Here's a quick breakdown:

1. **First point** — This is the primary consideration you'll want to keep in mind.
2. **Second point** — Building on that, we can see that the approach scales well.
3. **Third point** — Finally, this ties everything together.

Let me know if you'd like me to dive deeper into any of these areas.`,

  `Here's a code example that demonstrates this concept:

\`\`\`javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}
\`\`\`

This handles errors gracefully and uses modern async/await syntax. You can adapt it for any API call.`,

  `Absolutely! Let me explain this step by step.

The core idea is straightforward: **break the problem into smaller pieces** and solve each one independently.

> "The secret of getting ahead is getting started." — Mark Twain

In practice this means:
- Identify the smallest unit of work
- Test each piece in isolation
- Integrate gradually

Would you like a more concrete example?`,

  `I can definitely help with that. Based on your request, here's what I'd recommend:

| Approach | Pros | Cons |
|----------|------|------|
| Option A | Fast setup, easy to learn | Limited scalability |
| Option B | Highly scalable, flexible | More complex |
| Option C | Best balance | Moderate learning curve |

**My recommendation:** Option C gives you the best long-term outcome without over-engineering early on.`,
];

let demoIdx = 0;
function getNextDemoResponse() {
  const resp = DEMO_RESPONSES[demoIdx % DEMO_RESPONSES.length];
  demoIdx++;
  return resp;
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ChatPage({ onNavigate, onConversationsChange }) {
  const { user } = useUser();
  const [conversations,    setConversations]    = useState(INITIAL_CONVERSATIONS);
  const [activeId,         setActiveId]         = useState(INITIAL_CONVERSATIONS[0].id);
  const [isTyping,         setIsTyping]         = useState(false);
  const [sidebarOpen,      setSidebarOpen]      = useState(false);

  const messagesEndRef = useRef(null);
  const abortRef       = useRef(false);

  // Sync conversation list up to App
  useEffect(() => {
    onConversationsChange?.(conversations);
  }, [conversations, onConversationsChange]);

  const activeConv = conversations.find((c) => c.id === activeId) ?? conversations[0];

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isTyping]);

  // ── New chat ─────────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    const conv = makeConversation('New conversation', 'Hello! I\'m Nexus AI…');
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
  }, []);

  // ── Delete conversation ───────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (next.length === 0) {
        const fresh = makeConversation('New conversation', 'Hello! I\'m Nexus AI…');
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  }, [activeId]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = {
      id: makeId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    // Derive a conversation title from the first user message
    const isFirstUserMsg = !activeConv.messages.some((m) => m.role === 'user');
    const newTitle = isFirstUserMsg
      ? text.trim().slice(0, 48) + (text.length > 48 ? '…' : '')
      : activeConv.title;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, title: newTitle, preview: text.slice(0, 60), messages: [...c.messages, userMsg] }
          : c
      )
    );

    setIsTyping(true);
    abortRef.current = false;

    // Simulate network delay (600–1400ms)
    const delay = 600 + Math.random() * 800;
    await new Promise((r) => setTimeout(r, delay));

    if (abortRef.current) { setIsTyping(false); return; }

    const aiMsg = {
      id: makeId(),
      role: 'assistant',
      content: getNextDemoResponse(),
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      )
    );

    setIsTyping(false);
  }, [activeId, activeConv, isTyping]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    setIsTyping(false);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="chat-page">
      {/* Sidebar overlay on mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
        onNavigate={onNavigate}
      />

      {/* Main */}
      <div className="chat-main">
        {/* Top bar */}
        <header className="chat-topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="topbar-title">
            <div className="topbar-bot-dot">
              <Bot size={14} />
            </div>
            <span>Nexus AI</span>
          </div>

          <div className="topbar-right">
            <div className="model-badge">GPT-4o</div>
            <button
              className="topbar-avatar-btn"
              onClick={() => onNavigate('dashboard')}
              aria-label="Open dashboard"
              title="Dashboard"
            >
              <LayoutDashboard size={15} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="chat-messages-area" role="log" aria-live="polite" aria-label="Chat messages">
          <div className="chat-messages-inner">
            <AnimatePresence initial={false}>
              {activeConv.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}
