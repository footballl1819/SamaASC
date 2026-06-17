'use client';

import { useEffect } from 'react';
import { useTeam } from '@/contexts/team-context';

export default function ThemeColorProvider() {
  const { team } = useTeam();

  useEffect(() => {
    const themeColor = team?.primary_color || '#16a34a';
    
    // Update or create meta theme-color tag
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', themeColor);

    // Update apple-mobile-web-app-status-bar-style
    let appleMetaTag = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMetaTag) {
      appleMetaTag = document.createElement('meta');
      appleMetaTag.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleMetaTag);
    }
    appleMetaTag.setAttribute('content', themeColor);
  }, [team?.primary_color]);

  return null;
}
