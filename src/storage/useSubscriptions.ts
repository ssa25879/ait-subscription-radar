import { useCallback, useEffect, useRef, useState } from 'react';
import type { Subscription } from '../types/subscription';
import { loadSubscriptions, saveSubscriptions } from './repository';

type Phase = 'loading' | 'ready' | 'load-error' | 'saving';

export function useSubscriptions() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState('');
  const currentPhase = useRef<Phase>('loading');
  const loadGeneration = useRef(0);
  const mounted = useRef(false);

  const transition = (next: Phase) => {
    currentPhase.current = next;
    setPhase(next);
  };

  const reload = useCallback(async () => {
    if (currentPhase.current === 'saving') return;
    const generation = ++loadGeneration.current;
    transition('loading');
    setError('');
    try {
      const restored = await loadSubscriptions();
      if (!mounted.current || generation !== loadGeneration.current) return;
      setItems(restored);
      transition('ready');
    } catch {
      if (!mounted.current || generation !== loadGeneration.current) return;
      setError('기록을 불러오지 못했어요. 저장된 데이터는 그대로 보존했어요. 다시 시도해 주세요.');
      transition('load-error');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void reload();
    return () => { mounted.current = false; };
  }, [reload]);

  const commit = useCallback(async (candidate: Subscription[]): Promise<boolean> => {
    if (currentPhase.current !== 'ready') return false;
    transition('saving');
    setError('');
    try {
      await saveSubscriptions(candidate);
      if (!mounted.current) return false;
      setItems(candidate);
      transition('ready');
      return true;
    } catch {
      if (mounted.current) {
        setError('저장하지 못했어요. 다시 시도해 주세요.');
        transition('ready');
      }
      return false;
    }
  }, []);

  return { items, phase, error, reload, commit };
}
