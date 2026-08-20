/* =====================================================================
   SALVATAGGIO — il cancello della cosa che l'utente non perdona.

   PERCHE' ESISTE. Un gioco per telefono che perde i progressi viene
   disinstallato e non torna piu'. In CALCETTO il salvataggio e' un solo
   oggetto (SAVE) scritto in una sola chiave di localStorage
   (calcetto_save_v4) con venticinque rami di validazione e una migrazione
   da v3/v2: fino a oggi NESSUNO strumento della casa lo nominava. Se ogni
   scrittura sparisse, la batteria uscirebbe verde.

   COSA MISURA, e sempre sui VALORI VERI (window.__test.save, che espone
   l'oggetto SAVE del gioco) — mai sulla semplice presenza della chiave:

     1-3  IL GIRO COMPLETO: si gioca una partita, si vince, si guadagnano
          monete e statistiche, si RICARICA la pagina, e monete, carriera e
          rosa devono essere ancora li'. E' l'unica prova che conta per
          davvero: tutto il resto sono i modi in cui puo' rompersi.
     4-5  SALVATAGGIO CORROTTO: nella chiave si mette testo spazzatura, e
          poi un JSON valido di tipi ostili (monete di testo, rosa di
          numeri). Il gioco deve RIPARTIRE PULITO, non morire.
     6-7  VERSIONE PRECEDENTE: un salvataggio v3 e uno v2 devono essere
          letti senza perdere niente — campo per campo, non a occhio.
     8-9  localStorage ASSENTE (in una WebView con i dati del sito bloccati
          l'accesso stesso alla proprieta' puo' lanciare) e localStorage
          PIENO (quota esaurita): il gioco deve continuare a funzionare
          senza salvare, non bloccarsi.
     10   AZZERAMENTO: dopo AZZERA TUTTI I DATI nessuna chiave di versione
          vecchia deve poter resuscitare la partita cancellata al riavvio.
          (Se doResetSave dimenticasse la v3, l'utente che azzera si
          ritroverebbe tutto com'era: il difetto piu' beffardo di tutti.)
     11   NASCONDIMENTO: su Android un'app in sottofondo puo' essere uccisa
          in qualunque momento; una modifica ancora in memoria e non scritta
          si perde. Si misura con una sentinella: si cambia SAVE, si
          nasconde l'app, si guarda il disco.

   CIO' CHE QUESTO CANCELLO NON MISURA, e va detto invece di lasciarlo
   credere: il backup automatico di Android (allowBackup="true" nel
   manifest, senza regole). Quello si prova solo col telefono — vedi
   _t-salvataggio-telefono.js — e qui non entra.

   CODICI DI USCITA (quelli di casa):
     0  verde        1  il gioco e' rosso
     2  il banco e' esploso            3  la prova e' nulla

   IL CASO 11 E' UN DIFETTO NOTO E APERTO: oggi il gioco non forza il
   salvataggio quando l'app viene nascosta (misurato, non supposto). La
   toppa esiste ed e' in attesa (_toppa-salvataggio.js). Finche' non e'
   applicata quel caso si stampa APERTO e NON fa rosso il totale, perche'
   un rosso perpetuo insegna a non guardare i rossi. Appena il gioco lo
   supera, il cancello lo dice e da quel momento pretende il verde: e' un
   cricchetto, non uno sconto — chi lo rompe di nuovo diventa rosso.
   Con --severo il caso conta subito.

   RIPETIBILITA', misurata e non promessa: cinque corse di fila sullo stesso
   file il 20 agosto 2026 hanno dato verdetti IDENTICI (10 passati, 1
   aperto). L'unico numero che oscilla e' la dimensione del salvataggio
   scritto — fra 1105 e 1127 byte, perche' dipende dalla partita simulata —
   e non e' una soglia di niente: nessun caso lo confronta con un valore
   fisso. Non ci sono cronometri qui dentro, quindi un banco occupato non
   puo' far bocciare l'innocente; e se una scheda non arriva a partire
   senza lanciare nemmeno un'eccezione, si esce 2 (banco) invece di
   accusare il gioco.

   VISTO FALLIRE: strumenti/_t-salvataggio.js rompe il salvataggio in cinque
   modi diversi su copie fuori dal repo e pretende che questo cancello
   diventi rosso ogni volta, e sul caso giusto; poi applica la toppa e
   pretende il contrario. Sette controlli, sette passati (20 agosto 2026).

   uso:
     node strumenti/salvataggio.js
     node strumenti/salvataggio.js --gioco /percorso/copia.html
     node strumenti/salvataggio.js --severo
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RADICE = path.resolve(__dirname, '..');
const SEVERO = process.argv.includes('--severo');

/* IL FILE IN MISURA puo' arrivare da fuori: e' cosi' che si prova una
   toppa e — soprattutto — che si vede questo cancello ROSSO, rompendo il
   salvataggio in una copia che sta fuori dal repo. Senza --gioco non
   cambia un byte: si misura il file del repo. */
