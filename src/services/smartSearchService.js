/**
 * Smart Search & Ranking Engine for IERT HUB Academic Resources
 */

const SUBJECT_SHORTHANDS = {
  os: ['cs303', 'operating system', 'operating systems'],
  dsa: ['cs301', 'data structure', 'data structures', 'algorithm'],
  coa: ['cs302', 'computer organization', 'architecture'],
  cyber: ['cy301', 'cyber security', 'security'],
  maths: ['ma301', 'discrete mathematics', 'graph theory'],
  ethics: ['hu301', 'technical communication', 'cyber ethics']
};

export function performSmartSearch(query, resourcesList = []) {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim().toLowerCase();
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const scored = resourcesList.map((res) => {
    let score = 0;
    const title = (res.title || '').toLowerCase();
    const description = (res.description || '').toLowerCase();
    const subjectId = (res.subjectId || '').toLowerCase();
    const subjectName = (res.subjectName || '').toLowerCase();
    const category = (res.type || '').toLowerCase();
    const unitStr = res.unit ? `unit ${res.unit}` : '';
    const yearStr = res.year ? String(res.year) : '';
    const tags = (res.tags || []).map(t => String(t).toLowerCase());

    // 1. Exact Title Match or Starts With Title (Score 100)
    if (title === cleanQuery) {
      score += 100;
    } else if (title.startsWith(cleanQuery)) {
      score += 85;
    } else if (title.includes(cleanQuery)) {
      score += 70;
    }

    // 2. Subject Code Match or Shorthand (Score 80)
    if (subjectId === cleanQuery) {
      score += 80;
    } else if (subjectId.includes(cleanQuery)) {
      score += 60;
    }

    // Shorthands (e.g. "OS" -> CS303)
    Object.entries(SUBJECT_SHORTHANDS).forEach(([shorthand, equivalents]) => {
      if (cleanQuery === shorthand || equivalents.some(eq => eq.includes(cleanQuery))) {
        if (subjectId.includes(shorthand) || equivalents.some(eq => subjectName.includes(eq) || subjectId.includes(eq))) {
          score += 65;
        }
      }
    });

    // 3. Subject Name Match (Score 50)
    if (subjectName.includes(cleanQuery)) {
      score += 50;
    }

    // 4. Unit Match (Score 40)
    if (unitStr && (cleanQuery.includes(`unit ${res.unit}`) || cleanQuery === `unit${res.unit}` || cleanQuery === `u${res.unit}`)) {
      score += 45;
    } else if (unitStr && cleanQuery.includes(unitStr)) {
      score += 35;
    }

    // 5. Category / Year / Description / Tags Match (Score 20 - 30)
    if (category.includes(cleanQuery)) {
      score += 30;
    }
    if (yearStr && cleanQuery.includes(yearStr)) {
      score += 30;
    }
    if (description.includes(cleanQuery)) {
      score += 20;
    }
    if (tags.some(t => t.includes(cleanQuery))) {
      score += 25;
    }

    // Multi-token match bonus
    tokens.forEach(tok => {
      if (title.includes(tok)) score += 15;
      if (subjectName.includes(tok)) score += 10;
      if (description.includes(tok)) score += 5;
    });

    return { resource: res, score };
  });

  // Filter out 0 scores and sort descending by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.resource);
}
