import moment from 'moment';
import { tz } from 'moment-timezone';

const dateTimeFormat = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone).format('ddd  M/D/YYYY');
};
const dateFormat = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone).format('M/D/YY');
};

const dateFormatWithoutTimezone = incomingDate => {
  return moment(incomingDate).format('M/D/YY');
};

const dateFormatFullYear = incomingDate => {
  return moment(incomingDate).format('M/D/YYYY');
};

const dateFormatFullMonth = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone).format('MMMM DD, YYYY');
};
const convertToIsoString = incomingDate => {
  return moment(incomingDate).toISOString();
};
const getOnlyDate = incomingDate => {
  return incomingDate?.toISOString()?.split('T')[0];
};

const getCompleteDate = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone)?.format('MMMM Do, YYYY');
};

const getCompleteWDate = incomingDate => {
  return moment(incomingDate)?.format('MMMM Do, YYYY');
};

const getTwoWeeksLaterDate = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone).add(2, 'weeks').format('YYYY-MM-DD');
};

const getWeekRangeFormat = (incomingDate, timezone = 'UTC') => {
  const startOfWeek = tz(incomingDate, timezone)
    .startOf('isoWeek')
    .format('M/D');
  const endOfWeek = tz(incomingDate, timezone).endOf('isoWeek').format('M/D');
  return `${startOfWeek}-${endOfWeek}`;
};

const getMonthNameFormat = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone)?.format('MMMM');
};
const rteDateFormatFullMonth = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone).format('YYYY-MM-DD');
};

const rteMonthNameFormat = incomingDate => {
  const [y, m, d] = incomingDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
};

const rteDateMonthFormat = (incomingDate, timezone = 'UTC') => {
  return tz(incomingDate, timezone)?.format('MM/DD');
};

export {
  convertToIsoString,
  dateFormat,
  dateFormatFullMonth,
  dateFormatFullYear,
  dateFormatWithoutTimezone,
  dateTimeFormat,
  getCompleteDate,
  getCompleteWDate,
  getMonthNameFormat,
  getOnlyDate,
  getTwoWeeksLaterDate,
  getWeekRangeFormat,
  rteDateFormatFullMonth,
  rteDateMonthFormat,
  rteMonthNameFormat
};

