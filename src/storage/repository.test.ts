import { beforeEach, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor, cleanup } from '@testing-library/react';
import { Storage } from '@apps-in-toss/web-framework';
import { afterEach } from 'vitest';
import { loadSubscriptions, saveSubscriptions, STORAGE_KEY } from './repository';
import { useSubscriptions } from './useSubscriptions';
import type { Subscription } from '../types/subscription';

vi.mock('@apps-in-toss/web-framework', () => ({ Storage: { getItem: vi.fn(), setItem: vi.fn() } }));
const item: Subscription = { id: 'a', name: '구독', amountKRW: 100, cycle: 'MONTHLY', anchorDate: '2026-01-31', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
const store = (subscriptions = [item]) => JSON.stringify({ schemaVersion: 1, subscriptions, updatedAt: item.updatedAt });
beforeEach(() => { vi.resetAllMocks(); vi.mocked(Storage.getItem).mockResolvedValue(null); vi.mocked(Storage.setItem).mockResolvedValue(); });
afterEach(cleanup);

it('최초 빈 값과 정상 저장을 복원하고 파생값을 저장하지 않는다', async () => {
  expect(await loadSubscriptions()).toEqual([]);
  await saveSubscriptions([item]);
  expect(Storage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
  const raw = vi.mocked(Storage.setItem).mock.calls[0][1];
  expect(JSON.parse(raw).subscriptions).toEqual([item]);
  expect(raw).not.toContain('nextBillingDate');
  vi.mocked(Storage.getItem).mockResolvedValue(raw);
  expect(await loadSubscriptions()).toEqual([item]);
});

it.each(['{broken', '', '{"schemaVersion":2}', store([item, item]), store([{ ...item, amountKRW: -1 }]), store([{ ...item, anchorDate: '2026-02-30' }]), store([{ ...item, status: 'UNKNOWN' } as unknown as Subscription])])('손상 데이터는 쓰지 않는다: %s', async raw => {
  vi.mocked(Storage.getItem).mockResolvedValue(raw);
  await expect(loadSubscriptions()).rejects.toThrow();
  expect(Storage.setItem).not.toHaveBeenCalled();
});

it('읽기 실패 시 변경을 막고 재시도 후 복원한다', async () => {
  vi.mocked(Storage.getItem).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(store());
  const { result } = renderHook(useSubscriptions);
  await waitFor(() => expect(result.current.phase).toBe('load-error'));
  await act(async () => { expect(await result.current.commit([item])).toBe(false); });
  expect(Storage.setItem).not.toHaveBeenCalled();
  await act(async () => { await result.current.reload(); });
  expect(result.current.items).toEqual([item]);
});

it.each(['create', 'edit', 'delete', 'status'])('%s 저장 실패 시 확정 목록 유지 후 재시도', async kind => {
  vi.mocked(Storage.getItem).mockResolvedValue(store());
  const { result } = renderHook(useSubscriptions);
  await waitFor(() => expect(result.current.phase).toBe('ready'));
  const candidate = kind === 'delete' ? [] : kind === 'create' ? [item, { ...item, id: 'b' }] : [{ ...item, name: '수정', status: kind === 'status' ? 'PAUSED' as const : item.status }];
  vi.mocked(Storage.setItem).mockRejectedValueOnce(new Error('disk full'));
  await act(async () => { expect(await result.current.commit(candidate)).toBe(false); });
  expect(result.current.items).toEqual([item]);
  expect(result.current.error).toContain('저장하지 못했어요');
  await act(async () => { expect(await result.current.commit(candidate)).toBe(true); });
  expect(result.current.items).toEqual(candidate);
});

it('저장 중 중복 변경을 막고 성공 전 목록을 유지한다', async () => {
  let finish!: () => void;
  vi.mocked(Storage.setItem).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(useSubscriptions);
  await waitFor(() => expect(result.current.phase).toBe('ready'));
  let pending!: Promise<boolean>;
  act(() => { pending = result.current.commit([item]); });
  expect(result.current.items).toEqual([]);
  await act(async () => { expect(await result.current.commit([item])).toBe(false); });
  expect(Storage.setItem).toHaveBeenCalledTimes(1);
  await act(async () => { finish(); await pending; });
  expect(result.current.items).toEqual([item]);
});
