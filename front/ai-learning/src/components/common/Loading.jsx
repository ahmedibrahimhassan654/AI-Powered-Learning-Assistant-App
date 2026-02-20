import React from "react";

const Loading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white/50 backdrop-blur-sm fixed inset-0 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-xl font-display font-medium text-gray-700 animate-pulse">
          جاري التحميل...
        </p>
      </div>
    </div>
  );
};

export default Loading;
