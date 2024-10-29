"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import lottieAnimations from '@/utils/lottie-list';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export const LottieWrapper: React.FC = () => {
  const [topLeftLottie, setTopLeftLottie] = useState<any>(null);
  const [bottomRightLottie, setBottomRightLottie] = useState<any>(null);

  /**
   * Selects a random Lottie animation from the list.
   */
  const getRandomLottie = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * lottieAnimations.length);
    return lottieAnimations[randomIndex];
  }, []);

  /**
   * Updates both Lottie animations with new random animations.
   */
  const updateLotties = useCallback(() => {
    setTopLeftLottie(getRandomLottie());
    setBottomRightLottie(getRandomLottie());
  }, [getRandomLottie]);

  useEffect(() => {
    // Initialize with random Lotties
    updateLotties();

    // Set interval to update Lotties every 30 seconds
    const interval = setInterval(() => {
      updateLotties();
    }, 30000); // 30000ms = 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [updateLotties]);

  useEffect(() => {
    /**
     * Handles keydown events. Triggers Lottie change on Enter key.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        updateLotties();
      }
    };

    // Add keydown event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [updateLotties]);

  return (
    <>
      {/* Top-Left Lottie Animation */}
      <div
        className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 mt-8 -ml-6 sm:-ml-10 z-50 cursor-pointer"
        role="button"
        aria-label="Change animation by clicking"
        tabIndex={0}
        onClick={updateLotties}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateLotties();
          }
        }}
      >
        {topLeftLottie && (
          <Lottie
            animationData={topLeftLottie}
            loop={true}
            autoplay={true}
          />
        )}
      </div>

      {/* Bottom-Right Lottie Animation */}
      <div
        className="absolute bottom-60 right-0 w-12 h-12 sm:w-20 sm:h-20 -mr-6 sm:-mr-10 z-50 cursor-pointer"
        role="button"
        aria-label="Change animation by clicking"
        tabIndex={0}
        onClick={updateLotties}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateLotties();
          }
        }}
      >
        {bottomRightLottie && (
          <Lottie
            animationData={bottomRightLottie}
            loop={true}
            autoplay={true}
          />
        )}
      </div>
    </>
  );
};

export default LottieWrapper;
