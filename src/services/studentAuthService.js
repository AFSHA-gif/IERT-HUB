import { supabase, isSupabaseConfigured } from './supabaseClient';
import { logAdminAction } from './adminLogService';

const SESSION_KEY = 'iert_student_session_v4';
const PROFILES_CACHE_KEY = 'iert_student_registry_v4';

let activeStudentSession = null;

/**
 * Synchronize and cache student session in memory and storage
 */
export function setStudentSession(sessionData) {
  activeStudentSession = sessionData;
  if (sessionData) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  } else {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }
  window.dispatchEvent(new Event('iert_student_auth_changed'));
}

export function getCurrentStudent() {
  if (activeStudentSession?.student) {
    return activeStudentSession.student;
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.student || null;
  } catch (e) {
    return null;
  }
}

export function isStudentAuthenticated() {
  const student = getCurrentStudent();
  if (!student || !student.id) return false;
  if (student.status === 'Inactive' || student.status === 'deactivated') {
    logoutStudent();
    return false;
  }
  return true;
}

export async function updateStudentProfile(fullName) {
  const current = getCurrentStudent();
  if (!current || !current.id) return { success: false, error: 'User is not logged in.' };

  const cleanName = (fullName || '').trim();
  if (!cleanName) return { success: false, error: 'Full name is required.' };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students').update({ full_name: cleanName }).eq('id', current.id);
      await supabase.auth.updateUser({ data: { full_name: cleanName } });
    } catch (err) {
      console.warn('Update profile DB error:', err);
    }
  }

  const updatedStudent = { ...current, fullName: cleanName };
  setStudentSession({
    token: activeStudentSession?.token || `token_${Date.now()}`,
    student: updatedStudent,
    loginTime: new Date().toISOString()
  });

  return { success: true, student: updatedStudent };
}

/**
 * Environment-aware Auth Redirect URL
 * Production: https://iert-hub.vercel.app/student/login
 * Local Dev: http://localhost:5173/student/login
 */
export function getAuthRedirectUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    return `${origin}/student/login`;
  }
  return 'https://iert-hub.vercel.app/student/login';
}

/**
 * Supabase Auth Production Registration
 * Requires valid email & password. User is registered directly in auth.users + public.students profile.
 */
export async function registerStudent(fullName, email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (fullName || '').trim();

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, error: 'Full name, email address, and password are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const redirectTarget = getAuthRedirectUrl();

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectTarget,
          data: {
            full_name: cleanName,
            semester: 3,
            branch: 'B.Tech Cyber Security'
          }
        }
      });

      if (authErr) {
        if (authErr.message.toLowerCase().includes('rate limit')) {
          return {
            success: false,
            error: 'Email verification limit exceeded. Supabase default email limit reached. Please wait 10-15 minutes or configure custom SMTP in Supabase Dashboard.'
          };
        }
        return { success: false, error: authErr.message };
      }

      if (!authData?.user) {
        return { success: false, error: 'Registration failed. Unable to create authentication account.' };
      }

      const userId = authData.user.id;
      const nowIso = new Date().toISOString();

      // Insert Student Profile Record into public.students
      try {
        await supabase.from('students').upsert([{
          id: userId,
          full_name: cleanName,
          email: cleanEmail,
          semester: 3,
          branch: 'B.Tech Cyber Security',
          status: 'Active',
          registration_date: nowIso,
          last_login: nowIso
        }], { onConflict: 'id' });
      } catch (profileErr) {
        console.warn('Student profile upsert notice:', profileErr);
      }

      // Assign student role in public.user_roles
      try {
        await supabase.from('user_roles').upsert([{
          user_id: userId,
          role: 'student',
          active: true
        }], { onConflict: 'user_id' });
      } catch (roleErr) {}

      // Handle Email Verification requirement if enabled on Supabase
      if (authData.session === null && authData.user?.identities?.length > 0) {
        return {
          success: true,
          requiresVerification: true,
          message: 'Registration successful! A verification link has been sent to your email address. Please confirm your email before logging in.'
        };
      }

      const studentObj = {
        id: userId,
        fullName: cleanName,
        email: cleanEmail,
        semester: 3,
        branch: 'B.Tech Cyber Security',
        status: 'Active',
        registrationDate: nowIso,
        lastLogin: nowIso
      };

      setStudentSession({
        token: authData.session?.access_token || `token_${Date.now()}`,
        student: studentObj,
        loginTime: nowIso
      });

      return { success: true, student: studentObj };
    } catch (err) {
      console.error('Registration exception:', err);
      return { success: false, error: err.message || 'Registration failed due to a network error.' };
    }
  }

  // Development Fallback Only (Disabled in production when Supabase is configured)
  return { success: false, error: 'Backend authentication server unavailable. Please configure Supabase Auth.' };
}

/**
 * Supabase Auth Production Login
 * Verifies email + password against Supabase Auth.
 */
