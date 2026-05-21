import * as monthUtils from './src/shared/months';

const dateStr = '20260427';
const dateStr2 = '2026-04-27';

monthUtils.setCustomPeriods([
  { month: '2026-05', start_date: '2026-04-27', end_date: '2026-05-28' },
  { month: '2026-06', start_date: '2026-05-29', end_date: '2026-06-27' },
]);

console.log('20260427:', monthUtils.monthFromDate(dateStr));
console.log('2026-04-27:', monthUtils.monthFromDate(dateStr2));
