import { useState } from 'react';
import './SubscriptionForm.css';
import { Button } from '@toss/tds-mobile';
import { getToday } from '../domain/billing';
import { validateInput, type InputErrors, type SubscriptionInput } from '../domain/subscription';
import type { Subscription } from '../types/subscription';

interface Props {
  initial?: Subscription;
  saving: boolean;
  error?: string;
  onSave: (value: NonNullable<ReturnType<typeof validateInput>['value']>) => void;
  onCancel: () => void;
}

export function SubscriptionForm({ initial, saving, error, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<SubscriptionInput>(() => ({
    name: initial?.name ?? '', amount: initial ? String(initial.amountKRW) : '',
    cycle: initial?.cycle ?? 'MONTHLY', anchorDate: initial?.anchorDate ?? getToday(),
  }));
  const [errors, setErrors] = useState<InputErrors>({});
  const change = (key: keyof SubscriptionInput, value: string) => setDraft(current => ({ ...current, [key]: value }));
  const fieldError = (key: keyof SubscriptionInput) => errors[key] && <p id={`${key}-error`} role="alert">{errors[key]}</p>;

  return <section className="subscription-form" aria-label={initial ? '구독 수정' : '구독 등록'}>
    <h1>{initial ? '구독 수정' : '구독 등록'}</h1>
    <form onSubmit={event => { event.preventDefault(); if (saving) return; const result = validateInput(draft); setErrors(result.errors); if (result.value) onSave(result.value); }} noValidate>
      <fieldset disabled={saving}>
        <label htmlFor="name">서비스명</label>
        <input id="name" value={draft.name} onChange={e => change('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
        {fieldError('name')}
        <label htmlFor="amount">금액 (원)</label>
        <input id="amount" inputMode="numeric" value={draft.amount} onChange={e => change('amount', e.target.value)} aria-invalid={!!errors.amount} aria-describedby={errors.amount ? 'amount-error' : undefined} />
        {fieldError('amount')}
        <label htmlFor="cycle">결제 주기</label>
        <select id="cycle" value={draft.cycle} onChange={e => change('cycle', e.target.value)} aria-invalid={!!errors.cycle} aria-describedby={errors.cycle ? 'cycle-error' : undefined}><option value="MONTHLY">매월</option><option value="YEARLY">매년</option></select>
        {fieldError('cycle')}
        <label htmlFor="anchorDate">결제 기준일</label>
        <input id="anchorDate" type="date" value={draft.anchorDate} onChange={e => change('anchorDate', e.target.value)} aria-invalid={!!errors.anchorDate} aria-describedby={errors.anchorDate ? 'anchorDate-error' : undefined} />
        {fieldError('anchorDate')}
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <Button type="submit" disabled={saving}>{saving ? '저장 중' : '저장'}</Button>
      <Button type="button" disabled={saving} onClick={onCancel}>취소</Button>
    </form>
  </section>;
}
