// ─────────────────────────────────────────────────────────
//  src/services/googleSheets.js
//  Updated to handle column names properly
// ─────────────────────────────────────────────────────────
const SHEET_ID = '1t9fs-402tKt5a9iY7H7krRBZynTUSKDoSTewvWyP0ow';
const API_KEY  = 'AIzaSyAC39h7pYezOW_AHyRhiIwblTNPce_4VaE';
const RANGE    = 'students!A:K';

/**
 * Download the sheet once, then reuse in memory.
 * Returns an array of objects with original column names preserved
 */
export async function getStudents() {
  if (global.__studentsCache) return global.__studentsCache;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    RANGE
  )}?key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Sheet fetch failed');

  const { values } = await res.json();
  const [header, ...rows] = values;

  // Map rows to objects, preserving original column names
  const data = rows.map(r =>
    header.reduce((obj, col, idx) => ({ ...obj, [col]: r[idx] ?? '' }), {})
  );

  // Debug logging
  if (data.length > 0) {
    console.log('Sample student object keys:', Object.keys(data[0]));
    console.log('First student:', data[0]);
  }

  global.__studentsCache = data;
  return data;
}

/**
 * Simple credential check with debug logging
 */
export async function authenticate(number, password) {
  const rows = await getStudents();
  
  const user = rows.find(
    r => r.number === String(number).trim() && r.password === String(password).trim()
  );
  
  if (user) {
    console.log('=== Authenticated User ===');
    console.log('Full user object:', user);
    console.log('Role:', user.Role);
    console.log('Faculty:', user.Faculty);
    console.log('All keys:', Object.keys(user));
    console.log('========================');
  }
  
  return user;
}