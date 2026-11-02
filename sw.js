/* =====================================================================
   SERVICE WORKER — i due giochi girano offline, sempre.
   La partita non ha bisogno di rete (nessun font remoto, nessuna immagine
   esterna): una volta scaricato, il telefono non ha piu' bisogno di
   connessione. L'unica eccezione e' la SFIDA in rete di CALCETTO, che chiama
   un server a parte: e' un'altra origine, e questo service worker la lascia
   passare (vedi sotto, il controllo su url.origin).
   Strategia: le PAGINE si servono dalla cache ma si ricontrollano in
   sottofondo, cosi' un aggiornamento pubblicato arriva da solo alla
   riapertura successiva; icone e manifest, che non cambiano, vengono
   sempre dalla cache. Cambiare VERSIONE butta via tutto e riparte pulito.
   ===================================================================== */
/* v3 (2 novembre 2026, voce #159): il gioco e' cambiato molto dalla v2 (figure
   fotografiche, divisioni, rigori...). L'avviso «C'e' una versione nuova» della
   pagina scatta solo se cambiano i byte di questo file: portare avanti questo
   numero e' il modo di farlo comparire, e butta via la cache vecchia. */
const VERSIONE = 'circolo-calcetto-v3';

/* i percorsi sono relativi alla radice in cui vive il service worker,
   cosi' funziona sia in una sottocartella di GitHub Pages sia altrove */
const DA_CONSERVARE = [
  './',
  './index.html',
  './CALCETTO-il-gioco.html',
  './CIRCOLO-il-gioco.html',
  './app/calcetto.webmanifest',
  './app/circolo.webmanifest',
  './app/icona-calcetto-192.png',
  './app/icona-calcetto-512.png',
  './app/icona-calcetto-mask.png',
  './app/icona-circolo-192.png',
  './app/icona-circolo-512.png',
  './app/icona-circolo-mask.png',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSIONE);
    /* uno alla volta e senza fallire tutto se un file manca: un 404 su
       un'icona non deve impedire al gioco di funzionare offline */
    await Promise.all(DA_CONSERVARE.map(u =>
      c.add(new Request(u, { cache: 'reload' })).catch(() => {})
    ));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSIONE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* gli APK sono scaricamenti, non pezzi dell'app: si lasciano al browser,
     altrimenti finirebbero in cache circa 4,5 MB (177 kB + 4,3 MB) che non
     servono mai offline */
  if (url.pathname.endsWith('.apk')) return;

  /* Le PAGINE (i giochi e il lanciatore) usano "servi dalla cache, ma nel
     frattempo controlla": si apre istantaneamente e anche offline, e se nel
     frattempo e' stata pubblicata una versione nuova la si trova gia' pronta
     alla riapertura successiva. Senza questo bisognerebbe cambiare a mano il
     numero di VERSIONE a ogni modifica, e ci si dimentica sempre. */
  const eUnaPagina = req.mode === 'navigate' ||
                     (req.headers.get('accept') || '').includes('text/html');

  e.respondWith((async () => {
    const cache = await caches.open(VERSIONE);
    const salvato = await caches.match(req, { ignoreSearch: true });

    const daRete = fetch(req).then(rete => {
      if (rete && rete.status === 200 && rete.type === 'basic') cache.put(req, rete.clone());
      return rete;
    }).catch(() => null);

    if (eUnaPagina) {
      if (salvato) { daRete; return salvato; }        // aggiorna in sottofondo
      const rete = await daRete;
      if (rete) return rete;
      const casa = await caches.match('./index.html');
      if (casa) return casa;
      throw new Error('offline e non in cache');
    }

    /* tutto il resto (icone, manifest) e' immutabile: la cache comanda */
    if (salvato) return salvato;
    const rete = await daRete;
    if (rete) return rete;
    throw new Error('offline e non in cache');
  })());
});

/* la pagina puo' chiedere l'aggiornamento immediato dopo un rilascio */
self.addEventListener('message', e => {
  if (e.data === 'aggiorna') self.skipWaiting();
});
