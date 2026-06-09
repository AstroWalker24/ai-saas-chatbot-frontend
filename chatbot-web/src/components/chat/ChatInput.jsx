import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Paperclip } from 'lucide-react';

const MAX_ROWS = 6;

export default function ChatInput({ onSend, onStop, isTyping }) {
  const [value,   setValue]   = useState('');
  const textareaRef           = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineH   = parseInt(getComputedStyle(el).lineHeight) || 24;
    const maxH    = lineH * MAX_ROWS + 24; // padding
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
  }, [value]);

  // Focus on mount
  useEffect(() => { textareaRef.current?.focus(); }, []);

  const canSend = value.trim().length > 0 && !isTyping;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(value);
    setValue('');
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [canSend, value, onSend]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isTyping) { onStop(); return; }
      handleSend();
    }
  }

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrap">
        <div className="chat-input-box">
          {/* Attachment stub */}
          <button
            className="input-icon-btn"
            aria-label="Attach file (coming soon)"
            title="Attach file"
            disabled
          >
            <Paperclip size={17} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Message Nexus AI…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message input"
            aria-multiline="true"
          />

          {/* Send / Stop */}
          <AnimatePresence mode="wait">
            {isTyping ? (
              <motion.button
                key="stop"
                className="send-btn send-btn--stop"
                onClick={onStop}
                aria-label="Stop generating"
                title="Stop"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{    scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Square size={14} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                className={`send-btn${canSend ? ' send-btn--active' : ''}`}
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send message"
                title="Send (Enter)"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{    scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                whileHover={canSend ? { scale: 1.05 } : {}}
                whileTap={canSend  ? { scale: 0.95 } : {}}
              >
                <Send size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="input-hint">
          Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