const GIOCO_FUORI = (() => {
  const i = process.argv.indexOf('--gioco');
  const v = i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1] : (process.env.GIOCO_PROVA || '');
  if (!v) return '';
  const a = path.resolve(v);
  if (!fs.existsSync(a)) { console.error('PROVA NULLA: il gioco indicato non esiste: ' + a); process.exit(3); }
  return a;
})();
const ridirigi = f => (GIOCO_FUORI && /CALCETTO-il-gioco\.html$/i.test(f)) ? GIOCO_FUORI : f;

function servi() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const f = ridirigi(path.join(RADICE, decodeURIComponent(req.url.split('?')[0])));
      if ((!f.startsWith(RADICE) && f !== GIOCO_FUORI) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      /* no-store: il cache-busting e' obbligatorio, o si misura il file di
         ieri credendo di misurare quello di adesso */
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => ok({ porta: s.address().port, chiudi: () => s.close() }));
  });
}

/* il registro degli esiti: ogni caso porta il suo nome, il suo verdetto e
   il numero che lo giustifica — mai un OK senza la misura accanto */
const CASI = [];
function segna(n, nome, ok, dettaglio, aperto) {
  CASI.push({ n, nome, ok: !!ok, dettaglio, aperto: !!aperto });
  const tag = ok ? '  OK   ' : (aperto ? '  APERTO ' : '  NO   ');
  console.log(tag + String(n).padStart(2) + '. ' + nome + '\n         ' + dettaglio);
}

/* un salvataggio v3 verosimile: TUTTI i campi che lo schema conosce, con
   valori riconoscibili uno per uno. La prova della migrazione non e' «si
   apre», e' «non ho perso niente», e per dirlo bisogna avere messo dentro
   qualcosa di distinguibile in ogni casella. Il nome squadra e' di 12
   caratteri perche' 12 e' il limite del campo del gioco (maxlength=12):
   metterne 14 accuserebbe il gioco di un taglio che e' invece la regola. */
const VECCHIO = {
  v: 3, mute: true, vib: false, diff: 2, touch: 1, moto: 0, dalt: 1, durata: 120,
  taglia: 7, moviola: 0, coins: 777,
  fields: [1, 1, 1, 0, 0, 0, 0, 0], fieldSel: 2, kit: 0, teamName: 'VECCHIA GUAR',
  shop: { completo: 0, campi: 0, divise: 0, curva: 1, sponsor: 0 },
  shopA: { completo: 0, campi: 0, divise: 0, curva: 1, sponsor: 0 },
  sponsorNomi: ['BAR SPORT'], tutorialDone: true,
  ach: { ricco: true },
  stats: { partite: 31, vittorie: 17, golF: 59, golS: 40, perfetti: 3, rubate: 12, tornei: 1, stagioni: 0 },
  albo: [{ data: '2026-01-01', campo: 'Oratorio', nome: 'TORNEO DI SAN GIOVANNI' }],
  tour: null, season: null,
  rosa: [
    { nome: 'GINO ROSSI', vel: 60, tiro: 70, tecnica: 65, tackle: 55, partite: 31, gol: 9 },
    { nome: 'PINO BIANCHI', vel: 61, tiro: 71, tecnica: 66, tackle: 56, partite: 31, gol: 4 },
    { nome: 'TINO VERDI', vel: 62, tiro: 72, tecnica: 67, tackle: 57, partite: 31, gol: 2 },
    { nome: 'NINO NERI', vel: 63, tiro: 73, tecnica: 68, tackle: 58, partite: 30, gol: 0 }],
  lastRes: [3, 1],
};
/* cosa DEVE ritrovarsi dopo la migrazione, campo per campo. La rosa a
   quattro diventa di cinque per progetto (il quinto uomo si appende), ma i
   quattro di prima non si toccano: nomi, attributi, partite e gol. */
