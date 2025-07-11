// ────────────────────────────────────────────────────────────
//  src/services/lectures.ts
//  Google-Sheets helpers
// ────────────────────────────────────────────────────────────
import { Student } from '../contexts/AuthContext';

/* Google-Sheets config */
const SHEET_ID = '1t9fs-402tKt5a9iY7H7krRBZynTUSKDoSTewvWyP0ow';
const API_KEY  = 'AIzaSyAC39h7pYezOW_AHyRhiIwblTNPce_4VaE';

export const sheetURL = (range: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

/* ↓↓↓  ONLY CHANGE IS INSIDE THIS FUNCTION  ↓↓↓ */
export const toObjects = (values: string[][]) => {
  const [head, ...rows] = values;
  const keys = head.map(h => h.trim().toLowerCase());          // ← NEW

  return rows.map((r, idx) =>
    keys.reduce((o, k, i) => ({ ...o, [k]: r[i] ?? '' }), { _row: idx }),
  );
};
/* ↑↑↑ ------------------------------------------------------ ↑↑↑ */

const norm = (v?: string) => (v ?? '').trim().toLowerCase();

/* 1. banners ------------------------------------------------ */
export interface BannerRow {
  id: string; title: string; imageUrl: string; link: string;
  order?: string; isActive?: string;
}
export const fetchBanners = async (): Promise<BannerRow[]> => {
  const res = await fetch(sheetURL('banners!A:F'));
  if (!res.ok) throw new Error('Banner fetch failed');
  const [, ...rows] = (await res.json()).values as string[][];
  return rows
    .map(r => ({
      id: r[0], title: r[1], imageUrl: r[2], link: r[3],
      order: r[4], isActive: (r[5] ?? 'TRUE').toUpperCase(),
    }))
    .filter(b => b.isActive === 'TRUE')
    .sort((a, b) => (+a.order! || 999) - (+b.order! || 999));
};

/* 2. student schedule -------------------------------------- */
export interface Session {
  id: string; subject: string; faculty: string;
  start: string; end: string; mode: string;
  link?: string; location?: string; date?: string;
}

export const fetchTodayTomorrow = async (
  student: Student,
): Promise<{ today: Session[]; tomorrow: Session[] }> => {

  const res = await fetch(sheetURL('Lectures!A:M'));
  if (!res.ok) throw new Error('Schedule fetch failed');
  const data = toObjects((await res.json()).values);

  const isoToday    = new Date().toISOString().slice(0, 10);
  const isoTomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const belongs = (r: any) =>
       norm(r.branch) === norm(student.branch)
    && norm(r.course) === norm(student.course)
    && norm(r.batch)  === norm(student.batch)
    && norm(r.year)   === norm(student.year);

  const map = (r: any): Session => ({
    id:String(r._row), subject:r.subject, faculty:r.faculty,
    start:r.start, end:r.end, mode:r.mode, link:r.link, location:r.location,
  });

  return {
    today   : data.filter(r => r.date === isoToday    && belongs(r)).map(map),
    tomorrow: data.filter(r => r.date === isoTomorrow && belongs(r)).map(map),
  };
};

/* 3. teacher future schedule ------------------------------- */
export const fetchTeacherLectures = async (teacherName: string): Promise<Session[]> => {
  if (!teacherName) return [];
  const res = await fetch(sheetURL('Lectures!A:M'));
  if (!res.ok) throw new Error('Schedule fetch failed');
  const rows = toObjects((await res.json()).values);
  const today = new Date().toISOString().slice(0, 10);

  return rows
    .filter(r => norm(r.faculty) === norm(teacherName) && r.date >= today)
    .map(r => ({ id:String(r._row), ...r } as Session))
    .sort((a,b)=>(a.date!+a.start).localeCompare(b.date!+b.start));
};

/* 4. teacher 7-day view ------------------------------------ */
export const fetchTeacherWeek = async (teacherName: string): Promise<Session[]> => {
  if (!teacherName) return [];
  const res = await fetch(sheetURL('Lectures!A:M'));
  if (!res.ok) throw new Error('Schedule fetch failed');
  const rows = toObjects((await res.json()).values);
  const start = new Date().toISOString().slice(0,10);
  const end   = new Date(Date.now()+6*86_400_000).toISOString().slice(0,10);

  return rows
    .filter(r => norm(r.faculty) === norm(teacherName) &&
                 r.date >= start && r.date <= end)
    .map(r => ({ id:String(r._row), ...r } as Session))
    .sort((a,b)=>(a.date!+a.start).localeCompare(b.date!+b.start));
};

/* 5. branches ---------------------------------------------- */
export interface BranchRow {
  id:string; branch:string; course:string; batch:string; year:string; inCharge?:string;
}
export const fetchBranches = async (): Promise<BranchRow[]> => {
  const res = await fetch(sheetURL('branches!A:F'));
  if (!res.ok) throw new Error('Branch fetch failed');
  const [, ...rows] = (await res.json()).values || [];
  return rows.map(r => ({
    id:r[0], branch:r[1], course:r[2], batch:r[3], year:r[4], inCharge:r[5],
  }));
};

/* …previous code above stays unchanged … */

/* ──────────────────────────────────────────────────────────
   ADMIN BRANCH MONTH VIEW
   Returns every lecture from TODAY to NEXT MONTH whose
   "branch" column matches the provided branch name.
   ────────────────────────────────────────────────────────── */
export async function fetchBranchMonth(
  branchName: string,
): Promise<Session[]> {
  if (!branchName) return [];

  try {
    const res = await fetch(sheetURL('Lectures!A:M'));
    if (!res.ok) {
      throw new Error(`Schedule fetch failed: ${res.status}`);
    }
    
    const data = await res.json();
    const rows = toObjects(data.values);

    // Get date range: today to one month from today
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    // Filter rows for the branch and date range
    const filtered = rows.filter(r => {
      const rowBranch = norm(r.branch);
      const targetBranch = norm(branchName);
      const dateInRange = r.date >= startDate && r.date <= endDate;
      
      return rowBranch === targetBranch && dateInRange;
    });

    // Map to Session objects
    const sessions = filtered
      .map(r => ({
        id: String(r._row),
        subject: r.subject || '',
        faculty: r.faculty || '',
        start: r.start || '',
        end: r.end || '',
        mode: r.mode || '',
        link: r.link || '',
        location: r.location || '',
        date: r.date || '',
      }))
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

    return sessions;
    
  } catch (error) {
    console.error('fetchBranchMonth error:', error);
    throw error;
  }
}



/* 7. announcements ----------------------------------------- */
export interface Announcement {
  id:string; title:string; message:string; date:string;
  image?:string; video?:string; 'More details'?:string;
}
export const fetchImportantAnnouncements = async (): Promise<Announcement[]> => {
  const res = await fetch(sheetURL('announcements!A:G'));
  if (!res.ok) throw new Error('Announcements fetch failed');
  const rows = toObjects((await res.json()).values) as Announcement[];
  return rows.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
};
