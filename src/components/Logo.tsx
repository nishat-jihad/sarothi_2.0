import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-black transform -skew-x-12 rotate-45"></div>
        <div className="absolute inset-0 bg-black transform skew-x-12 -rotate-45 translate-x-2 translate-y-2"></div>
      </div>
      <span className="text-2xl font-bold tracking-tighter">SAROTHI</span>
    </div>
  );
};
