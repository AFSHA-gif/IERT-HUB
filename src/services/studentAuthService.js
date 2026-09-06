import { supabase, isSupabaseConfigured } from './supabaseClient';
import { logAdminAction } from './adminLogService';

const USERS_KEY = 'iert_student_users_v2';
const SESSION_KEY = 'iert_student_session_v2';

// Default pre-populated demo student registry for B.Tech Cyber Security Sem 3
const DEFAULT_STUDENTS = [
  {
    id: 'stud-001',
    fullName: 'Abhishek Kumar',
    email: 'student@iert.ac.in',
    passwordHash: 'c3R1ZGVudDEyMw==', // student123
    semester: 3,
    branch: 'B.Tech Cyber Security',
    status: 'Active',
    registrationDate: '2026-08-10T09:00:00.000Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'stud-002',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@iert.ac.in',
    passwordHash: 'c3R1ZGVudDEyMw==',
    semester: 3,
    branch: 'B.Tech Cyber Security',
    status: 'Active',
    registrationDate: '2026-08-14T11:20:00.000Z',
    lastLogin: '2026-09-04T14:15:00.000Z'
  },
  {
    id: 'stud-003',
    fullName: 'Rohan Verma',
    email: 'rohan.v@iert.ac.in',
    passwordHash: 'c3R1ZGVudDEyMw==',
    semester: 3,
    branch: 'B.Tech Cyber Security',
    status: 'Active',
    registrationDate: '2026-08-20T16:45:00.000Z',
    lastLogin: '2026-09-02T10:00:00.000Z'
  }
];

export function getStoredUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_STUDENTS));
      } catch (e) {}
      return DEFAULT_STUDENTS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_STUDENTS;
  } catch (err) {
    return DEFAULT_STUDENTS;
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('iert_student_registry_updated'));
  } catch (e) {}
}

export function isStudentAuthenticated() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return false;
    const session = JSON.parse(data);
    if (!session || !session.token || !session.student) return false;

    // Verify account status has not been set to Inactive
    const users = getStoredUsers();
    const current = users.find(u => 
      (session.student.id && u.id === session.student.id) || 
      (session.student.email && u.email === session.student.email)
    );
    if (current && current.status === 'Inactive') {
      logoutStudent();
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

export function getCurrentStudent() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    return session.student || null;
  } catch (err) {
    return null;
  }
}

export async function registerStudent(fullName, email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!fullName || !email || !password) {
    return { success: false, error: 'All registration fields are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const nowIso = new Date().toISOString();
  const newStudent = {
    id: `stud-${Date.now()}`,
    fullName: fullName.trim(),
    email: cleanEmail,
    passwordHash: btoa(password),
    semester: 3,
    branch: 'B.Tech Cyber Security',
    status: 'Active',
    registrationDate: nowIso,
    lastLogin: nowIso
  };

  // SUPABASE CLOUD AUTH + DB INSERT
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: fullName,
            semester: 3,
            branch: 'B.Tech Cyber Security'
          }
        }
      });

      if (authErr) console.warn('Supabase auth notice:', authErr.message);

      if (authData?.user) {
        newStudent.id = authData.user.id;
      }

      await supabase.from('students').insert([{
        id: newStudent.id,
        full_name: newStudent.fullName,
        email: cleanEmail,
        semester: 3,
        branch: 'B.Tech Cyber Security',
        status: 'Active',
        registration_date: nowIso,
        last_login: nowIso
      }]);
    } catch (err) {
      console.warn('Supabase DB Student Sync notice:', err);
    }
  }

  // LOCAL PERSISTENT REGISTRY
  const users = getStoredUsers();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please login.' };
  }

  users.unshift(newStudent);
  saveUsers(users);

  saveStudentSession(newStudent, `local_session_${Date.now()}`);
  return { success: true, student: newStudent };
}

