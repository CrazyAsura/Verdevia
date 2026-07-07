'use client';

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';
import { usePerformance } from '@/hooks/usePerformance';

export function SmoothScroll({ children }: { children: ReactNode }) {
  const { isLowPower } = usePerformance();

  // If low-power device or reduced motion is active, bypass Lenis entirely
  // and fallback to native browser scroll engine to save CPU cycles.
  if (isLowPower) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ 
      lerp: 0.1, 
      duration: 1.5, 
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 0, // Use native touch momentum scrolling (much smoother on mobile)
    }}>
      {children}
    </ReactLenis>
  );
}
