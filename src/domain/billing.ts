import type { BillingCycle, Subscription } from '../types/subscription';

export function getToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find(x => x.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function monthDays(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= monthDays(year, month);
}

function calendarDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(Math.min(day, monthDays(year, month))).padStart(2, '0')}`;
}

export function nextBillingDate(subscription: { anchorDate: string; cycle: BillingCycle }, today: string): string {
  const { anchorDate, cycle } = subscription;
  if (anchorDate >= today) return anchorDate;
  const [, anchorMonth, anchorDay] = anchorDate.split('-').map(Number);
  const [year, month] = today.split('-').map(Number);
  if (cycle === 'YEARLY') {
    const candidate = calendarDate(year, anchorMonth, anchorDay);
    return candidate >= today ? candidate : calendarDate(year + 1, anchorMonth, anchorDay);
  }
  const candidate = calendarDate(year, month, anchorDay);
  return candidate >= today ? candidate : calendarDate(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, anchorDay);
}

export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
}

export const isImminent = (days: number) => days >= 0 && days <= 7;
export const dayLabel = (days: number) => days === 0 ? 'D-day' : `D-${days}`;
export const money = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;

export function summarize(subscriptions: Subscription[]) {
  let monthly = 0;
  let annual = 0;
  let count = 0;
  for (const item of subscriptions) {
    if (item.status !== 'ACTIVE') continue;
    count++;
    if (item.cycle === 'MONTHLY') monthly += item.amountKRW;
    else annual += item.amountKRW;
    if (!Number.isSafeInteger(monthly) || !Number.isSafeInteger(annual)) throw new Error('금액 합계가 계산 가능한 범위를 넘었어요.');
  }
  const totalAnnual = monthly * 12 + annual;
  if (!Number.isSafeInteger(totalAnnual)) throw new Error('금액 합계가 계산 가능한 범위를 넘었어요.');
  return { monthly: Math.round(monthly + annual / 12), annual: totalAnnual, count };
}

export function upcoming(subscriptions: Subscription[], today: string) {
  return subscriptions.filter(x => x.status === 'ACTIVE').map(subscription => {
    const date = nextBillingDate(subscription, today);
    return { subscription, date, days: daysUntil(date, today) };
  }).sort((a, b) => a.date.localeCompare(b.date) || a.subscription.name.localeCompare(b.subscription.name, 'ko') || a.subscription.id.localeCompare(b.subscription.id));
}
