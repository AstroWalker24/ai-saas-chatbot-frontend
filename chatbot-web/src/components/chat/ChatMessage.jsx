import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check } from 'lucide-react';

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      className={`copy-btn ${className}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy'}
    >
      {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={2} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

// ── Code block renderer ───────────────────────────────────────────────────────

function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '');
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: 'transparent',
          padding: '1rem',
          fontSize: '0.8375rem',
          lineHeight: '1.6',
        }}
        codeTagProps={{ style: { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Markdown components map ───────────────────────────────────────────────────

const mdComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match) {
      return <CodeBlock language={match[1]}>{children}</CodeBlock>;
    }
    return <code className="inline-code" {...props}>{children}</code>;
  },
  pre({ children }) {
    // Avoid double-wrapping — CodeBlock already provides the container
    return <>{children}</>;
  },
  table({ children })  { return <div className="md-table-wrap"><table className="md-table">{children}</table></div>; },
  blockquote({ children }) { return <blockquote className="md-blockquote">{children}</blockquote>; },
  a({ href, children })    { return <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">{children}</a>; },
};

// ── Single message bubble ─────────────────────────────────────────────────────

function formatTimestamp(date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`chat-msg-row${isUser ? ' chat-msg-row--user' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="msg-avatar msg-avatar--ai" aria-hidden="true">
          <Bot size={15} />
        </div>
      )}

      {/* Bubble */}
      <div className={`msg-bubble${isUser ? ' msg-bubble--user' : ' msg-bubble--ai'}`}>
        {isUser ? (
          <p className="msg-text">{message.content}</p>
        ) : (
          <div className="msg-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        <div className="msg-footer">
          <span className="msg-time">{formatTimestamp(message.timestamp)}</span>
          {!isUser && (
            <CopyButton text={message.content} className="copy-btn--inline" />
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="msg-avatar msg-avatar--user" aria-hidden="true">
          <User size={14} />
        </div>
      )}
    </motion.div>
  );
}
