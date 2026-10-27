import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useKstToday } from './useKstToday';
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe('useKstToday', () => {
  it('updates at KST midnight and on foreground, and cleans up', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T14:59:59Z'));
    const remove = vi.spyOn(document, 'removeEventListener');
    const { result, unmount } = renderHook(() => useKstToday());
    expect(result.current).toBe('2026-10-27');
    act(() => { vi.advanceTimersByTime(1021); });
    expect(result.current).toBe('2026-10-28');
    act(() => { vi.setSystemTime(new Date('2026-10-29T16:00:00Z')); document.dispatchEvent(new Event('visibilitychange')); });
    expect(result.current).toBe('2026-10-30');
    unmount();
    expect(remove).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
