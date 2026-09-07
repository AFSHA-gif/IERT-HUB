import { supabase, isSupabaseConfigured } from './supabaseClient';

const ADMIN_SESSION_KEY = 'iert_admin_session_v4';

let activeAdminSession = null;

/**
 * Synchronize and cache admin session
 */
export function setAdminSession(sessionData) {
  activeAdminSession = sessionData;
  if (sessionData) {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  } else {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {}
  }
  window.dispatchEvent(new Event('iert_auth_changed'));
}

export function getCurrentAdminUser() {
  if (activeAdminSession?.user) {
    return activeAdminSession.user;
  }
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || null;
  } catch (e) {
    return null;
  }
}

export function isAdminAuthenticated() {
  const admin = getCurrentAdminUser();
  if (!admin || !admin.id || admin.role !== 'admin' || admin.active !== true) {
    return false;
  }
  return true;
}

/**
 * Supabase Auth Production Admin Login
 * 1. Authenticates email/password via Supabase Auth
 * 2. Queries public.user_roles for user_id = auth.uid()
 * 3. Enforces role = 'admin' AND active = true
 */
export async function loginAdmin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { success: false, error: 'Administrator email and password are required.' };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Authenticate credentials via Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (authErr) {
        return { success: false, error: 'Invalid administrator credentials. Access denied.' };
      }

      const user = authData?.user;
      if (!user) {
        return { success: false, error: 'Authentication failed. User session not created.' };
      }

      // 2. Query public.user_roles for Server-Side Role Authorization
      const { data: roleRecord, error: roleErr } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Enforce Admin Role & Active Status
      const isAdminRole = roleRecord?.role === 'admin' && roleRecord?.active === true;

      // Allow initial bootstrap override if admin email matches configured primary admin email
      const primaryAdminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@iert.ac.in';
      const isPrimaryAdminBootstrap = cleanEmail === primaryAdminEmail.toLowerCase();

      if (!isAdminRole && !isPrimaryAdminBootstrap) {
        await supabase.auth.signOut();
        setAdminSession(null);
        return { 
          success: false, 
          error: 'Access Denied: Your account is not authorized as an administrator.' 
        };
      }

      // Automatically register primary admin role in user_roles if bootstrapping
      if (isPrimaryAdminBootstrap && (!roleRecord || roleRecord.role !== 'admin')) {
        try {
          await supabase.from('user_roles').upsert([{
            user_id: user.id,
            role: 'admin',
            active: true
          }], { onConflict: 'user_id' });
        } catch (e) {}
      }

      const adminUser = {
        id: user.id,
        email: cleanEmail,
        role: 'admin',
        active: true,
        name: user.user_metadata?.full_name || 'IERT System Administrator',
        loginTime: new Date().toISOString()
      };

      setAdminSession({
        token: authData.session?.access_token || `token_${Date.now()}`,
        user: adminUser,
        loginTime: new Date().toISOString()
      });

      return { success: true, user: adminUser };
    } catch (err) {
      console.error('Admin authentication error:', err);
      return { success: false, error: err.message || 'Administrator authentication failed.' };
    }
  }

  return { success: false, error: 'Backend authentication server unavailable. Please configure Supabase Auth.' };
}

/**
 * Logout Admin Session
 */
export async function logoutAdmin() {
  setAdminSession(null);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
}
