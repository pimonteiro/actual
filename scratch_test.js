const monthUtils = require('./packages/loot-core/src/shared/months');
const dateStr = '20260427';
const dateStr2 = '2026-04-27';
console.log('20260427:', monthUtils.monthFromDate(dateStr));
console.log('2026-04-27:', monthUtils.monthFromDate(dateStr2));
