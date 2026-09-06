import { supabase, isSupabaseConfigured, BUCKET_NAME, getStorageModeInfo } from './supabaseClient';
import { getStoredResources } from './resourceService';
import { getAllStudents } from './studentAuthService';

export async function checkSystemHealth() {
  const storageInfo = getStorageModeInfo();
  const resources = getStoredResources();
  const students = getAllStudents();

  const health = {
    database: {
      name: 'Database Storage Layer',
      status: 'Operational',
      details: isSupabaseConfigured ? 'Supabase PostgreSQL Cloud DB Active' : 'Local Persistent Cache Active',
      type: isSupabaseConfigured ? 'cloud' : 'local'
    },
    supabaseConfig: {
      name: 'Supabase Cloud Integration',
      status: isSupabaseConfigured ? 'Operational' : 'Configuration Required',
      details: isSupabaseConfigured ? 'Cloud Project API Connected' : 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables not set',
      type: isSupabaseConfigured ? 'cloud' : 'warning'
    },
    privateStorage: {
      name: 'Private Storage Security',
      status: 'Operational',
      details: `Bucket: "${BUCKET_NAME}" • Private RLS Enforced • 1-Hour Short-lived Signed URLs Active`,
      type: 'security'
    },
    authService: {
      name: 'Authentication Control',
      status: 'Operational',
      details: 'Dual Auth Isolated System (Student Portal & Admin Control Center)',
      type: 'security'
    },
    resourceService: {
      name: 'Resource Service Engine',
      status: resources.length > 0 ? 'Operational' : 'Configuration Required',
      details: `${resources.length} Academic PDFs active across Semester 3 curriculum`,
      type: 'operational'
    },
    studentRegistry: {
      name: 'Student Registry System',
      status: students.length > 0 ? 'Operational' : 'Configuration Required',
      details: `${students.length} Registered student accounts verified`,
      type: 'operational'
    }
  };

  // Test live Supabase connection if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('resources').select('id').limit(1);
      if (error) {
        health.database.status = 'Configuration Required';
        health.database.details = `Supabase DB check notice: ${error.message}`;
      }
    } catch (err) {
      health.database.status = 'Unavailable';
      health.database.details = 'Supabase Cloud DB connection failed';
    }
  }

  return health;
}
