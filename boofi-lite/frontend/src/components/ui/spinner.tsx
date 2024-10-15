import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="relative w-8 h-8">
      <div className="w-full h-full border-4 border-neutral-200 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
