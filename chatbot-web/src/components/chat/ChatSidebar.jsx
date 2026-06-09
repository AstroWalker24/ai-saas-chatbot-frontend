import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, Bot, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';

function formatTime(date) {
  const now  = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatSidebar({ open, conversations, activeId, onSelect, onNewChat, onDelete, onNavigate }) {
  const [hoveredId,  setHoveredId]  = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);

  function handleDeleteClick(e, id) {
    e.stopPropagation();
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
      // Auto-cancel confirm after 3s
      setTimeout(() => setConfirmId((c) => (c === id ? null : c)), 3000);
    }
  }

  return (
    <>
      {/* Desktop always-visible + mobile drawer */}
      <motion.aside
        className="chat-sidebar"
        data-open={open}
        initial={false}
        animate={{ x: 0 }}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Bot size={18} color="white" />
          </div>
          <span className="sidebar-brand-text">Nexus AI</span>
        </div>

        {/* New chat */}
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={16} />
          New Chat
        </button>

        {/* Conversation list */}
        <div className="sidebar-list-label">Recent</div>
        <nav className="sidebar-conv-list" aria-label="Conversations">
          <AnimatePresence initial={false}>
            {conversations.map((conv) => {
              const isActive = conv.id === activeId;
              return (
                <motion.button
                  key={conv.id}
                  className={`sidebar-conv-item${isActive ? ' sidebar-conv-item--active' : ''}`}
                  onClick={() => onSelect(conv.id)}
                  onMouseEnter={() => setHoveredId(conv.id)}
                  onMouseLeave={() => { setHoveredId(null); setConfirmId(null); }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.18 }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <MessageSquare size={14} className="conv-icon" />
                  <div className="conv-text">
                    <span className="conv-title">{conv.title}</span>
                    <span className="conv-meta">{formatTime(conv.timestamp)}</span>
                  </div>

                  {(hoveredId === conv.id || isActive) && (
                    <motion.button
                      className={`conv-delete${confirmId === conv.id ? ' conv-delete--confirm' : ''}`}
                      onClick={(e) => handleDeleteClick(e, conv.id)}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      aria-label={confirmId === conv.id ? 'Confirm delete' : 'Delete conversation'}
                      title={confirmId === conv.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 size={12} />
                    </motion.button>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="sidebar-footer-btn"
            onClick={() => onNavigate?.('dashboard')}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
            <ChevronRight size={13} className="sidebar-footer-chevron" />
          </button>
          <button
            className="sidebar-footer-btn"
            onClick={() => onNavigate?.('login')}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
            <ChevronRight size={13} className="sidebar-footer-chevron" />
          </button>
        </div>
      </motion.aside>
    </>
  );
}
