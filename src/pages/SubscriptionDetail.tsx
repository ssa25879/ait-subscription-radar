import { useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { money } from '../domain/billing';
import { statusLabels, type Subscription, type SubscriptionStatus } from '../types/subscription';

interface Props {
  item: Subscription;
  saving: boolean;
  error: string;
  onEdit: () => void;
  onBack: () => void;
  onStatus: (status: SubscriptionStatus) => void;
  onDelete: () => void;
}
export function SubscriptionDetail({ item, saving, error, onEdit, onBack, onStatus, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <section className="intro detail">
    <div className="detail-card"><h1>{item.name}</h1>
    <p>{money(item.amountKRW)} · {item.cycle === 'MONTHLY' ? '매월' : '매년'}</p>
    <p>기준일 {item.anchorDate} · {statusLabels[item.status]}</p>
    </div><p className="detail-notice">앱에서 상태를 바꿔도 실제 구독은 해지되지 않아요. 구독사에서 별도로 해지해 주세요.</p>
    {error && <p role="alert">{error}</p>}
    <label className="detail-label" htmlFor="status">구독 상태</label>{' '}
    <select id="status" value={item.status} disabled={saving} onChange={e => onStatus(e.target.value as SubscriptionStatus)}>
      <option value="ACTIVE">활성</option><option value="PAUSED">일시정지</option><option value="CANCELED">해지</option>
    </select>
    <p className="detail-actions"><Button disabled={saving} onClick={onEdit}>수정</Button> <Button variant="weak" disabled={saving} onClick={onBack}>돌아가기</Button></p>
    {!confirmDelete ? <Button color="danger" variant="weak" disabled={saving} onClick={() => setConfirmDelete(true)}>삭제</Button> : <div role="group" aria-label="삭제 확인"><p>이 기록을 삭제할까요?</p><Button color="danger" disabled={saving} onClick={onDelete}>삭제 확인</Button> <Button variant="weak" disabled={saving} onClick={() => setConfirmDelete(false)}>삭제 취소</Button></div>}
  </section>;
}
