import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-600">{text}</p>
    </div>
  );
};

export default Loader;
