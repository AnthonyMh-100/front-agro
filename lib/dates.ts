import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export function todayISO(): string {
  return moment().format('YYYY-MM-DD');
}

export function formatDayShort(value: string): string {
  return moment.utc(value).format('ddd D MMM YYYY');
}

export function formatDayLong(value: string): string {
  return moment.utc(value).format('dddd D [de] MMMM [de] YYYY');
}

export function formatTime(value: string): string {
  return moment(value).format('HH:mm');
}

export function formatDateRange(start: string, end: string): string {
  return `${moment.utc(start).format('D MMM YYYY')} – ${moment.utc(end).format('D MMM YYYY')}`;
}

export function coversToday(startDate: string, endDate: string, isActive: boolean): boolean {
  if (!isActive) return false;
  const today = moment().format('YYYY-MM-DD');
  return startDate.slice(0, 10) <= today && today <= endDate.slice(0, 10);
}
