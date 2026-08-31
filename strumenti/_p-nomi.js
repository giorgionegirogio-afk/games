/* =====================================================================
   _p-nomi.js — DUE UOMINI NON SI CHIAMANO UGUALE, e adesso qualcuno lo
   misura (28 agosto 2026).

   PERCHE' ESISTE, e la ragione e' una bocciatura vera. Il gioco aveva
   gia' trovato e riparato questo difetto una volta — «QUINDICI COGNOMI
   NON BASTANO PER VENTIDUE UOMINI ... misurato, Cesare Tacco Fino e Vito
   Tacco Fino nella STESSA squadra», e l'elenco fu portato a trenta — ma
   la riparazione era affidata a un COMMENTO, non a un cancello. Quando
   _t-condizione.js ha aggiunto sei rincalzi di panchina che pescavano da
   un registro gia' esaurito, i doppioni sono tornati: misurato, 6 partite
   su 12 a 11 contro 11 con due uomini in campo dallo stesso cognome, e in
   quattro di quelle sei la coppia era NELLA STESSA SQUADRA.
   Nessun cancello di casa se n'e' accorto. _identita.js — quello che si
   citava a garanzia — misura distanza percettiva fra maglie e numeri
   ambigui: dei NOMI non sa niente (zero controlli, verificato con grep).
   Percio' 82/82, 15/15 e 7/7 passavano lo stesso. Il buco era fuori dalla
   portata dei cancelli, e un buco fuori portata e' un buco che torna.

   CHE COSA MISURA, e nient'altro. Per ognuna delle tre taglie apre una
   partita e raccoglie i nomi di TUTTI gli uomini che possono comparire nel
   tabellino: i 2N in campo piu' i rincalzi seduti in G.panchina (se il
   gioco ce l'ha). Poi pretende quattro cose:
     1. i COGNOMI sono tutti distinti — e' il controllo che conta, perche'
        e' il cognome che si legge nel tabellino dei marcatori e sul nastro
        del cambio, ed e' quello che fa scoprire parenti due squadre di
        quartiere diverse;
     2. i NOMI COMPLETI sono tutti distinti (piu' debole: due «Piedebuono»
        con nomi diversi passerebbero questo e non il primo — sta qui solo
        per dire quale delle due ferite si e' aperta);
     3. nessun nome e' vuoto;
     4. pescaNome non ha MAI dovuto ripiegare. Il gioco tiene il conto in
        G.__nomiEsauriti: quel contatore e' l'unico che sa dire «l'elenco
        e' finito» PRIMA che si veda un doppione, e vale anche il giorno
        in cui i doppioni li nasconde il caso. Se il gioco non lo espone
        (le versioni precedenti al 28 agosto 2026) lo si dichiara invece
        di contarlo zero.

   PERCHE' MISURA AL FISCHIO D'INIZIO E NON A PARTITA FINITA, ed e' una
   scelta da dimostrare, non da dichiarare. Un cambio non crea nomi: prende
   un nome dalla panchina e lo mette al posto di uno che esce, cioe' muove
   un elemento fra due insiemi che questo cancello ha gia' visto insieme.
   Se i 2N+6 di partenza sono distinti, ogni sottoinsieme che il gioco
   puo' avere in campo dopo tre sostituzioni per squadra e' distinto per
   costruzione. Aprire tre partite e leggere la formazione costa dieci
   secondi; giocarne trecento ne costerebbe cinquecento e direbbe la
   stessa cosa. Se un giorno la panchina si ripopolasse a partita in
   corso, questa riga smette di valere e il cancello va rifatto.

   PERCHE' NON GUARDA I NUMERI DI MAGLIA: quelli li sorveglia gia'
   _identita.js. Un cancello che ricontrolla cio' che un altro controlla
   raddoppia il tempo e non l'informazione.

   COME DIMOSTRA DI SAPER FALLIRE
     node strumenti/_p-nomi.js --guasto
   riscrive il cognome del secondo uomo della squadra 0 copiandolo dal
   primo, in pagina, dopo la formazione: i controlli 1 e 2 devono
   diventare rossi tutti e due. Se restano verdi, questo strumento non sta
   guardando i nomi e ogni suo verde e' una bugia.
   Misurato il 28 agosto 2026, e sono i quattro ancoraggi della scala:
     gioco spedito                      3 taglie su 3 verdi, 0 doppioni
                                        (10, 14 e 22 cognomi distinti)
     fuori/cond2.html (la toppa della
       condizione, riparata)            3 taglie su 3 verdi, 0 doppioni
                                        (16, 20 e 28 cognomi distinti)
     fuori/cond-rotto.html (la stessa
       toppa PRIMA della cura, e senza
       ancora il contatore)             11v11 ROSSO: 28 uomini, 26
                                        cognomi — 0:Peppe Nocchia contro
                                        1:Mimmo Nocchia, e 1:Rocco contro
                                        1:Vito Piedebuono NELLA STESSA
                                        SQUADRA
     fuori/cond2-sabotato.html (la
       panchina rimessa sul registro
       sbagliato, contatore acceso)     lo stesso rosso PIU' la campanella:
                                        pescaNome ha ripiegato 3 volte
     --guasto                           3 taglie su 3 rosse
   Un cancello senza il suo rosso dimostrato e' un timbro, non una misura.
   E notare la differenza fra le ultime due righe: i ripieghi sono TRE e i
   doppioni visibili DUE. Il contatore vede una ferita in piu' di quante
   se ne vedano a occhio, perche' un ripiego puo' ricadere su un cognome
   che nella partita non fa coppia con nessuno. E' il motivo per cui il
   controllo 4 esiste accanto al controllo 1 invece di essere un doppione.

   I CODICI DI USCITA DI CASA:
     0 verde · 1 il gioco e' rosso · 2 il banco e' esploso · 3 la prova
     e' nulla (il file indicato non esiste, o nessuna taglia e' partita).

   uso:
     node strumenti/_p-nomi.js
     node strumenti/_p-nomi.js --gioco fuori/cond2.html
     node strumenti/_p-nomi.js --guasto
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
function arg(n, d) {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
}
const haFlag = n => process.argv.indexOf('--' + n) > 0;

/* IL FILE IN MISURA: --gioco (o GIOCO_PROVA) punta il cancello su una
   copia fuori dal repo, come tutti gli altri della casa. */
