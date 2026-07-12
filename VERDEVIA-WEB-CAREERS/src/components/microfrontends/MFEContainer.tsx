'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MFEContainerProps {
  tagName: string;
  props?: Record<string, any>;
  onEvent?: Record<string, (e: Event) => void>;
}

export default function MFEContainer({ tagName, props = {}, onEvent = {} }: MFEContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import MFE Web Components on the client-side
    const loadMFEs = async () => {
      try {
        await import('./CoursesMFE');
        await import('./ComplaintsMFE');
        await import('./ForumSearchNotificationMFE');
        setLoaded(true);
      } catch (err) {
        console.error('Erro ao carregar os Microfrontends:', err);
      }
    };
    loadMFEs();
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    // Clear previous custom element
    containerRef.current.innerHTML = '';

    // Create the custom element
    const element = document.createElement(tagName);

    // Apply props directly to the DOM element
    Object.entries(props).forEach(([key, value]) => {
      (element as any)[key] = value;
    });

    // Add event listeners
    Object.entries(onEvent).forEach(([eventName, handler]) => {
      element.addEventListener(eventName, handler);
    });

    containerRef.current.appendChild(element);

    return () => {
      Object.entries(onEvent).forEach(([eventName, handler]) => {
        element.removeEventListener(eventName, handler);
      });
    };
  }, [loaded, tagName, JSON.stringify(props)]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] text-white" />
  );
}