function perditeMigrazione(s, v) {
  const perse = [];
  const uguale = (nome, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) perse.push(nome + ': ' + JSON.stringify(a) + ' invece di ' + JSON.stringify(b)); };
  uguale('monete', s.coins, v.coins);
  uguale('nome squadra', s.teamName, v.teamName);
  uguale('campi sbloccati', s.fields, v.fields);
  uguale('campo scelto', s.fieldSel, v.fieldSel);
  uguale('statistiche', s.stats, v.stats);
  uguale('albo', s.albo, v.albo);
  uguale('trofei', s.ach, v.ach);
  uguale('negozio', s.shop, v.shop);
  uguale('negozio attivo', s.shopA, v.shopA);
  uguale('cartelloni', s.sponsorNomi, v.sponsorNomi);
  uguale('taglia', s.taglia, v.taglia);
  uguale('durata', s.durata, v.durata);
  uguale('difficolta', s.diff, v.diff);
  uguale('audio muto', s.mute, v.mute);
  uguale('vibrazione', s.vib, v.vib);
  uguale('movimento ridotto', s.moto, v.moto);
  uguale('alto contrasto', s.dalt, v.dalt);
  uguale('moviola', s.moviola, v.moviola);
  uguale('tutorial fatto', s.tutorialDone, v.tutorialDone);
  uguale('ultimo risultato', s.lastRes, v.lastRes);
  for (let i = 0; i < v.rosa.length; i++) uguale('rosa[' + i + ']', s.rosa && s.rosa[i], v.rosa[i]);
  return perse;
}

