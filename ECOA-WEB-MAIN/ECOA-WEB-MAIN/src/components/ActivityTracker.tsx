'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import StatsService from '@/services/stats.service';

export function ActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const logVisit = async () => {
      try {
        await StatsService.logVisit({
          path: pathname,
          userAgent: window.navigator.userAgent,
        });
      } catch (error) {
        // Silently fail as logging shouldn't break UI
        console.error('Failed to log activity:', error);
      }
    };

    logVisit();
  }, [pathname]);

  return null;
}
