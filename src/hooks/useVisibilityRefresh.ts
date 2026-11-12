import { useEffect, useRef } from 'react';

// ================================================
// VISIBILITY REFRESH HOOK
// ================================================
// Haalt data opnieuw op wanneer de app na inactiviteit weer actief wordt.
//
// Waarom: een geïnstalleerde PWA op het home-scherm wordt bij het heropenen
// niet herladen maar "hervat" (iOS/Android bevriezen de pagina). De data-hooks
// halen hun gegevens enkel op bij het eerste laden (useEffect met lege deps),
// dus zonder dit zou de data oud blijven tot een echte herlaad. We luisteren op
// visibilitychange (app weer zichtbaar), window-focus en terugkeer online.
//
// Een throttle voorkomt dubbele fetches wanneer meerdere events samen vuren of
// wanneer je heel even weg-en-terug schakelt. De eerste throttle-periode start
// bij mount, zodat de initiële fetch van de hook zelf niet meteen gedubbeld wordt.

export const useVisibilityRefresh = (refresh: () => void, throttleMs = 10_000) => {
  // Altijd de meest recente refresh-functie gebruiken zonder de listener te
  // herbinden (refresh is vaak een nieuwe closure per render).
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  // Tijdstip van de laatste trigger; start "nu" zodat events vlak na het openen
  // (de initiële load) niet voor een extra fetch zorgen.
  const laatst = useRef(Date.now());

  useEffect(() => {
    const trigger = () => {
      if (document.visibilityState !== 'visible') return;
      const nu = Date.now();
      if (nu - laatst.current < throttleMs) return;
      laatst.current = nu;
      refreshRef.current();
    };

    document.addEventListener('visibilitychange', trigger);
    window.addEventListener('focus', trigger);
    window.addEventListener('online', trigger);
    return () => {
      document.removeEventListener('visibilitychange', trigger);
      window.removeEventListener('focus', trigger);
      window.removeEventListener('online', trigger);
    };
  }, [throttleMs]);
};
