const RECENTLY_VIEWED_KEY = 'iert_recently_viewed_resources_v2';
const SAVED_RESOURCES_KEY = 'iert_saved_resources';
const STREAK_DAYS_KEY = 'iert_study_streak_days';

export function getRecentlyViewedObjects() {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getRecentlyViewedIds() {
  const items = getRecentlyViewedObjects();
  return items.map(item => typeof item === 'string' ? item : item.resourceId);
}

export function addRecentlyViewed(resourceId) {
  if (!resourceId) return;
  try {
    const current = getRecentlyViewedObjects();
    const strId = String(resourceId);
    const filtered = current.filter(item => {
      const id = typeof item === 'string' ? item : item.resourceId;
      return id !== strId;
    });

    const newItem = {
      resourceId: strId,
      timestamp: new Date().toISOString()
    };

    const updated = [newItem, ...filtered].slice(0, 15);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    recordAcademicActivityDay();
    window.dispatchEvent(new Event('iert_preferences_updated'));
  } catch (err) {
    console.error('Error saving recently viewed preference:', err);
  }
}

export function getSavedResourceIds() {
  try {
    const data = localStorage.getItem(SAVED_RESOURCES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isResourceSaved(resourceId) {
  if (!resourceId) return false;
  const saved = getSavedResourceIds();
  return saved.includes(String(resourceId));
}

export function toggleSaveResource(resourceId) {
  if (!resourceId) return false;
  try {
    const saved = getSavedResourceIds();
    const strId = String(resourceId);
    let updated;
    let isSaved;

    if (saved.includes(strId)) {
      updated = saved.filter(id => id !== strId);
      isSaved = false;
    } else {
      updated = [strId, ...saved];
      isSaved = true;
    }

    localStorage.setItem(SAVED_RESOURCES_KEY, JSON.stringify(updated));
    recordAcademicActivityDay();
    window.dispatchEvent(new Event('iert_preferences_updated'));
    return isSaved;
  } catch (err) {
    console.error('Error toggling saved resource preference:', err);
    return false;
  }
}

/**
 * Study Streak Tracking (Counts consecutive active academic days)
 */
export function recordAcademicActivityDay() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STREAK_DAYS_KEY);
    let days = data ? JSON.parse(data) : [];

    if (!days.includes(todayStr)) {
      days = [todayStr, ...days];
      localStorage.setItem(STREAK_DAYS_KEY, JSON.stringify(days));
      window.dispatchEvent(new Event('iert_preferences_updated'));
    }
  } catch (err) {
    console.error('Error recording study streak:', err);
  }
}

export function getStudyStreak() {
  try {
    const data = localStorage.getItem(STREAK_DAYS_KEY);
    if (!data) return 1; // Default 1 day active session
    const days = JSON.parse(data);
    if (!days || days.length === 0) return 1;

    // Calculate consecutive days starting from today or yesterday
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (days.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (i === 0) {
          // If not active today, check if active yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (days.includes(yesterdayStr)) {
            continue;
          }
        }
        break;
      }
    }

    return Math.max(1, streak);
  } catch {
    return 1;
  }
}

/**
 * Calculate unique resources viewed per subject for Subject Progress Bars
 */
export function getSubjectViewedCounts(allResources = []) {
  const viewedIds = getRecentlyViewedIds();
  const counts = {
    CS301: 0,
    CS302: 0,
    CS303: 0,
    CY301: 0,
    MA301: 0,
    HU301: 0
  };

  const viewedResources = allResources.filter(r => viewedIds.includes(String(r.id)));
  viewedResources.forEach(r => {
    const sub = (r.subjectId || '').toUpperCase();
    if (counts[sub] !== undefined) {
      counts[sub]++;
    }
  });

  return counts;
}

/**
 * Recommendations based ONLY on real student activity
 */
export function getPersonalizedRecommendations(allResources = []) {
  const viewedIds = getRecentlyViewedIds();
  const savedIds = getSavedResourceIds();

  const viewedResources = allResources.filter(r => viewedIds.includes(String(r.id)));
  const savedResources = allResources.filter(r => savedIds.includes(String(r.id)));

  // Collect subjects the student explored
  const activeSubjects = new Set([
    ...viewedResources.map(r => r.subjectId),
    ...savedResources.map(r => r.subjectId)
  ]);

  if (activeSubjects.size > 0) {
    // Return resources from subjects student explored, excluding already saved/viewed
    const recommendations = allResources.filter(r => 
      activeSubjects.has(r.subjectId) && 
      !viewedIds.includes(String(r.id)) && 
      !savedIds.includes(String(r.id))
    );

    if (recommendations.length > 0) {
      return {
        isPersonalized: true,
        items: recommendations.slice(0, 4)
      };
    }
  }

  // Fallback: General Semester 3 Core Resources
  return {
    isPersonalized: false,
    items: allResources.slice(0, 4)
  };
}
