import { DEFAULT_SUBJECTS } from '../data/subjects';
import { logAdminAction } from './adminLogService';

const SUBJECTS_KEY = 'iert_hub_subjects_v2';

export function getStoredSubjects() {
  const data = localStorage.getItem(SUBJECTS_KEY);
  if (!data) {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(DEFAULT_SUBJECTS));
    return DEFAULT_SUBJECTS;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading subjects:', err);
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects) {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  window.dispatchEvent(new Event('iert_subjects_updated'));
}

export function addSubject(subject) {
  const subjects = getStoredSubjects();
  const newSubject = {
    id: subject.code ? subject.code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : `SUB-${Date.now()}`,
    semester: 3,
    department: "Cyber Security",
    unitsCount: 5,
    iconName: "BookOpen",
    color: "from-cyan-500 to-blue-600",
    status: 'Active',
    ...subject
  };

  const updated = [...subjects, newSubject];
  saveSubjects(updated);
  logAdminAction('Subject Added', `${newSubject.code} - ${newSubject.name}`, 'Subject');
  return newSubject;
}

export function updateSubject(id, updatedFields) {
  const subjects = getStoredSubjects();
  const index = subjects.findIndex(s => s.id === id);
  if (index === -1) return null;

  subjects[index] = {
    ...subjects[index],
    ...updatedFields
  };

  saveSubjects(subjects);
  logAdminAction('Subject Updated', `${subjects[index].code} - ${subjects[index].name}`, 'Subject');
  return subjects[index];
}

export function toggleSubjectStatus(id) {
  const subjects = getStoredSubjects();
  const index = subjects.findIndex(s => s.id === id);
  if (index === -1) return null;

  const currentStatus = subjects[index].status || 'Active';
  const newStatus = currentStatus === 'Inactive' ? 'Active' : 'Inactive';
  subjects[index].status = newStatus;

  saveSubjects(subjects);
  logAdminAction(
    newStatus === 'Inactive' ? 'Subject Deactivated' : 'Subject Reactivated',
    `${subjects[index].code} - ${subjects[index].name}`,
    'Subject'
  );

  return subjects[index];
}

export function deleteSubject(id) {
  const subjects = getStoredSubjects();
  const target = subjects.find(s => s.id === id);
  const filtered = subjects.filter(s => s.id !== id);
  saveSubjects(filtered);
  if (target) {
    logAdminAction('Subject Deleted', `${target.code} - ${target.name}`, 'Subject');
  }
  return true;
}
