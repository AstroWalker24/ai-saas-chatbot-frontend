import React from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import AuthForm from './AuthForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

export default function AuthLayout({ mode = 'login', onNavigate }) {
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';
  const wideRight = isSignup || isForgot;

  return (
    <div className="split-layout">
      <LeftPanel variant={mode} />
      <RightPanel signup={wideRight}>
        {isSignup && <SignupForm onSwitchToLogin={() => onNavigate('login')} onNavigate={onNavigate} />}
        {isForgot && <ForgotPasswordForm onBackToLogin={() => onNavigate('login')} />}
        {!isSignup && !isForgot && (
          <AuthForm
            onSwitchToSignup={() => onNavigate('signup')}
            onForgotPassword={() => onNavigate('forgot')}
            onNavigate={onNavigate}
          />
        )}
      </RightPanel>
    </div>
  );
}
