import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import { BannerAd } from './BannerAd';
const mocks = vi.hoisted(() => ({ attach: vi.fn(), initialize: vi.fn(), destroy: vi.fn(), callbacks: undefined as undefined | { onNoFill: () => void; onAdFailedToRender: () => void } }));
vi.mock('./initializeAds', () => ({ adGroupId: 'ait-ad-test-banner-id', initializeAds: mocks.initialize }));
vi.mock('@apps-in-toss/web-framework', () => ({ TossAds: { attachBanner: mocks.attach } }));
beforeEach(() => { mocks.initialize.mockResolvedValue(true); mocks.attach.mockImplementation((_id, _target, options) => { mocks.callbacks = options.callbacks; return { destroy: mocks.destroy }; }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('BannerAd', () => {
  it('destroys the slot on unmount and ignores late callbacks', async () => {
    const { unmount } = render(<BannerAd />);
    await waitFor(() => expect(mocks.attach).toHaveBeenCalledOnce());
    unmount();
    expect(mocks.destroy).toHaveBeenCalledOnce();
    act(() => mocks.callbacks?.onNoFill());
    expect(mocks.destroy).toHaveBeenCalledOnce();
  });
  it('cleans up and removes the slot on no fill', async () => {
    const { container } = render(<BannerAd />);
    await waitFor(() => expect(mocks.attach).toHaveBeenCalledOnce());
    act(() => mocks.callbacks?.onNoFill());
    expect(mocks.destroy).toHaveBeenCalledOnce();
    expect(container.firstChild).toBeNull();
  });
  it('never attaches when initialization fails', async () => {
    mocks.initialize.mockResolvedValue(false);
    const { container } = render(<BannerAd />);
    await waitFor(() => expect(container.firstChild).toBeNull());
    expect(mocks.attach).not.toHaveBeenCalled();
  });
  it('does not attach after leaving before initialization completes, including StrictMode remount', async () => {
    let resolve!: (ready: boolean) => void;
    mocks.initialize.mockReturnValue(new Promise<boolean>(done => { resolve = done; }));
    const { unmount } = render(<StrictMode><BannerAd /></StrictMode>);
    unmount();
    await act(async () => { resolve(true); });
    expect(mocks.attach).not.toHaveBeenCalled();
  });
  it('removes the slot on render failure', async () => {
    const { container } = render(<BannerAd />);
    await waitFor(() => expect(mocks.attach).toHaveBeenCalledOnce());
    act(() => mocks.callbacks?.onAdFailedToRender());
    expect(mocks.destroy).toHaveBeenCalledOnce();
    expect(container.firstChild).toBeNull();
  });
});
