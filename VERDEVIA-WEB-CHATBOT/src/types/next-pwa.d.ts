declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  function withPWA(config: NextConfig): NextConfig;
  
  export default function withPWAInit(pwaConfig: {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: unknown[];
    publicExcludes?: string[];
    buildExcludes?: string[];
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    addUnfocusedPushNotifications?: boolean;
    fallbacks?: Record<string, string>;
    dynamicStartUrl?: boolean;
    dynamicStartUrlRedirect?: string;
    cacheStartUrl?: boolean;
  }): typeof withPWA;
}
