// Auth Service handling Admin Authentication & Route Protection

const AUTH_KEY = 'iert_hub_admin_session_v3';

// Official Admin Credentials
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@iert.ac.in';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export function loginAdmin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    const sessionToken = {
      token: `auth_token_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      user: {
        email: cleanEmail,
        role: 'admin',
        name: 'IERT System Administrator'
      },
      loginTime: new Date().toISOString()
    };

    sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionToken));
    window.dispatchEvent(new Event('iert_auth_changed'));
    return { success: true, session: sessionToken };
  }

  return { success: false, error: 'Invalid administrator credentials. Access denied.' };
}

export function isAdminAuthenticated() {
  try {
    const data = sessionStorage.getItem(AUTH_KEY);
    if (!data) return false;
    const session = JSON.parse(data);
    return Boolean(session && session.token && session.user?.role === 'admin');
  } catch (err) {
    return false;
  }
}

export function getCurrentAdminUser() {
  try {
    const data = sessionStorage.getItem(AUTH_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    return session.user || null;
  } catch (err) {
    return null;
  }
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event('iert_auth_changed'));
  } catch (e) {}
}
