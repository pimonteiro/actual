import * as monthUtils from './months';

test('range returns a full range', () => {
  expect(monthUtils.range('2016-10', '2018-01')).toMatchSnapshot();
});

test('monthFromDate with custom periods fallback logic', () => {
  monthUtils.setCustomBudgetsEnabled(true);
  monthUtils.setCustomPeriods([
    { month: '2026-05', start_date: '2026-04-27', end_date: '2026-05-28' },
  ]);

  try {
    // 1. Explicitly inside the custom period
    expect(monthUtils.monthFromDate('2026-04-27')).toBe('2026-05');
    expect(monthUtils.monthFromDate('2026-05-28')).toBe('2026-05');

    // 2. Outside May custom period, but June is missing (orphaned date)
    // Should fall back and get pushed to the next month (June)
    expect(monthUtils.monthFromDate('2026-05-29')).toBe('2026-06');
    expect(monthUtils.monthFromDate('2026-05-30')).toBe('2026-06');

    // 3. Before May custom period, but April is missing (orphaned date)
    // Should fall back and get pushed to the previous month (April)
    expect(monthUtils.monthFromDate('2026-04-26')).toBe('2026-04');

    // 4. Far outside custom period
    expect(monthUtils.monthFromDate('2026-03-15')).toBe('2026-03');
  } finally {
    monthUtils.setCustomPeriods([]);
    monthUtils.setCustomBudgetsEnabled(false);
  }
});
