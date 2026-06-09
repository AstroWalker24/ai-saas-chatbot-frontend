import React, { createContext, useContext, useState } from 'react';

// ── Mock user data ────────────────────────────────────────────────────────────

const INITIAL_USER = {
  name:      'Alex Johnson',
  email:     'alex@example.com',
  avatar:    null, // no image — we'll use initials
  plan:      'Pro',
  joinedAt:  new Date('2025-11-15'),
  tokensUsed:   84_320,
  tokensLimit:  150_000,
  // Daily usage for the past 14 days (tokens consumed)
  usageHistory: [
    { date: '06-26', tokens: 3_200 },
    { date: '06-27', tokens: 5_800 },
    { date: '06-28', tokens: 2_100 },
    { date: '06-29', tokens: 7_400 },
    { date: '06-30', tokens: 4_900 },
    { date: '07-01', tokens: 9_200 },
    { date: '07-02', tokens: 6_100 },
    { date: '07-03', tokens: 3_700 },
    { date: '07-04', tokens: 8_800 },
    { date: '07-05', tokens: 5_300 },
    { date: '07-06', tokens: 11_200 },
    { date: '07-07', tokens: 6_700 },
    { date: '07-08', tokens: 9_920 },
    { date: '07-09', tokens: 0 },
  ],
  modelBreakdown: [
    { model: 'GPT-4o',       requests: 142, color: '#8b5cf6' },
    { model: 'GPT-3.5',      requests:  89, color: '#06b6d4' },
    { model: 'Claude 3.5',   requests:  34, color: '#22c55e' },
    { model: 'Gemini Pro',   requests:  17, color: '#f97316' },
  ],
};

// ── Context ───────────────────────────────────────────────────────────────────

const UserContext = createContext(null);

export function UserProvider({ children, initialConversationCount = 1 }) {
  const [user]          = useState(INITIAL_USER);
  const [chatCount, setChatCount] = useState(initialConversationCount);

  return (
    <UserContext.Provider value={{ user, chatCount, setChatCount }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}