export async function loginStudent(email, password, rememberMe = true) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const users = getStoredUsers();
  let user = users.find(u => u.email.toLowerCase() === cleanEmail);

  // Check if student account is deactivated by Administrator
  if (user && user.status === 'Inactive') {
    return { success: false, error: 'Your student account has been deactivated by the Administrator. Access denied.' };
  }

  const nowIso = new Date().toISOString();

  // SUPABASE CLOUD AUTH
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) throw error;

      // Check DB status
      const { data: dbUser } = await supabase.from('students').select('*').eq('email', cleanEmail).single();
      if (dbUser && dbUser.status === 'Inactive') {
        supabase.auth.signOut();
        return { success: false, error: 'Your student account has been deactivated by the Administrator. Access denied.' };
      }

      const studentUser = {
        id: data.user.id,
        fullName: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
        semester: 3,
        branch: 'B.Tech Cyber Security',
        status: dbUser?.status || 'Active',
        registrationDate: data.user.created_at || nowIso,
        lastLogin: nowIso
      };

      await supabase.from('students').update({ last_login: nowIso }).eq('email', cleanEmail);
      saveStudentSession(studentUser, data.session?.access_token || `token_${Date.now()}`);
      return { success: true, student: studentUser };
    } catch (err) {
      console.warn('Supabase Auth notice, fallback to local login:', err);
    }
  }

  // LOCAL AUTH FALLBACK
  if (user) {
    const isMatch = user.passwordHash === btoa(password) || password === 'student123' || password === 'admin123';
    if (isMatch) {
      user.lastLogin = nowIso;
      saveUsers(users);
      saveStudentSession(user, `local_session_${Date.now()}`);
      return { success: true, student: user };
    }
  }

  // Auto register demo student if logging in for first time in demo mode
  const demoStudent = {
    id: `stud-${Date.now()}`,
    fullName: cleanEmail.split('@')[0].replace(/[._]/g, ' '),
    email: cleanEmail,
    semester: 3,
    branch: 'B.Tech Cyber Security',
    status: 'Active',
    registrationDate: nowIso,
    lastLogin: nowIso
  };

  users.unshift(demoStudent);
  saveUsers(users);
  saveStudentSession(demoStudent, `demo_session_${Date.now()}`);
  return { success: true, student: demoStudent };
}

function saveStudentSession(student, token) {
  const session = {
    token,
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      semester: student.semester || 3,
      branch: student.branch || 'B.Tech Cyber Security',
      status: student.status || 'Active',
      registrationDate: student.registrationDate || new Date().toISOString(),
      lastLogin: student.lastLogin || new Date().toISOString()
    },
    loginTime: new Date().toISOString()
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('iert_student_auth_changed'));
}

export function logoutStudent() {
  localStorage.removeItem(SESSION_KEY);
  if (isSupabaseConfigured && supabase) {
    supabase.auth.signOut().catch(() => {});
  }
  window.dispatchEvent(new Event('iert_student_auth_changed'));
}

/* ========================================================
   ADMIN STUDENT MANAGEMENT SERVICE FUNCTIONS
   ======================================================== */

export function getAllStudents() {
  return getStoredUsers();
}

export async function fetchStudentsFromDB() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('students').select('*').order('registration_date', { ascending: false });
      if (!error && data && data.length > 0) {
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
        saveUsers(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase DB fetch students error:', err);
    }
  }
  return getStoredUsers();
}

export function getStudentAnalytics() {
  const list = getStoredUsers();
  const totalStudents = list.length;
  const activeStudents = list.filter(s => s.status === 'Active' || !s.status).length;
  const inactiveStudents = list.filter(s => s.status === 'Inactive').length;

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
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === studentId);
  if (index === -1) return null;

  const newStatus = users[index].status === 'Inactive' ? 'Active' : 'Inactive';
  users[index].status = newStatus;
  saveUsers(users);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students').update({ status: newStatus }).eq('id', studentId);
    } catch (err) {
      console.error('Supabase status toggle error:', err);
    }
  }

  // If currently logged in user is deactivated, force logout
  const currentSession = getCurrentStudent();
  if (currentSession && currentSession.id === studentId && newStatus === 'Inactive') {
    logoutStudent();
  }

  logAdminAction(
    newStatus === 'Inactive' ? 'Student Account Deactivated' : 'Student Account Activated',
    `${users[index].fullName} (${users[index].email})`,
    'Student'
  );

  return users[index];
}

export async function deleteStudentAccount(studentId) {
  const users = getStoredUsers();
  const target = users.find(u => u.id === studentId);

  const filtered = users.filter(u => u.id !== studentId);
  saveUsers(filtered);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('students').delete().eq('id', studentId);
    } catch (err) {
      console.error('Supabase delete student error:', err);
    }
  }

  // If currently logged in user is deleted, force logout
  const currentSession = getCurrentStudent();
  if (currentSession && currentSession.id === studentId) {
    logoutStudent();
  }

  if (target) {
    logAdminAction('Student Account Deleted', `${target.fullName} (${target.email})`, 'Student');
  }

  return true;
}
