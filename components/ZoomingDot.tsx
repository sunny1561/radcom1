// Spinner.tsx
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex space-x-1 ml-2">
      <div className="w-4 h-4 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-4 h-4 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default Spinner;