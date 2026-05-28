import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Select } from '@actual-app/components/select';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { send, sendCatch } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';

import { DateSelect } from '#components/select/DateSelect';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { Setting } from './UI';

export function CustomBudgetPeriodsSettings() {
  const { t } = useTranslation();
  const [periods, setPeriods] = useState<
    { month: string; start_date: string; end_date: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [dateFormat = 'MM/dd/yyyy'] = useSyncedPref('dateFormat');
  const [bounds, setBounds] = useState({ start: '', end: '' });

  const [newMonth, setNewMonth] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const load = async () => {
    const [periodsRes, boundsRes] = await Promise.all([
      send('budget/get-custom-periods'),
      send('get-budget-bounds'),
    ]);
    setPeriods(periodsRes.sort((a, b) => b.month.localeCompare(a.month)));
    setBounds(boundsRes);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    setErrorMsg('');
    if (newMonth) {
      const existing = periods.find(p => p.month === newMonth);
      if (existing) {
        setNewStart(existing.start_date);
        setNewEnd(existing.end_date);
      } else {
        const prevMonth = monthUtils.prevMonth(newMonth);
        const prevPeriod = periods.find(p => p.month === prevMonth);
        if (prevPeriod) {
          const nextDay = monthUtils.addDays(prevPeriod.end_date, 1);
          setNewStart(nextDay);
          setNewEnd(monthUtils.lastDayOfMonth(newMonth));
        } else {
          setNewStart(monthUtils.firstDayOfMonth(newMonth));
          setNewEnd(monthUtils.lastDayOfMonth(newMonth));
        }
      }
    } else {
      setNewStart('');
      setNewEnd('');
    }
  }, [newMonth, periods]);

  const monthOptions = useMemo(() => {
    if (!bounds.start || !bounds.end) return [];
    const range = monthUtils.rangeInclusive(bounds.start, bounds.end);
    return range.map(m => [m, monthUtils.format(m, 'MMMM yyyy')] as const);
  }, [bounds]);

  async function onSave() {
    if (!newMonth || !newStart || !newEnd) return;
    if (newStart > newEnd) {
      setErrorMsg(t('Start date cannot be after end date'));
      return;
    }

    setErrorMsg('');
    const res = await sendCatch('budget/set-custom-period', {
      month: newMonth,
      start_date: newStart,
      end_date: newEnd,
    });

    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }

    await load();
    setNewMonth('');
    setNewStart('');
    setNewEnd('');
  }

  async function onDelete(month: string) {
    if (
      window.confirm(t('Are you sure you want to delete this custom period?'))
    ) {
      await send('budget/delete-custom-period', { month });
      await load();
    }
  }

  if (loading) return null;

  return (
    <Setting>
      <View style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>
        <Trans>Custom budget periods</Trans>
      </View>
      <View style={{ gap: 10, maxWidth: '100%', width: '100%' }}>
        <Text>
          <Trans>
            Define custom start and end dates for your budget months. This is
            useful for paycheck-to-paycheck budgeting.
          </Trans>
        </Text>

        {periods.length > 0 && (
          <View
            style={{
              marginTop: 10,
              border: `1px solid ${theme.tableBorder}`,
              borderRadius: 6,
              overflow: 'hidden',
              width: '100%',
              maxWidth: 600,
            }}
          >
            {periods.map((p, index) => (
              <View
                key={p.month}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom:
                    index < periods.length - 1
                      ? `1px solid ${theme.tableBorder}`
                      : undefined,
                  backgroundColor: theme.tableBackground,
                  gap: 15,
                  flexWrap: 'wrap',
                }}
              >
                <View style={{ flex: '1 1 200px', minWidth: 0, gap: 4 }}>
                  <Text
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: theme.pageText,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {monthUtils.format(p.month, 'MMMM yyyy')}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.pageTextSubdued,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {monthUtils.format(p.start_date, dateFormat)} –{' '}
                    {monthUtils.format(p.end_date, dateFormat)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 5, flexShrink: 0 }}>
                  <Button
                    onPress={() => {
                      setNewMonth(p.month);
                      setNewStart(p.start_date);
                      setNewEnd(p.end_date);
                    }}
                    variant="bare"
                    style={{ color: theme.noticeTextMenu, padding: '4px 8px' }}
                  >
                    <Trans>Edit</Trans>
                  </Button>
                  <Button
                    onPress={() => onDelete(p.month)}
                    variant="bare"
                    style={{ color: theme.errorText, padding: '4px 8px' }}
                  >
                    <Trans>Delete</Trans>
                  </Button>
                </View>
              </View>
            ))}
          </View>
        )}

        <View
          style={{
            marginTop: 20,
            gap: 15,
            padding: 15,
            backgroundColor: theme.tableBackground,
            borderRadius: 4,
            border: `2px dashed ${theme.tableBorder}`,
            maxWidth: 600,
            width: '100%',
          }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            <Trans>Add or Override Period</Trans>
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 15,
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <View style={{ flex: '1 1 150px', minWidth: 150 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 5,
                  color: theme.pageTextSubdued,
                }}
              >
                {t('Budget Month')}
              </Text>
              <Select
                options={monthOptions}
                value={newMonth}
                onChange={setNewMonth}
                defaultLabel={t('Select month...')}
              />
            </View>
            <View style={{ flex: '1 1 150px', minWidth: 150 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 5,
                  color: theme.pageTextSubdued,
                }}
              >
                {t('Start Date')}
              </Text>
              <DateSelect
                key={`start-${newStart || 'empty'}`}
                value={newStart}
                dateFormat={dateFormat}
                onSelect={setNewStart}
              />
            </View>
            <View style={{ flex: '1 1 150px', minWidth: 150 }}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 5,
                  color: theme.pageTextSubdued,
                }}
              >
                {t('End Date')}
              </Text>
              <DateSelect
                key={`end-${newEnd || 'empty'}`}
                value={newEnd}
                dateFormat={dateFormat}
                onSelect={setNewEnd}
              />
            </View>
          </View>
          {errorMsg && (
            <Text
              style={{ color: theme.errorText, fontSize: 13, marginTop: 5 }}
            >
              {errorMsg}
            </Text>
          )}
          <Button
            onPress={onSave}
            variant="primary"
            isDisabled={!newMonth || !newStart || !newEnd}
            style={{
              alignSelf: 'flex-start',
              marginTop: 10,
              padding: '5px 20px',
            }}
          >
            {t('Save Period Override')}
          </Button>
        </View>
      </View>
    </Setting>
  );
}
