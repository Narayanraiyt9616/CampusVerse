/**
 * Configurable External Links for Online Meeting and Certification Platforms
 * 
 * Replace DEFAULT_CERTIFICATION_URL with your live website URL whenever ready,
 * or configure it via the VITE_CERTIFICATION_URL environment variable in your .env file,
 * or dynamically via localStorage ('campusverse_certification_platform_url').
 */

export const VERSEMEET_URL = 'https://versemeet-1.onrender.com/';

export const DEFAULT_CERTIFICATION_URL = 'https://certifications-demo.campusverse.edu';

const STORAGE_KEY = 'campusverse_certification_platform_url';

/**
 * Returns the active Certification & Resume platform URL.
 * Priority: LocalStorage override > VITE_CERTIFICATION_URL env var > DEFAULT_CERTIFICATION_URL
 */
export const getCertificationPlatformUrl = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // LocalStorage unavailable
  }

  const envUrl = import.meta.env?.VITE_CERTIFICATION_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }

  return DEFAULT_CERTIFICATION_URL;
};

/**
 * Updates the configurable certification platform URL in browser storage.
 */
export const setCertificationPlatformUrl = (newUrl) => {
  if (!newUrl || typeof newUrl !== 'string') {
    throw new Error('A valid web URL is required.');
  }
  const trimmed = newUrl.trim();
  localStorage.setItem(STORAGE_KEY, trimmed);
  return trimmed;
};

/**
 * Resets the certification URL to default.
 */
export const resetCertificationPlatformUrl = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return getCertificationPlatformUrl();
};

/**
 * Safely opens an external URL in a new browser tab with security flags.
 */
export const openExternalLink = (url) => {
  if (!url) return false;
  return window.open(url, '_blank', 'noopener,noreferrer');
};
