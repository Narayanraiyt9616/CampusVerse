/**
 * Configurable External Meeting Platform Utility
 * Provides a unified, configurable meeting website URL used by both
 * the Faculty Portal and Student Portal without hardcoding.
 */

const STORAGE_KEY = 'campusverse_external_meeting_platform_url';
export const VERSEMEET_URL = 'https://versemeet-1.onrender.com/';
export const DEFAULT_FALLBACK_URL = VERSEMEET_URL;

/**
 * Returns the currently configured external meeting platform URL.
 * Priority: LocalStorage runtime configuration > VITE_EXTERNAL_MEETING_URL env > Default Fallback
 */
export const getMeetingPlatformUrl = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // LocalStorage unavailable, continue to env
  }

  const envUrl = import.meta.env?.VITE_EXTERNAL_MEETING_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }

  return DEFAULT_FALLBACK_URL;
};

/**
 * Validates whether a provided meeting platform URL is structurally valid and secure.
 */
export const validateMeetingUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') {
    return { isValid: false, error: 'Meeting URL is required.' };
  }

  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { isValid: false, error: 'URL must begin with https:// (or http:// in development).' };
    }
    return { isValid: true, url: trimmed };
  } catch {
    return { isValid: false, error: 'Please enter a valid web URL (e.g. https://meet.google.com).' };
  }
};

/**
 * Updates the configurable meeting platform URL stored in the browser.
 */
export const setMeetingPlatformUrl = (newUrl) => {
  const validation = validateMeetingUrl(newUrl);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  localStorage.setItem(STORAGE_KEY, validation.url);
  return validation.url;
};

/**
 * Resets the configurable URL back to the default environment configuration.
 */
export const resetMeetingPlatformUrl = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return getMeetingPlatformUrl();
};

/**
 * Safely launches the configured external meeting website in a new browser tab.
 * Returns { success: boolean, url?: string, message?: string }
 */
export const openExternalMeetingPlatform = () => {
  const currentUrl = getMeetingPlatformUrl();
  const validation = validateMeetingUrl(currentUrl);

  if (!validation.isValid) {
    return {
      success: false,
      message: `The external meeting platform URL is not properly configured: ${validation.error}`,
    };
  }

  try {
    const win = window.open(validation.url, '_blank', 'noopener,noreferrer');
    if (!win) {
      return {
        success: false,
        message: 'Popup blocked. Please allow popups for CampusVerse or open the link directly.',
        url: validation.url,
      };
    }
    return {
      success: true,
      url: validation.url,
      message: 'Meeting platform opened in a new tab.',
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to open meeting platform: ${err?.message || 'Unknown error'}`,
      url: validation.url,
    };
  }
};
