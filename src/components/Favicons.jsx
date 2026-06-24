import { useEffect, useState } from 'react';
import { STORAGE_BASE_URL } from '../services/api';

/**
 * Favicons Component
 * 
 * Dynamically injects favicon tags based on backend configuration.
 * If generated favicons exist in the backend, uses them.
 * Otherwise, falls back to the default favicon.
 */
function Favicons() {
  const [faviconsLoaded, setFaviconsLoaded] = useState(false);

  useEffect(() => {
    const loadFavicons = async () => {
      try {
        // Check if favicons exist by trying to fetch the favicon.ico
        const faviconUrl = `${STORAGE_BASE_URL}/storage/favicons/favicon.ico`;
        const response = await fetch(faviconUrl, { method: 'HEAD' });
        
        if (response.ok) {
          // Generated favicons exist - inject all favicon tags
          injectGeneratedFavicons();
        } else {
          // No generated favicons - use default or logo from API config
          await injectDefaultFavicon();
        }
      } catch (error) {
        // Error fetching - use default
        await injectDefaultFavicon();
      }
      
      setFaviconsLoaded(true);
    };

    loadFavicons();
  }, []);

  const injectGeneratedFavicons = () => {
    const baseUrl = `${STORAGE_BASE_URL}/storage/favicons`;
    
    const faviconTags = [
      { rel: 'apple-touch-icon', sizes: '180x180', href: `${baseUrl}/apple-touch-icon.png` },
      { rel: 'icon', type: 'image/png', sizes: '512x512', href: `${baseUrl}/android-chrome-512x512.png` },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: `${baseUrl}/android-chrome-192x192.png` },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${baseUrl}/favicon-32x32.png` },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${baseUrl}/favicon-16x16.png` },
      { rel: 'shortcut icon', href: `${baseUrl}/favicon.ico` },
      { rel: 'manifest', href: `${baseUrl}/site.webmanifest` },
    ];

    // Remove existing favicon tags
    removeExistingFavicons();

    // Inject new favicon tags
    faviconTags.forEach(tag => {
      const link = document.createElement('link');
      link.rel = tag.rel;
      if (tag.sizes) link.sizes = tag.sizes;
      if (tag.type) link.type = tag.type;
      link.href = tag.href;
      document.head.appendChild(link);
    });

    // Add meta tags
    const metaTags = [
      { name: 'msapplication-TileColor', content: '#ffffff' },
      { name: 'theme-color', content: '#ffffff' },
    ];

    metaTags.forEach(tag => {
      // Remove existing meta tag if exists
      const existing = document.querySelector(`meta[name="${tag.name}"]`);
      if (existing) existing.remove();
      
      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
  };

  const injectDefaultFavicon = async () => {
    try {
      // Try to get logo from API config
      const response = await fetch(`${STORAGE_BASE_URL}/api/config`);
      const data = await response.json();
      
      let faviconUrl = '/favicon.svg'; // Default fallback
      
      if (data.data && data.data.logos && data.data.logos.universal) {
        // Use the thumbnail from the universal logo
        faviconUrl = data.data.logos.universal.thumbnail || data.data.logos.universal.medium;
        // Make absolute URL if relative
        if (faviconUrl.startsWith('/')) {
          faviconUrl = `${STORAGE_BASE_URL}${faviconUrl}`;
        }
      }

      // Remove existing favicon tags
      removeExistingFavicons();

      // Inject default favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = faviconUrl;
      document.head.appendChild(link);

      // Also add shortcut icon
      const shortcut = document.createElement('link');
      shortcut.rel = 'shortcut icon';
      shortcut.href = faviconUrl;
      document.head.appendChild(shortcut);
    } catch (error) {
      // Keep default favicon.svg if everything fails
      console.log('Using default favicon');
    }
  };

  const removeExistingFavicons = () => {
    // Remove all existing favicon and apple-touch-icon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]');
    existingLinks.forEach(link => link.remove());
  };

  // This component doesn't render anything visible
  return null;
}

export default Favicons;
