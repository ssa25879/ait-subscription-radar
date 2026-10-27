import { act, fireEvent, render, screen, within, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import { Dashboard } from './Dashboard';
import type { Subscription } from '../types/subscription';
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }) });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const item = (id: string, name: string, status: Subscription['status'], amountKRW: number): Subscription => ({ id, name, status, amountKRW, cycle: 'MONTHLY', anchorDate: '2099-01-01', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' });
describe('Dashboard', () => {
  it('sorts ties and keeps active totals while filtering inactive records', () => {
    render(<TDSMobileAITProvider brandPrimaryColor="#555555"><Dashboard items={[item('2', '나', 'ACTIVE', 1000), item('1', '가', 'ACTIVE', 2000), item('3', '정지', 'PAUSED', 3000)]} onAdd={vi.fn()} onOpen={vi.fn()} /></TDSMobileAITProvider>);
    expect(screen.getByText(/월 환산 3,000원 · 연 환산 36,000원/)).toBeTruthy();
    const records = screen.getAllByRole('button').filter(button => button.classList.contains('record-button'));
    expect(records.map(button => button.textContent)).toEqual([expect.stringContaining('가'), expect.stringContaining('나'), expect.stringContaining('정지')]);
    fireEvent.click(screen.getByRole('button', { name: '일시정지' }));
    expect(screen.getByText(/월 환산 3,000원 · 연 환산 36,000원/)).toBeTruthy();
    const record = screen.getAllByRole('button').find(button => button.classList.contains('record-button'))!;
    expect(within(record).getByText(/계산 제외/)).toBeTruthy();
    expect(record.textContent).not.toContain('2099');
  });
  it('refreshes the displayed date while the screen remains open at KST midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-28T14:59:59Z'));
    const monthly = { ...item('1', '구독', 'ACTIVE', 1000), anchorDate: '2026-01-31' };
    render(<TDSMobileAITProvider brandPrimaryColor="#555555"><Dashboard items={[monthly]} onAdd={vi.fn()} onOpen={vi.fn()} /></TDSMobileAITProvider>);
    expect(screen.getByRole('button', { name: /구독.*D-day/ })).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1021); });
    expect(screen.getByRole('button', { name: /구독.*D-30/ })).toBeTruthy();
  });
  it('distinguishes an empty filter from a list with no active subscriptions', () => {
    render(<TDSMobileAITProvider brandPrimaryColor="#555555"><Dashboard items={[item('1', '정지 서비스', 'PAUSED', 3000)]} onAdd={vi.fn()} onOpen={vi.fn()} /></TDSMobileAITProvider>);
    expect(screen.getByText('활성 구독이 없어요.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '해지' }));
    expect(screen.getByText('선택한 상태의 구독이 없어요.')).toBeTruthy();
    expect(screen.queryByText(/등록한 구독이 없어요/)).toBeNull();
  });
});
