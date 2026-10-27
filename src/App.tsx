import { useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import { graniteEvent } from '@apps-in-toss/web-framework';
import { adGroupId, initializeAds } from './ads/initializeAds';
import { Dashboard } from './pages/Dashboard';
import { SubscriptionForm } from './pages/SubscriptionForm';
import { SubscriptionDetail } from './pages/SubscriptionDetail';
import { useSubscriptions } from './storage/useSubscriptions';
import type { validateInput } from './domain/subscription';
import type { Subscription, SubscriptionStatus } from './types/subscription';
import './App.css';

type Screen = { page: 'home' } | { page: 'detail'; id: string } | { page: 'form'; id?: string };
const home: Screen = { page: 'home' };
type FormValue = NonNullable<ReturnType<typeof validateInput>['value']>;

function App() {
  const { items, phase, error, reload, commit } = useSubscriptions();
  const [screen, setScreen] = useState<Screen>(home);
  const screenRef = useRef<Screen>(home);
  const saving = useRef(false);
  const newId = useRef<string | null>(null);
  saving.current = phase === 'saving';

  useEffect(() => { if (adGroupId) void initializeAds(); }, []);

  useEffect(() => {
    window.history.replaceState({ subscriptionRadar: home }, '');
    const onPop = (event: PopStateEvent) => {
      if (saving.current) {
        window.history.pushState({ subscriptionRadar: screenRef.current }, '');
        return;
      }
      const next: Screen = event.state?.subscriptionRadar ?? home;
      screenRef.current = next;
      setScreen(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (screen.page === 'home') return;
    return graniteEvent.addEventListener('backEvent', { onEvent: () => { if (!saving.current) window.history.back(); }, onError: () => {} });
  }, [screen.page]);

  const open = (next: Screen) => {
    if (saving.current) return;
    window.history.pushState({ subscriptionRadar: next }, '');
    screenRef.current = next;
    setScreen(next);
  };
  const back = () => { if (!saving.current) window.history.back(); };
  const current = screen.page === 'home' ? undefined : items.find(item => item.id === screen.id);
  const save = async (value: FormValue) => {
    if (saving.current || phase !== 'ready') return;
    const now = new Date().toISOString();
    let candidate: Subscription;
    if (screen.page === 'form' && screen.id) {
      if (!current) return;
      candidate = { ...current, ...value, updatedAt: now };
    } else {
      newId.current ??= crypto.randomUUID();
      candidate = { id: newId.current, ...value, status: 'ACTIVE', createdAt: now, updatedAt: now };
    }
    const next = current ? items.map(item => item.id === candidate.id ? candidate : item) : [...items, candidate];
    saving.current = true;
    const saved = await commit(next);
    saving.current = false;
    if (saved) { newId.current = null; back(); }
  };

  const changeStatus = async (status: SubscriptionStatus) => {
    if (!current || phase !== 'ready') return;
    await commit(items.map(item => item.id === current.id ? { ...item, status, updatedAt: new Date().toISOString() } : item));
  };
  const remove = async () => {
    if (!current || phase !== 'ready') return;
    if (await commit(items.filter(item => item.id !== current.id))) {
      screenRef.current = home;
      setScreen(home);
      window.history.replaceState({ subscriptionRadar: home }, '');
    }
  };

  return <main>
    {screen.page === 'home' && <>
      {phase === 'loading' && <section className="intro"><p>기록을 불러오는 중이에요.</p></section>}
      {phase === 'load-error' && <section className="intro"><p role="alert">{error}</p><Button onClick={() => void reload()}>다시 시도</Button></section>}
      {(phase === 'ready' || phase === 'saving') && <Dashboard items={items} onOpen={id => open({ page: 'detail', id })} onAdd={() => { newId.current = null; open({ page: 'form' }); }} />}
    </>}
    {screen.page === 'form' && <SubscriptionForm key={screen.id ?? 'new'} initial={current} saving={phase === 'saving'} error={error} onSave={value => void save(value)} onCancel={back} />}
    {screen.page === 'detail' && current && <SubscriptionDetail item={current} saving={phase === 'saving'} error={error} onEdit={() => open({ page: 'form', id: current.id })} onBack={back} onStatus={status => void changeStatus(status)} onDelete={() => void remove()} />}
  </main>;
}
export default App;
