const NOTIFICATIONS_KEY = 'iert_student_notifications_v1';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    resourceId: 'res-cs301-u1-notes',
    title: 'New CS301 Notes Available',
    message: 'Unit 1 Stacks & Queues lecture notes uploaded for B.Tech Cyber Security Semester 3.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false
  },
  {
    id: 'notif-2',
    resourceId: 'res-cy301-pyq-2025',
    title: 'New CY301 PYQ Released',
    message: 'Previous Year Paper (2025) for Cyber Security Fundamentals is now available.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: false
  },
  {
    id: 'notif-3',
    resourceId: 'res-cs303-syllabus',
    title: 'Semester 3 Curriculum Updated',
    message: 'Official Operating Systems (CS303) syllabus and practical guide published.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    read: true
  }
];

export function getNotifications() {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
    return DEFAULT_NOTIFICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event('iert_notifications_updated'));
}

export function addNotification({ resourceId, title, message }) {
  const list = getNotifications();
  const newNotif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    resourceId: resourceId || null,
    title: title || 'New Academic Resource',
    message: message || 'A new resource has been added to IERT HUB.',
    createdAt: new Date().toISOString(),
    read: false
  };

  const updated = [newNotif, ...list];
  saveNotifications(updated);
  return newNotif;
}

export function markAsRead(id) {
  const list = getNotifications();
  const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(updated);
}

export function markAllAsRead() {
  const list = getNotifications();
  const updated = list.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function getUnreadCount() {
  const list = getNotifications();
  return list.filter(n => !n.read).length;
}
