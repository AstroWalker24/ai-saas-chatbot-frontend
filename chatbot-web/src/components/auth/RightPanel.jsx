import React from 'react';

export default function RightPanel({ children, signup = false }) {
  return (
    <div className={signup ? 'right-panel right-panel--signup' : 'right-panel'}>
      <div className="right-panel-glow"></div>
      <div className={signup ? 'auth-form-container auth-form-container--signup' : 'auth-form-container'}>
        {children}
      </div>
    </div>
  );
}
