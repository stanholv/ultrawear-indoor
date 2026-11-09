// Keep-alive voor de Supabase database.
//
// Supabase pauzeert gratis projecten na ±7 dagen zonder database-activiteit.
// Tussen twee wedstrijden zit soms 2–3 weken, dus dat gebeurde regelmatig.
// Deze functie doet één kleine leesquery; een Vercel cron (zie vercel.json)
// roept hem dagelijks aan, en een GitHub Action (.github/workflows/keepalive.yml)
// doet dat als reserve. Geeft 503 terug als de database niet antwoordt, zodat
// de GitHub Action faalt en GitHub de repo-eigenaar een mail stuurt.

declare const process: { env: Record<string, string | undefined> };

export async function GET(request: Request): Promise<Response> {
  // Als CRON_SECRET in Vercel staat, stuurt Vercel Cron die automatisch mee.
  // De GitHub Action stuurt hem ook mee (secret met dezelfde naam). Zonder
  // CRON_SECRET is het endpoint open; dat is onschuldig (één leesquery).
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return Response.json({ ok: false, error: 'Supabase env vars ontbreken' }, { status: 500 });
  }

  const started = Date.now();
  try {
    const res = await fetch(`${url}/rest/v1/spelers?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20_000),
    });
    const ms = Date.now() - started;
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      console.error(`keepalive: Supabase gaf ${res.status} na ${ms}ms: ${body}`);
      return Response.json({ ok: false, status: res.status, ms, body }, { status: 503 });
    }
    return Response.json({ ok: true, ms, at: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`keepalive: Supabase onbereikbaar: ${message}`);
    return Response.json({ ok: false, error: message }, { status: 503 });
  }
}
