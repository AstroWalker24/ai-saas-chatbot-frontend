import React from 'react';
import AuthForm from './AuthForm';

export default function RightPanel() {
  return (
    <div className="right-panel">
      {/* Subtle background glow for the right panel on mobile */}
      <div className="right-panel-glow"></div>
      
      <div className="auth-form-container">
        <AuthForm />
      </div>
    </div>
  );
}
