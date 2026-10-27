import { validDate } from './billing';
import type { BillingCycle } from '../types/subscription';

export interface SubscriptionInput { name: string; amount: string; cycle: string; anchorDate: string }
export type InputErrors = Partial<Record<keyof SubscriptionInput, string>>;

export function validateInput(input: SubscriptionInput) {
  const errors: InputErrors = {};
  const name = input.name.trim();
  if (!name || name.length > 50) errors.name = '서비스명을 1~50자로 입력해 주세요.';
  if (!/^\d+$/.test(input.amount) || !Number.isSafeInteger(Number(input.amount))) errors.amount = '0원 이상의 계산 가능한 정수를 입력해 주세요.';
  if (input.cycle !== 'MONTHLY' && input.cycle !== 'YEARLY') errors.cycle = '매월 또는 매년을 선택해 주세요.';
  if (!validDate(input.anchorDate)) errors.anchorDate = '실제 존재하는 날짜를 입력해 주세요.';
  const value = Object.keys(errors).length ? undefined : {
    name, amountKRW: Number(input.amount), cycle: input.cycle as BillingCycle, anchorDate: input.anchorDate,
  };
  return { errors, value };
}
