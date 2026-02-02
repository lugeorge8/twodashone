import { google } from 'googleapis';
import { getGoogleOAuthClient } from './auth';

export async function createCalendarEvent(params: {
  calendarId?: string; // default 'primary'
  summary: string;
  description?: string;
  start: string; // RFC3339
  end: string;   // RFC3339
  timeZone?: string; // e.g. 'America/Los_Angeles'
}) {
  const auth = await getGoogleOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const calendarId = params.calendarId ?? 'primary';
  const timeZone = params.timeZone ?? 'America/Los_Angeles';

  const resp = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.start, timeZone },
      end: { dateTime: params.end, timeZone },
    },
  });

  return resp.data;
}
