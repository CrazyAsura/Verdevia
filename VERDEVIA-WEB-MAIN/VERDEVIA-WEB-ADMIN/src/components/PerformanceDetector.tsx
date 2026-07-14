'use client';

import { usePerformance } from '@/hooks/usePerformance';

export function PerformanceDetector() {
  usePerformance(); // Execute the hook to set classes on document.body dynamically
  return null;
}
