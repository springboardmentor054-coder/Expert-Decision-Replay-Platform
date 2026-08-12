import { createContext, useContext, useEffect, useState } from 'react';

const PreferencesContext = createContext(null);

const FONT_SIZE_KEY = 'edrp_font_size';
const FONT_FAMILY_KEY = 'edrp_font_family';
const DENSITY_KEY = 'edrp_density';
const LANDING_PAGE_KEY = 'edrp_landing_page';
const NOTIFICATION_PREFS_KEY = 'edrp_notification_prefs';

export const FONT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const DENSITIES = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

export const LANDING_PAGES = [
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/dashboard/decisions', label: 'All Decisions' },
  { value: '/dashboard/my-decisions', label: 'My Decisions' },
  { value: '/dashboard/approvals', label: 'Pending Approvals' },
];

export const NOTIFICATION_CATEGORIES = [
  { key: 'decisions', label: 'Decisions', description: 'Created, updated, commented on, or documents added.' },
  { key: 'reviews', label: 'Reviews & Approvals', description: 'Submitted for approval, approved, or rejected.' },
  { key: 'system', label: 'System', description: 'Account and platform-level alerts.' },
];

const DEFAULT_NOTIFICATION_PREFS = NOTIFICATION_CATEGORIES.reduce((acc, cat) => {
  acc[cat.key] = true;
  return acc;
}, {});

function loadNotificationPrefs() {
  try {
    const stored = JSON.parse(localStorage.getItem(NOTIFICATION_PREFS_KEY));
    if (stored && typeof stored === 'object') {
      return { ...DEFAULT_NOTIFICATION_PREFS, ...stored };
    }
  } catch {
    /* fall through to defaults */
  }
  return { ...DEFAULT_NOTIFICATION_PREFS };
}

export const FONT_FAMILIES = [
  { value: 'inter', label: 'Inter (Default)', stack: "'Inter', sans-serif" },
  { value: 'poppins', label: 'Poppins', stack: "'Poppins', sans-serif" },
  { value: 'roboto', label: 'Roboto', stack: "'Roboto', sans-serif" },
  { value: 'serif', label: 'Serif (Lora)', stack: "'Lora', Georgia, serif" },
  {
    value: 'system',
    label: 'System Default',
    stack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  { value: 'mono', label: 'Monospace', stack: "'Consolas', 'Courier New', monospace" },
];

function applyPreferences(fontSize, fontFamily, density) {
  document.documentElement.setAttribute('data-font-size', fontSize);
  document.documentElement.setAttribute('data-font-family', fontFamily);
  document.documentElement.setAttribute('data-density', density);
}

export function PreferencesProvider({ children }) {
  const [fontSize, setFontSizeState] = useState(
    () => localStorage.getItem(FONT_SIZE_KEY) || 'medium'
  );
  const [fontFamily, setFontFamilyState] = useState(
    () => localStorage.getItem(FONT_FAMILY_KEY) || 'inter'
  );
  const [density, setDensityState] = useState(
    () => localStorage.getItem(DENSITY_KEY) || 'comfortable'
  );
  const [defaultLandingPage, setDefaultLandingPageState] = useState(
    () => localStorage.getItem(LANDING_PAGE_KEY) || '/dashboard'
  );
  const [notificationPrefs, setNotificationPrefsState] = useState(loadNotificationPrefs);

  useEffect(() => {
    applyPreferences(fontSize, fontFamily, density);
  }, [fontSize, fontFamily, density]);

  const setFontSize = (value) => {
    localStorage.setItem(FONT_SIZE_KEY, value);
    setFontSizeState(value);
  };

  const setFontFamily = (value) => {
    localStorage.setItem(FONT_FAMILY_KEY, value);
    setFontFamilyState(value);
  };

  const setDensity = (value) => {
    localStorage.setItem(DENSITY_KEY, value);
    setDensityState(value);
  };

  const setDefaultLandingPage = (value) => {
    localStorage.setItem(LANDING_PAGE_KEY, value);
    setDefaultLandingPageState(value);
  };

  const setNotificationPref = (key, enabled) => {
    setNotificationPrefsState((prev) => {
      const next = { ...prev, [key]: enabled };
      localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <PreferencesContext.Provider
      value={{
        fontSize,
        fontFamily,
        setFontSize,
        setFontFamily,
        density,
        setDensity,
        defaultLandingPage,
        setDefaultLandingPage,
        notificationPrefs,
        setNotificationPref,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
