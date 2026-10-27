import { useState } from 'react';
import { Button, Top } from '@toss/tds-mobile';
import { dayLabel, isImminent, money, summarize, upcoming } from '../domain/billing';
import { BannerAd } from '../ads/BannerAd';
import { useKstToday } from './useKstToday';
import { statusLabels, type Subscription, type SubscriptionStatus } from '../types/subscription';

type Filter = 'ALL' | SubscriptionStatus;
interface Props { items: Subscription[]; onAdd: () => void; onOpen: (id: string) => void }
export function Dashboard({ items, onAdd, onOpen }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const today = useKstToday();
  const summary = summarize(items);
  const scheduled = upcoming(items, today);
  const visibleActive = filter === 'ALL' || filter === 'ACTIVE' ? scheduled : [];
  const inactive = items.filter(item => item.status !== 'ACTIVE' && (filter === 'ALL' || item.status === filter));
  const filters: { value: Filter; label: string }[] = [{ value: 'ALL', label: '전체' }, { value: 'ACTIVE', label: '활성' }, { value: 'PAUSED', label: '일시정지' }, { value: 'CANCELED', label: '해지' }];
  return <>
    <Top title={<Top.TitleParagraph size={22}>구독레이더</Top.TitleParagraph>} subtitleBottom={<Top.SubtitleParagraph size={17}>구독 결제일과 예상 지출을 한눈에 관리</Top.SubtitleParagraph>} />
    <section className="intro">
      <h1>예상 구독료</h1>
      <p>월 환산 {money(summary.monthly)} · 연 환산 {money(summary.annual)}</p>
      <p>환산 금액은 실제 청구액이 아닌 평균 비교값이에요.</p>
      <p>활성 구독 {summary.count}개 · 가장 가까운 예상 결제 {scheduled.length ? `${scheduled[0].date} ${dayLabel(scheduled[0].days)}` : '없음'}</p>
      <div className="filters" aria-label="상태 필터">{filters.map(option => <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</button>)}</div>
      {items.length === 0 ? <p>등록한 구독이 없어요. 첫 구독을 추가해 보세요.</p> : <>
        {summary.count === 0 && <p>활성 구독이 없어요.</p>}
        {visibleActive.length > 0 && <><h2>예정 결제</h2>{visibleActive.map(({ subscription, date, days }) => <button key={subscription.id} className="record-button" onClick={() => onOpen(subscription.id)}><strong>{subscription.name}</strong><br />{money(subscription.amountKRW)} · {subscription.cycle === 'MONTHLY' ? '매월' : '매년'} · {date} · {dayLabel(days)}{isImminent(days) ? ' · 임박' : ''}</button>)}</>}
        {inactive.length > 0 && <><h2>보관 중인 구독</h2>{inactive.map(item => <button key={item.id} className="record-button" onClick={() => onOpen(item.id)}><strong>{item.name}</strong><br />{money(item.amountKRW)} · {statusLabels[item.status]} · 계산 제외</button>)}</>}
        {visibleActive.length === 0 && inactive.length === 0 && <p>선택한 상태의 구독이 없어요.</p>}
      </>}
      <p><Button onClick={onAdd}>{items.length ? '구독 추가' : '첫 구독 추가'}</Button></p>
      <p>기기에만 저장돼요. 기기 변경, 토스 앱 삭제 또는 저장소 초기화 시 기록이 사라질 수 있으며 자동 백업과 동기화는 제공하지 않아요.</p>
      <BannerAd />
    </section>
  </>;
}
