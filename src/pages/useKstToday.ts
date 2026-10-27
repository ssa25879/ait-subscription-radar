import { useEffect, useState } from 'react';
import { getToday } from '../domain/billing';

export function useKstToday() {
  const [today, setToday] = useState(getToday);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      setToday(getToday());
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const kstOffset = 9 * 60 * 60 * 1000;
      const next = Math.floor((now + kstOffset) / day + 1) * day - kstOffset;
      clearTimeout(timer);
      timer = setTimeout(schedule, next - now + 20);
    };
    const onVisibility = () => { if (document.visibilityState === 'visible') schedule(); };
    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);
  return today;
}
