import { fireEvent, render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import App from '../App';
const sdk = vi.hoisted(() => ({ value: null as string | null, noFill: undefined as undefined | (() => void), destroy: vi.fn() }));
vi.mock('@apps-in-toss/web-framework', () => ({
  getTossAppVersion: () => '5.241.0',
  graniteEvent: { addEventListener: () => () => {} },
  Storage: { getItem: async () => sdk.value, setItem: async (_key: string, value: string) => { sdk.value = value; } },
  TossAds: {
    initialize: Object.assign((options: { callbacks: { onInitialized: () => void } }) => options.callbacks.onInitialized(), { isSupported: () => true }),
    attachBanner: Object.assign((_id: string, _target: HTMLElement, options: { callbacks: { onNoFill: () => void } }) => { sdk.noFill = options.callbacks.onNoFill; return { destroy: sdk.destroy }; }, { isSupported: () => true }),
  },
}));
Object.defineProperty(window, 'matchMedia', { value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn() }) });
afterEach(cleanup);
describe('ad failure isolation', () => {
  it('keeps subscription creation available after no fill', async () => {
    const { container } = render(<TDSMobileAITProvider brandPrimaryColor="#555555"><App /></TDSMobileAITProvider>);
    await screen.findByRole('button', { name: '첫 구독 추가' });
    await waitFor(() => expect(sdk.noFill).toBeTypeOf('function'));
    act(() => sdk.noFill!());
    expect(container.querySelector('.banner-ad')).toBeNull();
    expect(sdk.destroy).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: '첫 구독 추가' }));
    fireEvent.change(screen.getByLabelText('서비스명'), { target: { value: '광고 없는 구독' } });
    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    fireEvent.click(await screen.findByRole('button', { name: /광고 없는 구독/ }));
    fireEvent.click(screen.getByRole('button', { name: '수정' }));
    fireEvent.change(screen.getByLabelText('금액 (원)'), { target: { value: '2000' } });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText(/2,000원/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '삭제 확인' }));
    expect(await screen.findByText(/등록한 구독이 없어요/)).toBeTruthy();
  });
});