(async () => {
  const srv = await servi();
  let browser;
  try { browser = await chromium.launch(); }
  catch (e) { console.error('BANCO ESPLOSO: il browser non parte: ' + e.message); srv.chiudi(); process.exit(2); }
  const URL = 'http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html';

  console.log('=== SALVATAGGIO — ' + (GIOCO_FUORI || path.join(RADICE, 'CALCETTO-il-gioco.html')) + ' ===');

  /* apre una scheda nuova (localStorage vergine) con un innesto opzionale
     che gira PRIMA di ogni riga del gioco: e' cosi' che si semina un
     salvataggio corrotto o si toglie di mezzo localStorage.

     UN GIOCO CHE MUORE E' UN ROSSO; UN BANCO CHE NON CE LA FA NON LO E'.
     La distinzione si fa sui fatti: se la pagina ha lanciato un'eccezione
     vera, e' il gioco; se non e' mai arrivata a window.__test senza aver
     lanciato niente, il piu' delle volte e' la macchina occupata — e
     allora questo cancello NON accusa l'innocente: se ne va con l'uscita 2
     (banco esploso). Prima pero' ci riprova una volta, perche' una sola
     contesa non deve buttare via una batteria intera. */
  const BANCO = [];
  async function apri(innesto, tentativo) {
    const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
    const pag = await ctx.newPage();
    const errori = [];
    pag.on('pageerror', e => errori.push(String(e.message).split('\n')[0]));
    if (innesto) await pag.addInitScript(innesto);
    let vivo = true;
    try {
      await pag.goto(URL, { waitUntil: 'load', timeout: 45000 });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
      await pag.waitForTimeout(300);
    } catch (e) {
      vivo = false;
      if (!errori.length && !tentativo) {           // nessuna eccezione: puo' essere il banco. Un secondo tentativo.
        await ctx.close();
        return apri(innesto, 1);
      }
      if (!errori.length) BANCO.push('la pagina non e\' arrivata a window.__test in 75 s senza lanciare nessuna eccezione: ' + String(e.message).split('\n')[0]);
      errori.push('il gioco non e\' mai arrivato a window.__test: ' + String(e.message).split('\n')[0]);
    }
    return { ctx, pag, errori, vivo };
  }

  /* ------------------------------------------------------------------
     1-3. IL GIRO COMPLETO
     ------------------------------------------------------------------ */
  {
    const { ctx, pag, errori, vivo } = await apri(null);
    let prima = null, dopo = null, disco = null;
    if (vivo) {
      await pag.evaluate(() => { window.__test.dismissSplash && window.__test.dismissSplash(); });
      prima = await pag.evaluate(() => {
        const t = window.__test;
        /* si GIOCA: partita vera, ricompense vere (forceWinMatch chiude la
           partita passando per endMatch, cioe' per la stessa strada di un
           fischio finale: monete, statistiche, trofei, crescita della rosa) */
        t.startMatch(1, 1);
        t.simulate(6);
        t.forceWinMatch();
        const s = t.save;
        return {
          scena: t.state, coins: s.coins, stats: JSON.parse(JSON.stringify(s.stats)),
          lastRes: s.lastRes, rosa: JSON.parse(JSON.stringify(s.rosa)),
          suDisco: (localStorage.getItem(t.saveKey) || '').length,
        };
      });
      await pag.reload({ waitUntil: 'load', timeout: 30000 });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      dopo = await pag.evaluate(() => {
        const s = window.__test.save;
        return { v: s.v, coins: s.coins, stats: JSON.parse(JSON.stringify(s.stats)), lastRes: s.lastRes, rosa: JSON.parse(JSON.stringify(s.rosa)) };
      });
      disco = await pag.evaluate(() => { try { return JSON.parse(localStorage.getItem(window.__test.saveKey) || 'null'); } catch (e) { return null; } });
    }
    /* la trappola da evitare: due zeri sono «uguali» e non provano niente.
       Prima si pretende di AVER GUADAGNATO, poi che sia sopravvissuto. */
    const guadagnato = !!prima && prima.coins > 0 && prima.stats.partite > 0;
    const monete = guadagnato && dopo && dopo.coins === prima.coins && disco && disco.coins === prima.coins;
    segna(1, 'il giro completo: le monete guadagnate ci sono ancora dopo il ricarico',
      monete,
      prima ? ('guadagnate ' + prima.coins + ' monete giocando; dopo il ricarico ' + (dopo ? dopo.coins : '-') +
        ' in memoria e ' + (disco ? disco.coins : '-') + ' sul disco (' + prima.suDisco + ' byte scritti).\n' +
        '         Il numero di monete cambia di corsa in corsa perche\' dipende dalla partita simulata: ' +
        'cio\' che il cancello confronta e\' memoria contro disco, non un valore fisso.')
        : 'il gioco non e\' arrivato vivo: ' + errori.slice(0, 2).join(' | '));

    const carriera = guadagnato && dopo && JSON.stringify(dopo.stats) === JSON.stringify(prima.stats) &&
      JSON.stringify(dopo.lastRes) === JSON.stringify(prima.lastRes);
    segna(2, 'il giro completo: carriera e ultimo risultato sopravvivono',
      carriera,
      prima ? ('partite ' + prima.stats.partite + ', vittorie ' + prima.stats.vittorie + ', gol fatti ' + prima.stats.golF +
        ', ultimo risultato ' + JSON.stringify(prima.lastRes) + ' -> dopo il ricarico ' +
        (dopo ? JSON.stringify(dopo.stats) + ' ' + JSON.stringify(dopo.lastRes) : '-'))
        : 'non misurato: il gioco non e\' partito');

    const rosaOk = guadagnato && dopo && JSON.stringify(dopo.rosa) === JSON.stringify(prima.rosa) && dopo.rosa.length === 5;
    segna(3, 'il giro completo: la rosa (nomi, attributi, partite giocate) sopravvive',
      rosaOk,
      prima ? (prima.rosa.length + ' uomini, il primo e\' ' + (prima.rosa[0] && prima.rosa[0].nome) + ' con ' +
        (prima.rosa[0] && prima.rosa[0].partite) + ' partite; dopo il ricarico ' +
        (dopo ? dopo.rosa.length + ' uomini, ' + (dopo.rosa[0] && dopo.rosa[0].nome) + ' con ' + (dopo.rosa[0] && dopo.rosa[0].partite) : '-'))
        : 'non misurato: il gioco non e\' partito');
    await ctx.close();
  }

  /* ------------------------------------------------------------------
     4-5. SALVATAGGIO CORROTTO
     ------------------------------------------------------------------ */
  const CORROTTI = [
    [4, 'spazzatura pura', 'il salvataggio e\' testo spazzatura: si riparte puliti, non si muore',
      '{{{ questo non e JSON ---   �'],
    [5, 'tipi ostili', 'il salvataggio e\' JSON valido ma di tipi ostili: si riparte puliti, non si muore',
      JSON.stringify({ v: 4, coins: 'tantissime', fields: 'no', fieldSel: {}, stats: null, shop: 7, shopA: [], rosa: [1, 2, 3, 4], albo: 'x', sponsorNomi: [1, 2, 3], tour: { teams: [1, 2, 3, 4, 5, 6, 7, 8], rounds: [] }, season: { squadre: [1, 2, 3, 4, 5, 6, 7, 8], cal: [] }, teamName: 42, durata: 'lunga' })],
  ];
  for (const [n, breve, nome, carico] of CORROTTI) {
    const { ctx, pag, errori, vivo } = await apri('try{ localStorage.setItem("calcetto_save_v4", ' + JSON.stringify(carico) + '); }catch(e){}');
    let r = null;
    if (vivo) {
      r = await pag.evaluate(() => {
        const t = window.__test; const o = {};
        try {
          t.dismissSplash && t.dismissSplash();
          const s = t.save;
          o.v = s.v; o.coins = s.coins; o.rosaLen = s.rosa && s.rosa.length;
          o.campi = JSON.stringify(s.fields); o.partite = s.stats && s.stats.partite;
          /* «riparte pulito» non e' «si apre»: deve anche GIOCARE */
          t.startMatch(1, 1); t.setCpuVsCpu(true); t.simulate(4);
          o.scena = t.state;
        } catch (e) { o.eccezione = e.message; }
        return o;
      });
    }
    const pulito = !!r && !r.eccezione && errori.length === 0 && r.v === 4 && r.coins === 0 &&
      r.partite === 0 && r.campi === '[1,0,0,0,0,0,0,0]' && r.rosaLen === 5 &&
      ['play', 'kickoff', 'goal', 'end', 'freekick'].includes(r.scena);
    segna(n, nome, pulito,
      vivo ? ('schema letto v' + (r && r.v) + ', monete ' + (r && r.coins) + ', partite ' + (r && r.partite) +
        ', campi ' + (r && r.campi) + ', rosa di ' + (r && r.rosaLen) + '; la partita arriva a "' + (r && r.scena) +
        '"; eccezioni di pagina: ' + errori.length + (errori.length ? ' -> ' + errori.slice(0, 2).join(' | ') : ''))
        : 'il gioco e\' MORTO in caricamento con dentro ' + breve + ': ' + errori.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* ------------------------------------------------------------------
     6-7. LA VERSIONE PRECEDENTE
     ------------------------------------------------------------------ */
  for (const [n, chiave] of [[6, 'calcetto_save_v3'], [7, 'calcetto_save_v2']]) {
    const vecchio = Object.assign({}, VECCHIO, { v: chiave.endsWith('v2') ? 2 : 3 });
    const { ctx, pag, errori, vivo } = await apri(
      'try{ localStorage.setItem(' + JSON.stringify(chiave) + ', ' + JSON.stringify(JSON.stringify(vecchio)) + '); }catch(e){}');
    let s = null;
    if (vivo) s = await pag.evaluate(() => JSON.parse(JSON.stringify(window.__test.save)));
    const perse = s ? perditeMigrazione(s, vecchio) : ['non misurato: il gioco non e\' partito'];
    const ok = !!s && perse.length === 0 && errori.length === 0 && s.v === 4 && s.rosa.length === 5;
    segna(n, 'migrazione da ' + chiave + ': non si perde niente',
      ok,
      s ? ('21 campi confrontati uno per uno + i 4 uomini della rosa vecchia; ' +
        (perse.length ? 'PERSI ' + perse.length + ': ' + perse.slice(0, 4).join(' | ') : 'nessuna perdita') +
        '. Lo schema esce a v' + s.v + ', la rosa da 4 diventa di ' + s.rosa.length +
        ' (il quinto uomo si appende: ' + (s.rosa[4] && s.rosa[4].nome) + ').')
        : 'il gioco e\' MORTO leggendo un salvataggio ' + chiave + ': ' + errori.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* ------------------------------------------------------------------
     8. localStorage ASSENTE
     In una WebView con i dati del sito bloccati non e' getItem a fallire:
     e' l'ACCESSO ALLA PROPRIETA' window.localStorage a lanciare. Si
     riproduce esattamente cosi', che e' il caso peggiore.
     ------------------------------------------------------------------ */
  {
    const { ctx, pag, errori, vivo } = await apri(
      'Object.defineProperty(window, "localStorage", { configurable: true, get: function(){ throw new Error("SecurityError: accesso ai dati del sito negato"); } });');
    let r = null;
    if (vivo) {
      r = await pag.evaluate(() => {
        const t = window.__test; const o = {};
        try {
          t.dismissSplash && t.dismissSplash();
          o.coins0 = t.save.coins;
          t.addCoins(50);                       // passa da persistSave: deve fallire in silenzio
          o.coins1 = t.save.coins;
          t.startMatch(1, 1); t.setCpuVsCpu(true); t.simulate(5);
          o.scena = t.state;
        } catch (e) { o.eccezione = e.message; }
        return o;
      });
    }
    const ok = !!r && !r.eccezione && errori.length === 0 && r.coins1 === 50 &&
      ['play', 'kickoff', 'goal', 'end'].includes(r.scena);
    segna(8, 'localStorage non disponibile: si gioca lo stesso, senza salvare',
      ok,
      vivo ? ('monete in memoria ' + (r && r.coins0) + ' -> ' + (r && r.coins1) + ' (la scrittura fallisce e il gioco tira dritto), ' +
        'la partita arriva a "' + (r && r.scena) + '"; eccezioni: ' + errori.length + (r && r.eccezione ? ' | ' + r.eccezione : ''))
        : 'il gioco e\' MORTO senza localStorage: ' + errori.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* ------------------------------------------------------------------
     9. localStorage PIENO (quota esaurita)
     ------------------------------------------------------------------ */
  {
    const { ctx, pag, errori, vivo } = await apri(
      'Storage.prototype.setItem = function(){ var e = new Error("QuotaExceededError: quota esaurita"); e.name = "QuotaExceededError"; throw e; };');
    let r = null;
    if (vivo) {
      r = await pag.evaluate(() => {
        const t = window.__test; const o = {};
        try {
          t.dismissSplash && t.dismissSplash();
          t.startMatch(1, 1); t.simulate(6); t.forceWinMatch();
          o.coins = t.save.coins; o.scena = t.state;
          o.suDisco = localStorage.getItem(t.saveKey);
        } catch (e) { o.eccezione = e.message; }
        return o;
      });
    }
    const ok = !!r && !r.eccezione && errori.length === 0 && r.coins > 0 && r.scena === 'end';
    segna(9, 'localStorage pieno: la partita si chiude lo stesso, senza salvare',
      ok,
      vivo ? ('la partita finisce a "' + (r && r.scena) + '" con ' + (r && r.coins) + ' monete in memoria e ' +
        ((r && r.suDisco) ? 'qualcosa' : 'NIENTE') + ' sul disco; eccezioni: ' + errori.length +
        '. NOTA: il fallimento e\' SILENZIOSO — il giocatore non viene avvisato che non si sta salvando (difetto separato, non misurato qui).')
        : 'il gioco e\' MORTO con la quota esaurita: ' + errori.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* ------------------------------------------------------------------
     10. AZZERAMENTO che non resuscita — E CHE PULISCE DAVVERO.
     Si guardano DUE cose, e la seconda e' nata da un controllo negativo
     che ha bocciato la prima versione di questo caso: togliendo dal gioco
     la riga che cancella la chiave v3, il caso restava verde. Il motivo
     e' che doResetSave, subito dopo, riscrive una v4 vergine, e la v4
     vince sempre in lettura: la vecchia chiave resta li' inerte e il
     riavvio non la vede. Cioe' la prova della «resurrezione» da sola e'
     CIECA su quel guasto. Quindi si pretende anche il fatto nudo: dopo
     AZZERA TUTTI I DATI, delle chiavi vecchie non deve restare nessuna.
     E' cio' che il pulsante promette («monete, campi, trofei,
     statistiche»), ed e' l'unica difesa se un giorno la v4 sparisse.
     ------------------------------------------------------------------ */
  {
    /* si semina TUTTO il passato che il gioco dichiara di saper cancellare:
       v3, v2 e la vecchissima chiave del solo silenzio.
       NOTA sul metodo: l'innesto rimessa in scena a OGNI navigazione, quindi
       dopo il ricarico le chiavi vecchie tornano da sole. Non e' un difetto
       della prova, e' il caso peggiore messo apposta: anche col passato
       ancora li' sul disco, dopo un azzeramento il gioco deve ripartire da
       zero — cioe' la v4 vergine deve vincere in lettura. */
    const { ctx, pag, errori, vivo } = await apri(
      'try{ localStorage.setItem("calcetto_save_v3", ' + JSON.stringify(JSON.stringify(VECCHIO)) + ');' +
      ' localStorage.setItem("calcetto_save_v2", ' + JSON.stringify(JSON.stringify(Object.assign({}, VECCHIO, { v: 2, coins: 111 }))) + ');' +
      ' localStorage.setItem("calcetto_mute", "1"); }catch(e){}');
    let r = null;
    if (vivo) {
      r = await pag.evaluate(() => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        const primaMonete = t.save.coins;                 // 777, migrate dalla v3
        t.resetSave();
        return { primaMonete, dopoMonete: t.save.coins, chiavi: Object.keys(localStorage) };
      });
      await pag.reload({ waitUntil: 'load', timeout: 30000 });
      await pag.waitForFunction('window.__test !== undefined', null, { timeout: 20000 });
      r.dopoRicarico = await pag.evaluate(() => window.__test.save.coins);
    }
    const superstiti = r ? r.chiavi.filter(k => k !== 'calcetto_save_v4') : [];
    const ok = !!r && r.primaMonete === VECCHIO.coins && r.dopoMonete === 0 &&
      r.dopoRicarico === 0 && superstiti.length === 0;
    segna(10, 'azzeramento: le chiavi vecchie spariscono e niente resuscita al riavvio',
      ok,
      vivo ? (r.primaMonete + ' monete migrate dalla v3, dopo AZZERA ' + r.dopoMonete +
        ', dopo il ricarico ' + r.dopoRicarico + '; chiavi rimaste: ' + JSON.stringify(r.chiavi) +
        (superstiti.length ? ' — SOPRAVVISSUTE ' + JSON.stringify(superstiti) + ', l\'azzeramento non ha pulito' : ''))
        : 'non misurato: il gioco non e\' partito: ' + errori.slice(0, 2).join(' | '));
    await ctx.close();
  }

  /* ------------------------------------------------------------------
     11. IL NASCONDIMENTO (difetto noto e aperto)
     Si misura con una SENTINELLA: un valore inconfondibile messo in SAVE e
     non ancora scritto. Se nascondere l'app non lo porta sul disco, quel
     valore e' quello che l'utente perde quando Android uccide l'app in
     sottofondo. Si provano tutti e tre gli eventi che un guscio Android
     puo' consegnare: visibilitychange, pagehide, freeze.
     ------------------------------------------------------------------ */
  let toppaArrivata = false;
  {
    const { ctx, pag, errori, vivo } = await apri(null);
    let r = null;
    if (vivo) {
      r = await pag.evaluate(async () => {
        const t = window.__test;
        t.dismissSplash && t.dismissSplash();
        t.startMatch(1, 1); t.simulate(6); t.forceWinMatch();   // uno stato salvato c'e' gia'
        const prima = localStorage.getItem(t.saveKey) || '';
        t.save.coins = 424242;                                  // la sentinella, solo in memoria
        Object.defineProperty(document, 'hidden', { configurable: true, get: function () { return true; } });
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: function () { return 'hidden'; } });
        document.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new Event('pagehide'));
        document.dispatchEvent(new Event('freeze'));
        await new Promise(function (ok) { setTimeout(ok, 400); });
        const dopo = localStorage.getItem(t.saveKey) || '';
        return { scritta: prima !== dopo, sentinella: dopo.indexOf('424242') >= 0, byte: dopo.length };
      });
    }
    toppaArrivata = !!r && r.sentinella;
    /* «aperto» solo se il difetto e' quello noto e non si e' chiesto --severo:
       il cricchetto sta qui — appena la toppa arriva, toppaArrivata diventa
       vero e da quel giorno un ritorno indietro e' rosso pieno */
    const aperto = !toppaArrivata && !SEVERO;
    segna(11, 'nascondendo l\'app il salvataggio viene forzato su disco',
      toppaArrivata,
      vivo ? ((toppaArrivata
        ? 'la sentinella 424242 e\' finita sul disco: LA TOPPA E\' ARRIVATA. Da adesso questo caso CONTA sempre: se torna a fallire e\' rosso.'
        : 'la sentinella 424242 NON e\' sul disco (' + r.byte + ' byte, contenuto ' + (r.scritta ? 'cambiato' : 'IDENTICO') +
          '): nascondere l\'app non scrive niente. Difetto noto e APERTO, toppa in attesa (_toppa-salvataggio.js); ' +
          (SEVERO ? 'con --severo conta come rosso.' : 'senza --severo non fa rosso il totale.')))
        : 'non misurato: il gioco non e\' partito: ' + errori.slice(0, 2).join(' | '),
      aperto && vivo);
    await ctx.close();
  }

  await browser.close(); srv.chiudi();

  /* ------------------------------------------------------------------
     CIO' CHE NON E' STATO MISURATO, detto in chiaro
     ------------------------------------------------------------------ */
  console.log('\n  --    NON SI MISURA QUI il backup automatico di Android (allowBackup="true" nel');
  console.log('        manifest, senza regole): un browser non puo\' saperlo, serve il telefono.');
  console.log('        Misurato il 20 agosto 2026 con strumenti/_t-salvataggio-telefono.js su');
  console.log('        ONEPLUS A6003 / Android 11, trasporto locale: il set di backup CONTIENE il');
  console.log('        salvataggio (sentinella scritta prima del backup, sovrascritta dopo, tornata');
  console.log('        col ripristino). Resta NON VERIFICATO il giro sul trasporto di Google e il');
  console.log('        caso «disinstallo e reinstallo su un altro telefono».');

  const rossi = CASI.filter(c => !c.ok && !c.aperto);
  const aperti = CASI.filter(c => !c.ok && c.aperto);
  console.log('\n' + CASI.length + ' controlli, ' + (CASI.length - rossi.length - aperti.length) + ' passati, ' +
    rossi.length + ' falliti' + (aperti.length ? ', ' + aperti.length + ' aperti (difetto noto, toppa in attesa)' : ''));
  /* IL BANCO PRIMA DI TUTTO: se anche una sola scheda non e' arrivata a
     window.__test senza lanciare niente, questa corsa non ha misurato il
     gioco — e un rosso raccolto cosi' accuserebbe l'innocente. */
  if (BANCO.length) {
    console.log('BANCO ESPLOSO (' + BANCO.length + '): ' + BANCO.slice(0, 3).join(' | '));
    console.log('Nessun verdetto sul gioco da questa corsa: rifarla a banco libero.');
    process.exit(2);
  }
  if (rossi.length) { console.log('ROSSO: ' + rossi.map(c => c.n + '. ' + c.nome).join(' ; ')); process.exit(1); }
  process.exit(0);
})().catch(e => { console.error('BANCO ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });
