import { useEffect, useState } from 'react';
import { STORAGE_BASE_URL } from '../services/api';

/**
 * Favicons Component
 *
 * Dynamically injects favicon tags based on backend configuration.
 * Uses a cache buster provided by the API so that logo/favicon changes
 * are picked up immediately by browsers and clients.
 *
 * Note: Uses image loading strategy instead of fetch to avoid CORS issues
 * with static files in storage.
 */
function Favicons() {
  const [, setFaviconsLoaded] = useState(false);

  useEffect(() => {
    const loadFavicons = async () => {
      try {
        const config = await fetchConfig();
        const cacheBuster = config?.['app.logo_cache_buster'];
        const faviconExists = await checkGeneratedFaviconExists(cacheBuster);

        if (faviconExists) {
          injectGeneratedFavicons(cacheBuster);
        } else {
          injectLogoFallback(config);
        }
      } catch (error) {
        console.log('Favicon check failed, using default:', error);
        injectDefaultFavicon();
      }

      setFaviconsLoaded(true);
    };

    loadFavicons();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${STORAGE_BASE_URL}/api/config`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.data || null;
    } catch {
      return null;
    }
  };

  /**
   * Check if generated favicon exists by attempting to load it as an image.
   * A cache buster is used only here to avoid stale 404 responses.
   */
  const checkGeneratedFaviconExists = (cacheBuster) => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve(false);
      }, 2000); // 2 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      const buster = cacheBuster ? `?v=${cacheBuster}` : `?t=${Date.now()}`;
      img.src = `${STORAGE_BASE_URL}/storage/favicons/favicon.ico${buster}`;
    });
  };

  const withCacheBuster = (url, cacheBuster) => {
    if (!cacheBuster) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${cacheBuster}`;
  };

  const injectGeneratedFavicons = (cacheBuster) => {
    const baseUrl = `${STORAGE_BASE_URL}/storage/favicons`;

    const faviconTags = [
      { rel: 'apple-touch-icon', sizes: '180x180', href: `${baseUrl}/apple-touch-icon.png` },
      { rel: 'icon', type: 'image/png', sizes: '512x512', href: `${baseUrl}/android-chrome-512x512.png` },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: `${baseUrl}/android-chrome-192x192.png` },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${baseUrl}/favicon-32x32.png` },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${baseUrl}/favicon-16x16.png` },
      { rel: 'shortcut icon', href: `${baseUrl}/favicon.ico` },
      { rel: 'manifest', href: `${STORAGE_BASE_URL}/favicon-manifest` },
    ];

    removeExistingFavicons();

    faviconTags.forEach((tag) => {
      const link = document.createElement('link');
      link.rel = tag.rel;
      if (tag.sizes) link.sizes = tag.sizes;
      if (tag.type) link.type = tag.type;
      link.href = withCacheBuster(tag.href, cacheBuster);
      document.head.appendChild(link);
    });

    const metaTags = [
      { name: 'msapplication-TileColor', content: '#ffffff' },
      { name: 'theme-color', content: '#ffffff' },
    ];

    metaTags.forEach((tag) => {
      const existing = document.querySelector(`meta[name="${tag.name}"]`);
      if (existing) existing.remove();

      const meta = document.createElement('meta');
      meta.name = tag.name;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
  };

  const injectLogoFallback = (config) => {
    let faviconUrl = '/favicon.svg';

    if (config?.logos?.universal) {
      faviconUrl =
        config.logos.universal.thumbnail ||
        config.logos.universal.medium ||
        config.logos.universal.url ||
        '/favicon.svg';
    }

    injectSingleFavicon(faviconUrl);
  };

  const injectDefaultFavicon = () => {
    injectSingleFavicon('/favicon.svg');
  };

  const injectSingleFavicon = (faviconUrl) => {
    removeExistingFavicons();

    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    link.href = faviconUrl;
    document.head.appendChild(link);

    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.href = faviconUrl;
    document.head.appendChild(shortcut);
  };

  const removeExistingFavicons = () => {
    const existingLinks = document.querySelectorAll(
      'link[rel*="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]'
    );
    existingLinks.forEach((link) => link.remove());
  };

  // This component doesn't render anything visible
  return null;
}

export default Favicons;
