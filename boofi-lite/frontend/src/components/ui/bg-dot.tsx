import React from 'react';

interface BgDotProps {
  children: React.ReactNode;
}

const BgDot: React.FC<BgDotProps> = ({ children }) => {
  return (
    <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl">
      <div className="absolute inset-0 rounded-xl dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] border border-transparent dark:border-white/[0.2] z-0" />
      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const BgDotFaded: React.FC<BgDotProps> = ({ children }) => {
  return (
    <div className="relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl">
      <div className="absolute inset-0 rounded-xl dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] border border-transparent dark:border-white/[0.2] z-0" />      
      {/* Faded Overlay */}
      <div className="absolute inset-0 flex items-center justify-center dark:bg-black bg-white pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-0"></div>
      
      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};


const GridSmall: React.FC<BgDotProps> = ({ children }) => {

  return (
    <div className="h-auto w-full dark:bg-grid-small-white/[0.2] bg-grid-small-black/[0.2] relative flex items-center justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-10">{children}</div>

    </div>
  );
}


export { BgDot, BgDotFaded, GridSmall };
