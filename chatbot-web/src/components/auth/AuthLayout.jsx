import React from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

export default function AuthLayout() {
  return (
    <div className="split-layout">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}
