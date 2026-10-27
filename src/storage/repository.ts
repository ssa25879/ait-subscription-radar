import { Storage } from '@apps-in-toss/web-framework';
import { summarize, validDate } from '../domain/billing';
import { validateInput } from '../domain/subscription';
import type { Subscription, SubscriptionStore } from '../types/subscription';

export const STORAGE_KEY = 'subscription-radar:data:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)
    && validDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}

function parseSubscription(value: unknown): Subscription {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()
    || typeof value.name !== 'string' || typeof value.amountKRW !== 'number'
    || !Number.isSafeInteger(value.amountKRW) || value.amountKRW < 0
    || typeof value.cycle !== 'string' || typeof value.anchorDate !== 'string'
    || !['ACTIVE', 'PAUSED', 'CANCELED'].includes(String(value.status))
    || !validTimestamp(value.createdAt) || !validTimestamp(value.updatedAt)) {
    throw new Error('저장된 구독 형식이 올바르지 않아요.');
  }
  const parsed = validateInput({ name: value.name, amount: String(value.amountKRW), cycle: value.cycle, anchorDate: value.anchorDate });
  if (!parsed.value || parsed.value.name !== value.name) throw new Error('저장된 구독 값이 올바르지 않아요.');
  return {
    id: value.id, ...parsed.value, status: value.status as Subscription['status'],
    createdAt: value.createdAt, updatedAt: value.updatedAt,
  };
}

function parseStore(value: unknown): SubscriptionStore {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.subscriptions) || !validTimestamp(value.updatedAt)) {
    throw new Error('지원하지 않거나 손상된 저장 형식이에요.');
  }
  const subscriptions = value.subscriptions.map(parseSubscription);
  if (new Set(subscriptions.map(x => x.id)).size !== subscriptions.length) throw new Error('저장된 구독 ID가 중복되어 있어요.');
  summarize(subscriptions);
  return { schemaVersion: 1, subscriptions, updatedAt: value.updatedAt };
}

export async function loadSubscriptions(): Promise<Subscription[]> {
  const raw = await Storage.getItem(STORAGE_KEY);
  if (raw == null) return [];
  return parseStore(JSON.parse(raw)).subscriptions;
}

export async function saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
  const store = parseStore({ schemaVersion: 1, subscriptions, updatedAt: new Date().toISOString() });
  await Storage.setItem(STORAGE_KEY, JSON.stringify(store));
}