export async function loginStudent(email, password, rememberMe = true) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { success: false, error: 'Email address and password are required.' };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (authErr) {
        if (authErr.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email address before logging in.' };
        }
        return { success: false, error: 'Invalid email address or password. Access denied.' };
      }

      const user = authData?.user;
      if (!user) {
        return { success: false, error: 'Authentication failed. User session not found.' };
      }

      // Check Student Profile Status in public.students
      const { data: profile } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && (profile.status === 'Inactive' || profile.status === 'deactivated')) {
        await supabase.auth.signOut();
        setStudentSession(null);
        return { success: false, error: 'Your student account has been deactivated by an administrator. Access denied.' };
      }

      const nowIso = new Date().toISOString();
      const studentObj = {
        id: user.id,
        fullName: profile?.full_name || user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
        semester: profile?.semester || 3,
        branch: profile?.branch || 'B.Tech Cyber Security',
        status: profile?.status || 'Active',
        registrationDate: profile?.registration_date || user.created_at || nowIso,
        lastLogin: nowIso
      };

      // Ensure Student Profile exists in public.students (Self-healing on login if registered before trigger)
      if (!profile) {
        try {
          await supabase.from('students').upsert([{
            id: user.id,
            full_name: user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            semester: 3,
            branch: 'B.Tech Cyber Security',
            status: 'Active',
            registration_date: user.created_at || nowIso,
            last_login: nowIso
          }], { onConflict: 'id' });
        } catch (pe) {}
      } else {
        // Update last_login timestamp in public.students
        await supabase.from('students').update({ last_login: nowIso }).eq('id', user.id);
      }

      setStudentSession({
        token: authData.session?.access_token || `token_${Date.now()}`,
        student: studentObj,
        loginTime: nowIso
      });

      return { success: true, student: studentObj };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
    }
  }

  return { success: false, error: 'Backend authentication server unavailable. Please configure Supabase Auth.' };
}

/**
 * Logout Student Session
 */
export async function logoutStudent() {
  setStudentSession(null);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }
}

/**
 * Send Password Reset Email via Supabase Auth
 */
export async function resetStudentPassword(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return { success: false, error: 'Email address is required.' };

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/student/login`
      });
      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Password reset link has been sent to your email address.' };
    } catch (err) {
      return { success: false, error: err.message || 'Password reset request failed.' };
    }
  }
  return { success: false, error: 'Supabase Auth is not configured.' };
}

/* ========================================================
   ADMIN STUDENT MANAGEMENT SERVICE FUNCTIONS
   ======================================================== */

export async function fetchStudentsFromDB() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) {
        console.warn('Fetch students DB error:', error.message);
      }

      if (!error && data) {
        console.log('Fetch students DB success count:', data.length);
        const mapped = data.map(s => ({
          id: s.id,
          fullName: s.full_name,
          email: s.email,
          semester: s.semester || 3,
          branch: s.branch || 'B.Tech Cyber Security',
          status: s.status || 'Active',
          registrationDate: s.registration_date,
          lastLogin: s.last_login
        }));
        try {
          localStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(mapped));
        } catch (e) {}
        return mapped;
      }
    } catch (err) {
      console.warn('Fetch students error:', err);
    }
  }

  try {
    const raw = localStorage.getItem(PROFILES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getAllStudents() {
  try {
    const raw = localStorage.getItem(PROFILES_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getStudentAnalytics(providedList) {
  const list = providedList || getAllStudents();
  const totalStudents = list.length;
  const activeStudents = list.filter(s => s.status === 'Active' || !s.status).length;
  const inactiveStudents = list.filter(s => s.status === 'Inactive' || s.status === 'deactivated').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const newToday = list.filter(s => s.registrationDate && s.registrationDate.startsWith(todayStr)).length;

  return {
    totalStudents,
    activeStudents,
    inactiveStudents,
    newToday
  };
}

export async function toggleStudentStatus(studentId) {
  if (!studentId) return null;

  let newStatus = 'Inactive';
  const list = getAllStudents();
  const found = list.find(s => s.id === studentId);
  if (found) {
    newStatus = found.status === 'Inactive' || found.status === 'deactivated' ? 'Active' : 'Inactive';
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students').update({ status: newStatus }).eq('id', studentId);
    } catch (err) {
      console.error('Toggle status DB error:', err);
    }
  }

  // Update local cache
  const updatedList = list.map(s => s.id === studentId ? { ...s, status: newStatus } : s);
  try {
    localStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(updatedList));
  } catch (e) {}

  // If active logged in student was deactivated, revoke session
  const current = getCurrentStudent();
  if (current && current.id === studentId && newStatus === 'Inactive') {
    logoutStudent();
  }

  if (found) {
    logAdminAction(
      newStatus === 'Inactive' ? 'Student Account Deactivated' : 'Student Account Activated',
      `${found.fullName} (${found.email})`,
      'Student'
    );
  }

  return { ...found, status: newStatus };
}

export async function deleteStudentAccount(studentId) {
  if (!studentId) return false;

  const list = getAllStudents();
  const target = list.find(s => s.id === studentId);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students').delete().eq('id', studentId);
      await supabase.from('user_roles').delete().eq('user_id', studentId);
    } catch (err) {
      console.error('Delete student DB error:', err);
    }
  }

  const filtered = list.filter(s => s.id !== studentId);
  try {
    localStorage.setItem(PROFILES_CACHE_KEY, JSON.stringify(filtered));
  } catch (e) {}

  const current = getCurrentStudent();
  if (current && current.id === studentId) {
    logoutStudent();
  }

  if (target) {
    logAdminAction('Student Account Deleted', `${target.fullName} (${target.email})`, 'Student');
  }

  return true;
}
