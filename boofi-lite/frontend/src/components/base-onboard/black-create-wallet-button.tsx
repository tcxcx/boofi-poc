import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { CoinbaseWalletLogo } from './coinbase-wallet-logo';
import { Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/store/onboard';

const GRADIENT_BORDER_WIDTH = 2;

const buttonStyles = {
  background: 'transparent',
  border: '1px solid transparent',
  boxSizing: 'border-box',
};

const contentWrapperStyle = {
  position: 'relative',
};

interface GradientProps {
  children: React.ReactNode;
  style: React.CSSProperties;
  isAnimationDisabled?: boolean;
}

function Gradient({ children, style, isAnimationDisabled = false }: GradientProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const gradientStyle = useMemo(() => {
    const rotate = isAnimating ? '720deg' : '0deg';
    return {
      transform: `rotate(${rotate})`,
      transition: isAnimating
        ? 'transform 2s cubic-bezier(0.27, 0, 0.24, 0.99)'
        : 'none',
      ...style,
    };
  }, [isAnimating, style]);

  const handleMouseEnter = useCallback(() => {
    if (isAnimationDisabled || isAnimating) return;
    setIsAnimating(true);
  }, [isAnimationDisabled, isAnimating]);

  useEffect(() => {
    if (!isAnimating) return;
    const animationTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    return () => {
      clearTimeout(animationTimeout);
    };
  }, [isAnimating]);

  return (
    <div style={{ ...contentWrapperStyle, position: 'relative' }} onMouseEnter={handleMouseEnter}>
      <div className="gradient-background" style={gradientStyle} />
      {children}
    </div>
  );
}

export function BlackCreateWalletButton({ height = 66, width = 200 }) {
  const { connectors, connect } = useConnect();
  const { address: account, isConnected } = useAccount();
  const { setWalletConnected, setWalletAddress, setStep, isLoading, setIsLoading } = useOnboardingStore();

  const minButtonHeight = 48;
  const minButtonWidth = 200;
  const buttonHeight = Math.max(minButtonHeight, height);
  const buttonWidth = Math.max(minButtonWidth, width);
  const gradientDiameter = Math.max(buttonHeight, buttonWidth);

  const styles = useMemo(
    () => ({
      gradientContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: buttonHeight / 2,
        height: buttonHeight,
        width: buttonWidth,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative' as const,
      },
      gradient: {
        background:
          'conic-gradient(from 180deg, #45E1E5 0deg, #0052FF 86.4deg, #B82EA4 165.6deg, #FF9533 255.6deg, #7FD057 320.4deg, #45E1E5 360deg)',
        position: 'absolute' as const,
        top: -buttonHeight - GRADIENT_BORDER_WIDTH,
        left: -GRADIENT_BORDER_WIDTH,
        width: gradientDiameter,
        height: gradientDiameter,
      },
      buttonBody: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        backgroundColor: '#000000',
        height: buttonHeight - GRADIENT_BORDER_WIDTH * 2,
        width: buttonWidth - GRADIENT_BORDER_WIDTH * 2,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        fontSize: 18,
        borderRadius: buttonHeight / 2,
        position: 'relative' as const,
        paddingRight: 10,
      },
    }),
    [buttonHeight, buttonWidth, gradientDiameter]
  );

  const createWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      const coinbaseWalletConnector = connectors.find(
        (connector) => connector.id === 'coinbaseWalletSDK'
      );
      if (coinbaseWalletConnector) {
        await connect({ connector: coinbaseWalletConnector });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connectors, connect, setIsLoading]);

  useEffect(() => {
    if (isConnected && account) {
      setWalletConnected(true);
      setWalletAddress(account);
      setStep(2);
    }
  }, [isConnected, account, setWalletConnected, setWalletAddress, setStep]);

  return (
    <button
      style={{ ...buttonStyles, boxSizing: 'border-box' }}
      onClick={createWallet}
      disabled={isLoading}
    >
      <div style={{ ...styles.gradientContainer, boxSizing: 'border-box' }}>
        <Gradient
          style={{
            ...styles.gradient,
            top: styles.gradient.top,
            left: styles.gradient.left,
            width: styles.gradient.width,
            height: styles.gradient.height,
          }}
        >
          <div style={{ ...styles.buttonBody, boxSizing: 'border-box', position: 'relative' }}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CoinbaseWalletLogo containerStyles={{ paddingTop: 2, paddingRight: 10 }} />
            )}
            {isLoading ? 'Connecting...' : 'Create Wallet'}
          </div>
        </Gradient>
      </div>
    </button>
  );
}
