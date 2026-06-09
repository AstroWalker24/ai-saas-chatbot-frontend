import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Zap, TrendingUp, User,
  BarChart2, Clock, Award, ArrowRight,
  ChevronRight, Flame, Activity,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1)     + 'K';
  return String(n);
}

function pct(used, total) {
  return Math.min(100, Math.round((used / total) * 100));
}

function tokenColor(p) {
  if (p >= 90) return '#ef4444';
  if (p >= 70) return '#f97316';
  return '#8b5cf6';
}

// ── Animation variants ────────────────────────────────────────────────────────

const pageVariants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 52 }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="db-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent, delay = 0 }) {
  return (
    <motion.div variants={cardVariants} className="db-stat-card">
      <div className="db-stat-icon" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        {React.cloneElement(icon, { size: 18, color: accent })}
      </div>
      <div className="db-stat-body">
        <p className="db-stat-value">{value}</p>
        <p className="db-stat-label">{label}</p>
      </div>
      {sub && <span className="db-stat-sub">{sub}</span>}
    </motion.div>
  );
}

function TokenMeter({ used, limit }) {
  const p    = pct(used, limit);
  const col  = tokenColor(p);
  const remaining = limit - used;

  return (
    <motion.div variants={cardVariants} className="db-card db-token-card">
      <div className="db-card-header">
        <Zap size={16} color="#8b5cf6" />
        <span className="db-card-title">Token Usage</span>
        <span className="db-token-badge">{p}%</span>
      </div>

      <div className="db-token-numbers">
        <span className="db-token-used">{fmt(used)}</span>
        <span className="db-token-sep">/</span>
        <span className="db-token-limit">{fmt(limit)}</span>
      </div>

      {/* Track */}
      <div className="db-token-track" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className="db-token-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: p / 100 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ background: col }}
        />
      </div>

      <div className="db-token-footer">
        <span style={{ color: col }}>{fmt(remaining)} tokens remaining</span>
        <span className="db-token-reset">Resets Jul 31</span>
      </div>
    </motion.div>
  );
}

