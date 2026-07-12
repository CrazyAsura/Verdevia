'use client';

import { useState, useEffect } from 'react';

export function usePerformance() {
  const [performanceState, setPerformanceState] = useState({
    isLowPower: false,
    motionAllowed: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPerformance = () => {
      // 1. Check media query for prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      // 2. Check CPU cores (hardwareConcurrency)
      const cores = navigator.hardwareConcurrency || 8; // fallback to 8 if not supported
      const isLowCpu = cores <= 4;

      // 3. Check device memory (deviceMemory) in GB - Chrome/Opera/Edge support this
      // @ts-ignore - navigator.deviceMemory is not in standard TypeScript definitions yet
      const memory = navigator.deviceMemory || 8; 
      const isLowMemory = memory <= 4;

      const isLowPowerDevice = isLowCpu || isLowMemory || prefersReducedMotion.matches;
      const allowMotion = !prefersReducedMotion.matches;

      // Apply classes to document body so CSS can conditionally optimize styling (e.g. disable blur/animations)
      if (isLowPowerDevice) {
        document.body.classList.add('low-perf');
      } else {
        document.body.classList.remove('low-perf');
      }

      if (prefersReducedMotion.matches) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }

      setPerformanceState({
        isLowPower: isLowPowerDevice,
        motionAllowed: allowMotion,
      });
    };

    checkPerformance();

    // Listen to changes in motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      checkPerformance();
    };

    try {
      mediaQuery.addEventListener('change', handleMotionChange);
    } catch (e) {
      // Fallback for older browsers
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } catch (e) {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  return performanceState;
}
