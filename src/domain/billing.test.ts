import { describe, expect, it } from 'vitest';
import { daysUntil, getToday, isImminent, nextBillingDate, summarize, upcoming } from './billing';
import { validateInput } from './subscription';
import type { Subscription } from '../types/subscription';

const record = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 'a', name: '구독', amountKRW: 9900, cycle: 'MONTHLY', anchorDate: '2026-01-31',
  status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...overrides,
});

describe('예상 결제일', () => {
  it.each([
    ['2026-01-31', 'MONTHLY', '2026-02-01', '2026-02-28'],
    ['2024-01-31', 'MONTHLY', '2024-02-01', '2024-02-29'],
    ['2026-01-31', 'MONTHLY', '2026-03-01', '2026-03-31'],
    ['2026-01-30', 'MONTHLY', '2026-02-01', '2026-02-28'],
    ['2026-01-30', 'MONTHLY', '2026-03-01', '2026-03-30'],
    ['2024-02-29', 'YEARLY', '2025-01-01', '2025-02-28'],
    ['2024-02-29', 'YEARLY', '2028-01-01', '2028-02-29'],
    ['2026-01-31', 'MONTHLY', '2026-02-28', '2026-02-28'],
    ['2026-12-15', 'MONTHLY', '2026-10-27', '2026-12-15'],
    ['2027-12-15', 'YEARLY', '2026-10-27', '2027-12-15'],
  ] as const)('%s %s / %s → %s', (anchorDate, cycle, today, expected) => {
    expect(nextBillingDate({ anchorDate, cycle }, today)).toBe(expected);
  });
  it('KST 날짜·D-day·임박 경계를 사용한다', () => {
    expect(getToday(new Date('2026-10-27T15:01:00Z'))).toBe('2026-10-28');
    expect(getToday(new Date('2026-10-27T14:59:00Z'))).toBe('2026-10-27');
    expect(daysUntil('2026-03-31', '2026-03-01')).toBe(30);
    expect(daysUntil('2026-02-28', '2026-02-28')).toBe(0);
    expect([0, 7, 8, -1].map(isImminent)).toEqual([true, true, false, false]);
  });
});

describe('집계와 정렬', () => {
  const annual = record({ id: 'b', amountKRW: 120000, cycle: 'YEARLY' });
  it('활성만 환산한다', () => {
    expect(summarize([record(), annual])).toEqual({ monthly: 19900, annual: 238800, count: 2 });
    expect(summarize([record(), { ...annual, status: 'PAUSED' }])).toEqual({ monthly: 9900, annual: 118800, count: 1 });
    expect(summarize([record({ status: 'CANCELED' })])).toEqual({ monthly: 0, annual: 0, count: 0 });
  });
  it('합산 후 한 번 반올림한다', () => {
    expect(summarize([record({ cycle: 'YEARLY', amountKRW: 5 }), record({ id: 'b', cycle: 'YEARLY', amountKRW: 5 })]).monthly).toBe(1);
  });
  it('날짜·한국어 이름 순으로 정렬하며 비활성은 제외한다', () => {
    expect(upcoming([record({ name: '나' }), record({ id: 'b', name: '가' }), record({ id: 'c', status: 'PAUSED' })], '2026-02-01').map(x => x.subscription.name)).toEqual(['가', '나']);
  });
});

describe('입력 검증', () => {
  const input = { name: ' 구독 ', amount: '0', cycle: 'MONTHLY', anchorDate: '2026-10-27' };
  it('trim·0원과 이름 경계를 허용한다', () => {
    expect(validateInput(input).value?.name).toBe('구독');
    expect(validateInput({ ...input, name: '가'.repeat(50) }).value).toBeDefined();
  });
  it.each(['', ' ', '가'.repeat(51)])('잘못된 이름 %s', name => {
    expect(validateInput({ ...input, name }).errors.name).toBeTruthy();
  });
  it.each(['', '-1', '1.2', '1e3', 'abc', '9007199254740992'])('잘못된 금액 %s', amount => {
    expect(validateInput({ ...input, amount }).errors.amount).toBeTruthy();
  });
  it.each(['2026-02-29', '2026-13-01', '2026-02-30', '2026-1-01'])('잘못된 날짜 %s', anchorDate => {
    expect(validateInput({ ...input, anchorDate }).errors.anchorDate).toBeTruthy();
  });
  it('존재하는 윤일과 안전 정수는 허용한다', () => {
    expect(validateInput({ ...input, amount: String(Number.MAX_SAFE_INTEGER), anchorDate: '2024-02-29', cycle: 'YEARLY' }).value).toBeDefined();
  });
  it('안전 범위를 넘는 집계를 거부한다', () => {
    expect(() => summarize([record({ amountKRW: Number.MAX_SAFE_INTEGER })])).toThrow();
  });
});