function UsageChart({ history }) {
  const max = Math.max(...history.map((d) => d.tokens), 1);

  return (
    <motion.div variants={cardVariants} className="db-card db-chart-card">
      <div className="db-card-header">
        <Activity size={16} color="#06b6d4" />
        <span className="db-card-title">Daily Token Usage</span>
        <span className="db-card-sub">Last 14 days</span>
      </div>

      <div className="db-chart-wrap">
        {/* Y-axis labels */}
        <div className="db-chart-y">
          {[max, Math.round(max / 2), 0].map((v, i) => (
            <span key={i} className="db-chart-y-label">{fmt(v)}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="db-chart-bars" role="img" aria-label="Daily token usage bar chart">
          {history.map((day, i) => {
            const h = max > 0 ? (day.tokens / max) * 100 : 0;
            const isToday = i === history.length - 1;
            return (
              <div key={day.date} className="db-bar-col" title={`${day.date}: ${fmt(day.tokens)} tokens`}>
                <div className="db-bar-track">
                  <motion.div
                    className={`db-bar${isToday ? ' db-bar--today' : ''}`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: h / 100 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="db-bar-label">{day.date.split('-')[1]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function ModelBreakdown({ models }) {
  const total = models.reduce((s, m) => s + m.requests, 0);

  return (
    <motion.div variants={cardVariants} className="db-card db-model-card">
      <div className="db-card-header">
        <BarChart2 size={16} color="#a78bfa" />
        <span className="db-card-title">Model Breakdown</span>
        <span className="db-card-sub">{total} requests</span>
      </div>

      <div className="db-model-list">
        {models.map((m) => {
          const p = Math.round((m.requests / total) * 100);
          return (
            <div key={m.model} className="db-model-row">
              <div className="db-model-label-row">
                <span className="db-model-dot" style={{ background: m.color }} />
                <span className="db-model-name">{m.model}</span>
                <span className="db-model-count">{m.requests}</span>
                <span className="db-model-pct">{p}%</span>
              </div>
              <div className="db-model-track">
                <motion.div
                  className="db-model-fill"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: p / 100 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: m.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function RecentActivity({ conversations }) {
  const items = useMemo(() => {
    return [...conversations]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [conversations]);

  return (
    <motion.div variants={cardVariants} className="db-card db-activity-card">
      <div className="db-card-header">
        <Clock size={16} color="#22c55e" />
        <span className="db-card-title">Recent Conversations</span>
      </div>

      {items.length === 0 ? (
        <p className="db-empty-state">No conversations yet.</p>
      ) : (
        <div className="db-activity-list">
          {items.map((conv) => (
            <div key={conv.id} className="db-activity-row">
              <div className="db-activity-icon">
                <MessageSquare size={13} />
              </div>
              <div className="db-activity-text">
                <span className="db-activity-title">{conv.title}</span>
                <span className="db-activity-meta">
                  {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ChevronRight size={13} className="db-activity-chevron" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function DashboardPage({ onNavigate, conversations = [] }) {
  const { user, chatCount } = useUser();

  const usedPct = pct(user.tokensUsed, user.tokensLimit);
  const totalMessages = conversations.reduce((s, c) => s + c.messages.length, 0);

  const daysSinceJoin = Math.floor(
    (Date.now() - user.joinedAt.getTime()) / 86_400_000
  );

  const avgDaily = useMemo(() => {
    const days = user.usageHistory.filter((d) => d.tokens > 0).length;
    const sum  = user.usageHistory.reduce((s, d) => s + d.tokens, 0);
    return days > 0 ? Math.round(sum / days) : 0;
  }, [user.usageHistory]);

  return (
    <div className="db-page">
      {/* ── Topbar ── */}
      <header className="db-topbar">
        <div className="db-topbar-left">
          <div className="db-topbar-logo">
            <Flame size={16} color="white" />
          </div>
          <span className="db-topbar-title">Dashboard</span>
        </div>
        <div className="db-topbar-right">
          <button className="db-nav-btn" onClick={() => onNavigate('chat')}>
            Open Chat
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="db-body">
        <motion.div
          className="db-inner"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── Profile hero ── */}
          <motion.section variants={cardVariants} className="db-profile-card">
            <div className="db-profile-left">
              <Avatar name={user.name} size={56} />
              <div className="db-profile-info">
                <h1 className="db-profile-name">{user.name}</h1>
                <p className="db-profile-email">{user.email}</p>
                <div className="db-profile-tags">
                  <span className="db-plan-badge">
                    <Award size={11} /> {user.plan}
                  </span>
                  <span className="db-join-badge">
                    Member for {daysSinceJoin} days
                  </span>
                </div>
              </div>
            </div>
            <button
              className="db-profile-edit-btn"
              onClick={() => onNavigate('chat')}
            >
              <User size={14} />
              Edit Profile
            </button>
          </motion.section>

          {/* ── Stat row ── */}
          <div className="db-stats-grid">
            <StatCard
              icon={<MessageSquare />}
              label="Total Chats"
              value={chatCount}
              sub={`${totalMessages} messages`}
              accent="#8b5cf6"
            />
            <StatCard
              icon={<Zap />}
              label="Tokens Used"
              value={fmt(user.tokensUsed)}
              sub={`${usedPct}% of limit`}
              accent="#06b6d4"
            />
            <StatCard
              icon={<TrendingUp />}
              label="Avg Daily Usage"
              value={fmt(avgDaily)}
              sub="tokens/day"
              accent="#22c55e"
            />
            <StatCard
              icon={<BarChart2 />}
              label="Total Requests"
              value={user.modelBreakdown.reduce((s, m) => s + m.requests, 0)}
              sub="across all models"
              accent="#f97316"
            />
          </div>

          {/* ── Main grid ── */}
          <div className="db-main-grid">
            {/* Left column */}
            <div className="db-col-left">
              <TokenMeter used={user.tokensUsed} limit={user.tokensLimit} />
              <UsageChart history={user.usageHistory} />
            </div>

            {/* Right column */}
            <div className="db-col-right">
              <ModelBreakdown models={user.modelBreakdown} />
              <RecentActivity conversations={conversations} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
