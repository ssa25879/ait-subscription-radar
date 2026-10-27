import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionForm } from './SubscriptionForm';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import type { ReactNode } from 'react';
const wrapper = ({ children }: { children: ReactNode }) => <TDSMobileAITProvider brandPrimaryColor='#555555'>{children}</TDSMobileAITProvider>;

Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }) });
afterEach(cleanup);
describe('SubscriptionForm', () => {
  it('validates fields and retains the draft after a save failure', () => {
    const save = vi.fn();
    const { rerender } = render(<SubscriptionForm saving={false} onSave={save} onCancel={vi.fn()} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByLabelText('서비스명').getAttribute('aria-invalid')).toBe('true');
    expect(save).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('서비스명'), { target: { value: '  구독  ' } });
    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ name: '구독', amountKRW: 0, cycle: 'MONTHLY' }));
    rerender(<SubscriptionForm saving={false} error="저장하지 못했어요." onSave={save} onCancel={vi.fn()} />);
    expect((screen.getByLabelText('서비스명') as HTMLInputElement).value).toBe('  구독  ');
    expect(screen.getByText('저장하지 못했어요.')).toBeTruthy();
  });
  it('uses monthly and the current KST date and allows cancellation', () => {
    const cancel = vi.fn();
    render(<SubscriptionForm saving={false} onSave={vi.fn()} onCancel={cancel} />, { wrapper });
    expect((screen.getByLabelText('결제 주기') as HTMLSelectElement).value).toBe('MONTHLY');
    expect((screen.getByLabelText('결제 기준일') as HTMLInputElement).value).toBe(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(cancel).toHaveBeenCalledOnce();
  });
  it('locks inputs and navigation while saving', () => {
    const cancel = vi.fn();
    render(<SubscriptionForm saving onSave={vi.fn()} onCancel={cancel} />, { wrapper });
    expect((screen.getByRole('button', { name: '저장 중' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: '취소' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(cancel).not.toHaveBeenCalled();
  });
});
