import { useEffect } from 'react';
import { useAppConfig } from '../context/AppConfigContext';

/**
 * Component to dynamically update document title
 */
function DocumentTitle({ suffix = '' }) {
  const { getTitle, loading } = useAppConfig();

  useEffect(() => {
    if (!loading) {
      const title = getTitle();
      document.title = suffix ? `${title} | ${suffix}` : title;
    }
  }, [loading, getTitle, suffix]);

  return null;
}

export default DocumentTitle;
