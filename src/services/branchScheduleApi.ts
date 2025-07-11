import { BranchRow, Session } from './lectures';
import { sheetURL, toObjects } from './lectures';   // re-use helpers

export async function fetchBranchMonth(
  branch: BranchRow,
): Promise<Session[]> {

  const res = await fetch(sheetURL('Lectures!A:M'));
  if (!res.ok) throw new Error('Schedule fetch failed');

  const rows = toObjects((await res.json()).values);

  // current month range
  const now   = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
  const last  = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);

  return rows
    .filter(r =>
         r.branch?.toLowerCase() === branch.branch.toLowerCase()
      && r.date >= first && r.date <= last)
    .map(r => ({
      id: String(r._row),
      subject : r.subject,
      faculty : r.faculty,
      start   : r.start,
      end     : r.end,
      mode    : r.mode,
      link    : r.link,
      location: r.location,
      date    : r.date,
    }))
    .sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start));
}
