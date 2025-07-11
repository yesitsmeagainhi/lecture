/* ──────────────────────────────────────────────────────────
   SHEET structure
   ┌────────────┬──────────────┐
   │ Col A      │  Col B       │
   ├────────────┼──────────────┤
   │ token      │  refreshedAt │   ← header row
   │ …          │  …           │
   └────────────┴──────────────┘
   Tab name = "tokens"
───────────────────────────────────────────────────────────*/
const TOK_TAB = 'tokens';

/* 1.  PUBLIC endpoint ( GET ?token=xxxx )  */
function doGet(e) {
  const t = (e.parameter.token || '').trim();
  if (!t) return ContentService.createTextOutput('no token');

  const sh   = SpreadsheetApp.getActive().getSheetByName(TOK_TAB)
              || SpreadsheetApp.getActive().insertSheet(TOK_TAB);
  const list = sh.getDataRange().getValues().map(r => r[0]);      // existing tokens

  const now  = new Date();
  if (!list.includes(t)) {
    // new token ➜ append
    sh.appendRow([t, now]);
  } else {
    // existing ➜ update timestamp
    const row = list.indexOf(t) + 1;            // +1 for 1-based index
    sh.getRange(row, 2).setValue(now);          // col B refreshedAt
  }
  return ContentService.createTextOutput('ok');
}

/* 2.  Push helper – call this from your existing pushDueRows()
      instead of topic send */
function sendToAllTokens(payload) {
  const sa   = JSON.parse(PropertiesService.getScriptProperties()
                 .getProperty('SERVICE_JSON'));           // service-account JSON
  const url  = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;
  const token = getAccessToken();                         // your existing helper

  // fetch tokens (max 500 per FCM request)
  const rows = SpreadsheetApp.getActive()
               .getSheetByName(TOK_TAB)
               .getDataRange().getValues()
               .slice(1)                                  // skip header
               .map(r => r[0])
               .filter(Boolean);

  while (rows.length) {
    const regTokens = rows.splice(0, 500);                // chunk
    const msg = {
      ...payload,
      tokens: regTokens,                                  // multicast !
    };
    const res = UrlFetchApp.fetch(url, {
      method      : 'post',
      contentType : 'application/json',
      muteHttpExceptions: true,
      headers     : { Authorization: 'Bearer ' + token },
      payload     : JSON.stringify({ message: msg }),
    });
    if (res.getResponseCode() !== 200) {
      console.warn('push err', res.getContentText());
    }
  }
}
