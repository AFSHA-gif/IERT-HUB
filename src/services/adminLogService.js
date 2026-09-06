const LOGS_KEY = 'iert_admin_activity_log_v1';

const DEFAULT_LOGS = [
  {
    id: 'log-1',
    action: 'PDF Uploaded',
    target: 'CS301 Unit 1 Stacks & Queues',
    admin: 'admin@iert.ac.in',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    category: 'Resource'
  },
  {
    id: 'log-2',
    action: 'Student Activated',
    target: 'Abhishek Kumar (student@iert.ac.in)',
    admin: 'admin@iert.ac.in',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    category: 'Student'
  },
  {
    id: 'log-3',
    action: 'Subject Updated',
    target: 'CY301 - Cyber Security Fundamentals',
    admin: 'admin@iert.ac.in',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    category: 'Subject'
  }
];

export function getAdminLogs() {
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(DEFAULT_LOGS));
    return DEFAULT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return DEFAULT_LOGS;
  }
}

export function logAdminAction(action, target, category = 'General') {
  const logs = getAdminLogs();
  const newEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    target: typeof target === 'string' ? target : JSON.stringify(target),
    admin: 'admin@iert.ac.in',
    timestamp: new Date().toISOString(),
    category
  };

  const updated = [newEntry, ...logs].slice(0, 100); // keep max 100 logs
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('iert_admin_log_updated'));
  return newEntry;
}

export function getRecentAdminLogs(limit = 6) {
  const logs = getAdminLogs();
  return logs.slice(0, limit);
}

export function clearAdminLogs() {
  localStorage.removeItem(LOGS_KEY);
  window.dispatchEvent(new Event('iert_admin_log_updated'));
}
