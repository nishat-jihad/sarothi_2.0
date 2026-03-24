import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* ইমেজ লোগো */}
      <img 
        src="/Sarothilogopro.png" 
        alt="Sarothi Logo" 
        className="w-10 h-10 object-contain"
      />
      <span className="text-2xl font-bold tracking-tighter">SAROTHI</span>
    </div>
  );
};