const PROVA = (() => {
  const v = arg('gioco', process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();

const TIPI = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json',
};
function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      let f = path.join(RADICE, decodeURIComponent(req.url.split('?')[0]));
      if (PROVA && /CALCETTO-il-gioco\.html$/i.test(f)) f = PROVA;
      if ((!f.startsWith(RADICE) && f !== PROVA) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': TIPI[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il cognome e' tutto cio' che segue il primo spazio: e' la stessa regola
   di cognomeBreve() nel gioco, meno la potatura dell'articolo (qui
   «il Muro» e «Muro» devono restare due cose diverse, se no si
   inventerebbero doppioni che il giocatore non vede) */
const cognome = n => { const p = String(n || '').split(' '); return p.length > 1 ? p.slice(1).join(' ') : ''; };

const TAGLIE = [5, 7, 11];

(async function main() {
  const guasto = haFlag('guasto');
  const seme = +arg('seme', 20260803);

  const srv = await servi();
  let browser;
  try { browser = await chromium.launch(); }
  catch (e) { console.error('BANCO: il browser non parte: ' + e.message); srv.chiudi(); process.exit(2); }

  const esiti = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const errori = [];
    pag.on('pageerror', e => errori.push(String(e.message)));
    /* il caso seminato: la formazione non dipende dai dadi (rosaAvversaria
       e' uno xorshift sul NOME della squadra), ma il resto della pagina si',
       e un banco che non semina non e' ripetibile */
    await pag.addInitScript(s0 => {
      let s = s0 >>> 0 || 1;
      const pross = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s >>> 0; };
      Math.random = () => pross() / 4294967296;
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = pross(); return a; };
      }
    }, seme);

    await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
    await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
    /* niente disegno: qui interessano le stringhe, non i pixel */
    await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await pag.evaluate(() => {
      const t = window.__test;
      t.dismissSplash && t.dismissSplash();
      if (t.save) t.save.tutorialDone = 1;
    });

    for (const N of TAGLIE) {
      const r = await pag.evaluate(([N, guasto]) => {
        const t = window.__test;
        t.startMatch(1, 1, N !== 5 ? { size: N } : undefined);
        t.setCpuVsCpu && t.setCpuVsCpu(true);
        /* =================================================================
           IL GUASTO: un uomo copiato da un compagno, in campo, dopo la
           formazione. Se il cancello non diventa rosso qui, non guarda i
           nomi.

           SI COPIA IL NOME INTERO, NON SOLO IL COGNOME (rettifica del 28
           agosto 2026). Prima si copiava il cognome tenendo distinto il
           nome di battesimo: cosi' il controllo 1 (cognomi doppi)
           diventava rosso e il controllo 2 (nomi completi doppi) NON
           POTEVA accendersi, per costruzione. Il criterio dichiarato
           qui sopra — «i controlli 1 e 2 devono diventare rossi tutti e
           due» — non era raggiungibile, quindi meta' del cancello non
           aveva mai dimostrato il suo rosso: era un timbro, per la regola
           che questo stesso file scrive alla riga 78.
           Misurato: col vecchio guasto 12 controlli, 3 falliti (un solo
           controllo per taglia); col nome intero i falliti diventano 6,
           cioe' tutti e due i controlli su tutte e tre le taglie.
           ================================================================= */
        if (guasto && G.players.length > 2) {
          const a = G.players[1], b = G.players[2];
          b.nome = String(a.nome || '');
        }
        const campo = G.players.map(p => ({ nome: String(p.nome || ''), team: p.team, idx: p.idx, dove: 'campo' }));
        const banco = [];
        if (Array.isArray(G.panchina)) {
          for (let tt = 0; tt < G.panchina.length; tt++) {
            for (const r of (G.panchina[tt] || [])) banco.push({ nome: String(r && r.nome || ''), team: tt, idx: -1, dove: 'panchina' });
          }
        }
        return {
          taglia: t.taglia, scena: t.state,
          uomini: campo.concat(banco),
          panchinaEsiste: Array.isArray(G.panchina),
          esauriti: (typeof G.__nomiEsauriti === 'undefined') ? null : (G.__nomiEsauriti | 0),
        };
      }, [N, guasto]);
      esiti.push({ chiesta: N, ...r });
    }
    if (errori.length) console.log('  (eccezioni in pagina: ' + errori.slice(0, 3).join(' | ') + ')');
    await ctx.close();
  } catch (e) {
    console.error('BANCO: la misura e\' esplosa: ' + e.message);
    try { await browser.close(); } catch (x) {}
    srv.chiudi();
    process.exit(2);
  }
  await browser.close();
  srv.chiudi();

  if (!esiti.length) { console.error('PROVA NULLA: nessuna taglia e\' partita.'); process.exit(3); }

  /* ------------------------------------------------------------ referto */
  console.log(`\n=== NOMI — due uomini non si chiamano uguale, alle tre taglie (seme ${seme})` +
    (PROVA ? `\n    file: ${PROVA}` : '') +
    (guasto ? '\n    !!! GUASTO: un cognome copiato da un compagno (banco di prova dello strumento) !!!' : '') + ' ===\n');
  console.log('taglia  uomini  cognomi  COGNOMI DOPPI                         nomi doppi  vuoti  ripieghi');
  console.log('-'.repeat(104));

  let rossi = 0, controlli = 0, passati = 0;
  let esauritiVisti = false;
  /* G.__nomiEsauriti e' CUMULATIVO da quando la pagina e' aperta (il
     gioco non lo azzera a ogni fischio d'inizio, apposta). Le tre taglie
     girano nella stessa pagina, quindi la colonna riporta il DELTA di
     questa taglia: senza, un ripiego del 5 contro 5 si vedrebbe anche
     nelle due righe sotto e sembrerebbe tre difetti invece di uno. */
  let esauritiPrima = 0;
  for (const e of esiti) {
    if (e.esauriti !== null) { const tot = e.esauriti; e.esauriti = tot - esauritiPrima; esauritiPrima = tot; }
    const cogn = e.uomini.map(u => cognome(u.nome));
    const conta = {}; for (const c of cogn) conta[c] = (conta[c] || 0) + 1;
    const doppi = Object.keys(conta).filter(c => conta[c] > 1);
    const contaN = {}; for (const u of e.uomini) contaN[u.nome] = (contaN[u.nome] || 0) + 1;
    const doppiN = Object.keys(contaN).filter(n => contaN[n] > 1);
    const vuoti = e.uomini.filter(u => !u.nome.trim() || !cognome(u.nome)).length;

    /* quattro controlli per taglia, e ognuno conta */
    const esito = [
      ['cognomi distinti', doppi.length === 0],
      ['nomi completi distinti', doppiN.length === 0],
      ['nessun nome vuoto', vuoti === 0],
      ['pescaNome non ha ripiegato', e.esauriti === null ? true : e.esauriti === 0],
    ];
    for (const [, ok] of esito) { controlli++; if (ok) passati++; else rossi++; }
    if (e.esauriti !== null) esauritiVisti = true;

    const testoDoppi = doppi.length
      ? doppi.slice(0, 3).map(c => `${c}x${conta[c]}`).join(', ') + (doppi.length > 3 ? ` +${doppi.length - 3}` : '')
      : '—';
    console.log(
      String(e.taglia + 'v' + e.taglia).padEnd(8) +
      String(e.uomini.length).padStart(6) + '  ' +
      String(new Set(cogn).size).padStart(7) + '  ' +
      testoDoppi.padEnd(38) +
      String(doppiN.length).padStart(10) + '  ' +
      String(vuoti).padStart(5) + '  ' +
      (e.esauriti === null ? '  n.d.' : String(e.esauriti).padStart(6)));

    /* i doppioni si stampano PER NOME E PER POSTO: «tre cognomi doppi» non
       dice a nessuno se sono nella stessa squadra, che e' la ferita vera */
    for (const c of doppi) {
      const chi = e.uomini.filter(u => cognome(u.nome) === c);
      const stessaSquadra = chi.some((a, i) => chi.some((b, j) => j > i && a.team === b.team));
      console.log('        NO  ' + c + ': ' + chi.map(u => `${u.team}:${u.nome}${u.dove === 'panchina' ? ' (panchina)' : ''}`).join('  |  ') +
        (stessaSquadra ? '   <- NELLA STESSA SQUADRA' : ''));
    }
    if (e.esauriti) console.log('        NO  pescaNome ha ripiegato ' + e.esauriti + ' volte a questa taglia: l\'elenco dei nomi e\' finito, e il ripiego restituisce un nome gia\' assegnato');
    if (!e.panchinaEsiste) console.log('        (questo gioco non ha G.panchina: misurati i soli 2N in campo)');
  }

  console.log('\n' + '-'.repeat(104));
  if (!esauritiVisti) {
    console.log('  G.__nomiEsauriti NON esiste in questo gioco: il ripiego silenzioso di pescaNome');
    console.log('  non e\' strumentato, quindi il controllo 4 e\' dichiarato non misurato invece che verde.');
  }
  console.log(`  ${controlli} controlli, ${passati} passati, ${rossi} falliti`);
  if (rossi) {
    console.log('\n  ROSSO: due uomini si chiamano uguale. E\' la schermata di fine partita che lo mostra,');
    console.log('  ed e\' il dettaglio che disfa in un secondo l\'illusione di due squadre diverse.');
    process.exit(1);
  }
  console.log('\n  VERDE: alle tre taglie tutti i cognomi in campo e in panchina sono distinti.');
  process.exit(0);
})().catch(e => { console.error('BANCO: ' + e.stack); process.exit(2); });
