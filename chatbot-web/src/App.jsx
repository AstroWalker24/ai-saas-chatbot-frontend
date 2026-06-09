import { useState } from 'react';
import AuthLayout from './components/auth/AuthLayout';
import ChatPage from './components/chat/ChatPage';
import DashboardPage from './components/dashboard/DashboardPage';
import { UserProvider, useUser } from './context/UserContext';

function Inner() {
  const [page, setPage] = useState('login');
  const [conversations, setConversations] = useState([]);
  const { setChatCount } = useUser();

  function handleConversationsChange(convs) {
    setConversations(convs);
    setChatCount(convs.length);
  }

  if (page === 'chat') {
    return (
      <ChatPage
        onNavigate={setPage}
        onConversationsChange={handleConversationsChange}
      />
    );
  }

  if (page === 'dashboard') {
    return (
      <DashboardPage
        onNavigate={setPage}
        conversations={conversations}
      />
    );
  }

  return <AuthLayout mode={page} onNavigate={setPage} />;
}

export default function App() {
  return (
    <UserProvider>
      <Inner />
    </UserProvider>
  );
}
