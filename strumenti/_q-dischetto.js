/* =====================================================================
   _q-dischetto.js — LA SFIDA DAL DISCHETTO, FRA DUE TELEFONI
   (voce #146, compito 1)

   NASCE ROSSO, ed e' dichiarato: sul gioco di oggi `window.__test.dischetto`
   non esiste, e il banco stampa la causa vera invece di un'eccezione.

   CHE COSA MISURA, e perche' ognuna delle sette lettere e' li'.

   A) L'APPUNTAMENTO. Due telefoni, un codice corto, zero conti. Devono
      uscirne con LO STESSO seme, LO STESSO primo tiratore e la rosa
      dell'altro. E il seme non lo deve scegliere nessuno dei due: e'
      questa la prova che sta dentro A3, e non «il seme e' un numero».

   B) LA SIMULTANEITA'. E' il cuore del cantiere. Se chi parla per
      secondo puo' vedere la mossa del primo, il portiere para sempre e
      la sfida non esiste. La prova NON e' strutturale ma numerica: si
      mette in campo un PARI VEGGENTE — un avversario scritto in Node
      che, prima di impegnarsi, aspetta di leggere la rivelazione
      dell'altro — e si conta quante volte ci riesce. Zero su N, oppure
      il cantiere non ha ragione di esistere.

      E LA META' CHE MANCA A QUASI TUTTI I BANCHI: contare zero non
      basta. Un protocollo che non manda MAI niente darebbe zero uguale.
      Percio' B2 ha il suo TESTIMONE (B2bis): lo stesso pari, con la
      veggenza spenta, deve vedere eccome la rivelazione dell'altro —
      dopo essersi impegnato. Senza il testimone, «zero sbirciate» e
      «cassetta vuota» sono lo stesso referto (lezione 18).

   C) LA SERIE. Cinque tiri per parte sui due telefoni, e il punteggio
      deve coincidere TIRO PER TIRO, non solo alla fine: due errori che
      si compensano darebbero un totale giusto e una partita diversa.

   D) LA CUCITURA. Lo stesso copione sul filo della cassetta e su un
      filo diretto finto (in-processo, ritardo zero) deve dare lo stesso
      esito. E' la prova che il posto per WebRTC esiste davvero, senza
      costruire WebRTC e senza dichiarare niente di non misurato.

   E) I FRENI. Le richieste al minuto vere, contro il tetto di 60 che la
      cassetta ha preso dal fratello piu' largo del server vero. La spec
      §2.4 fa un conto (36 al minuto): se quel conto fosse ottimista,
      qui deve uscire un rosso e non una nota a margine.

   F) ZERO RETE. L'idioma di _q-carta.js D5, copiato e non reinventato:
      si apre la schermata CON LA RETE GIA' BLOCCATA, si prende la TACCA
      del contatore DOPO l'apertura — perche' `Sfida.apri()` chiede
      /api/entra per progetto, e quella non e' una colpa — e poi si
      pretende che il contatore non si muova finche' un dito non preme.
      SI CONTA IL DELTA, NON IL TOTALE.

   G) IL GUASTO. Che cosa vede chi resta: l'altro che sparisce, un
      ritiro perso, un imbuco perso, la rete che singhiozza.

   uso:  node strumenti/_q-dischetto.js [--gioco f.html] [--solo A,B,C]
                                        [--tiri N]
   esce  0 verde · 1 il gioco e' rosso · 2 il banco e' esploso ·
         3 prova nulla (il file indicato non esiste)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');

const RADICE = T.RADICE;
const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };

const GIOCO = arg('gioco');
if (GIOCO && !fs.existsSync(path.resolve(RADICE, GIOCO))) {
  console.error('PROVA NULLA: il file indicato non esiste: ' + GIOCO);
  process.exit(3);
}
const PROVA = GIOCO ? path.resolve(RADICE, GIOCO) : null;
const SOLO = arg('solo') ? arg('solo').split(',').map(s => s.trim().toUpperCase()) : null;
const TIRI = Math.max(2, parseInt(arg('tiri') || '10', 10) || 10);
const vuole = g => !SOLO || SOLO.includes(g);

const esiti = [];
function di(ok, nome, det) {
  esiti.push(!!ok);
  console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : ''));
}

/* =====================================================================
   LE MOSSE SONO UNA TAVOLA FISSA, non un sorteggio.

   Due esecuzioni dello stesso banco devono essere confrontabili: se le
   mosse le sorteggiasse il banco, un rosso non si saprebbe rilanciare.
   La tavola e' costruita perche' i due lati NON scelgano sempre la
   stessa zona (se no il portiere parerebbe sempre, o mai, e il banco
   misurerebbe la propria tavola invece del gioco).
   ===================================================================== */
const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });

/* ---------------------------------------------- la maniglia sul gioco */
const c_esiste = P => P.pag.evaluate(() => !!(window.__test && window.__test.dischetto));
const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_crea = P => P.pag.evaluate(async () => await window.__test.dischetto.crea());
const d_entra = (P, s) => P.pag.evaluate(async s => await window.__test.dischetto.entra(s), s);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);
const d_spia = P => P.pag.evaluate(() => window.__test.dischetto.spia());
const d_esiti = P => P.pag.evaluate(() => window.__test.dischetto.esiti);

/* UN GIRO su tutti e due i telefoni: se e' il momento di scegliere si
   sceglie, poi si fa girare la rete. Il banco non aspetta un orologio:
   chiama `giro()` da se', perche' un banco che aspetta un timer misura
   il timer. */
async function passoDiSerie(A, B, quale) {
  for (const [P, q] of [[A, 'a'], [B, 'b']]) {
    const s = await d_stato(P);
    if (s && s.fase === 'scegli') {
      const m = s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro);
      await d_scegli(P, m);
    }
  }
  await Promise.all([d_giro(A), d_giro(B)]);
}

async function giocaSerie(A, B, giriMax) {
  for (let g = 0; g < (giriMax || 400); g++) {
    const [sa, sb] = await Promise.all([d_stato(A), d_stato(B)]);
    if (sa && sb && sa.fase === 'fine' && sb.fase === 'fine') return { giri: g, sa, sb };
    await passoDiSerie(A, B);
  }
  const [sa, sb] = await Promise.all([d_stato(A), d_stato(B)]);
  return { giri: giriMax || 400, sa, sb, scaduto: true };
}


/* =====================================================================
   UN GIRO CONTRO UN PARI FINTO.

   Tre cose che la prima versione sbagliava, e ognuna faceva dire al
   banco una bugia diversa:

   1. IL TELEFONO VERO DEVE SCEGLIERE. Senza la riga che chiama
      scegli(), A resta fermo ad aspettare la propria mossa e non rivela
      mai niente: il testimone B2 diceva «MAI VISTA» e la colpa sembrava
      del gioco.

   2. IL PARI DEVE GIOCARE IL RUOLO CHE GLI TOCCA. Il pari mandava
      sempre una parata; quando toccava a lui tirare, il gioco rispondeva
      «mossa-storta» — giustamente — e la prova sull'esito non arrivava
      mai al punto che voleva misurare.

   3. IL FRENO NON VA ACCESO DOVE NON SI MISURA IL FRENO. Il banco pedala
      molto piu' in fretta di due persone: col tetto acceso arrivava un
      429 a meta' del gruppo B e il gioco diceva «causa: rete». Il freno
      si misura nel gruppo E, che e' fatto apposta, e li' e' acceso.
   ===================================================================== */
async function pariGiro(A, pari) {
  const s = await d_stato(A);
  if (s && s.fase === 'scegli') {
    await d_scegli(A, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
  }
  await d_giro(A);
  await pari.ritira();
  return s;
}

/* la mossa del pari e' quella del ruolo OPPOSTO a quello del telefono */
const mossaPari = (ruoloA, t) => (ruoloA === 't' ? mossaPara(t) : mossaTiro(t));

/* ===================================================================== */
(async () => {
  console.log('\nLA SFIDA DAL DISCHETTO — banco a due telefoni' + (PROVA ? ('  [' + path.basename(PROVA) + ']') : ''));

  const sg = await T.serviGioco(PROVA);
  const browser = await chromium.launch();
  let esploso = null;
  const aperti = [];

  try {
    /* -------------------------------------------------------------- */
    /* LA PORTA: se il gioco non ha la sfida dal dischetto, il banco lo
       dice con la causa vera invece di schiantarsi su un undefined.
       E' un ROSSO, non una prova nulla: il cantiere esiste per farla
       diventare verde.                                                */
    const cc = await T.serviCassetta();
    const A0 = await T.apri(browser, sg.porta); aperti.push(A0);
    const c = await c_esiste(A0);
    di(c, 'PORTA) il gioco espone window.__test.dischetto',
       c ? 'c\'e\'' : 'ASSENTE — il gioco non ha ancora la sfida dal dischetto');
    if (!c) {
      await A0.ctx.close(); aperti.pop();
      cc.chiudi(); sg.chiudi(); await browser.close();
      console.log('\n  rossi: 1 su 1   (il banco nasce rosso: e\' il difetto che il cantiere deve curare)');
      process.exit(1);
    }
    await A0.ctx.close(); aperti.pop();
    cc.chiudi();

    /* ================================================== A) L'APPUNTAMENTO */
    if (vuole('A')) {
      console.log('\nA) L\'APPUNTAMENTO — un codice corto, zero conti');
      const ca = await T.serviCassetta({ frenoAcceso: false });
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      const B = await T.apri(browser, sg.porta); aperti.push(B);
      await T.collega(A, ca.porta, 'ALFA'); await T.collega(B, ca.porta, 'BETA');
      await T.entra(A); await T.entra(B);

      const r = await d_crea(A);
      di(r && r.ok && /^[A-Z0-9]{6}$/.test(r.stanza || ''), 'A1) il codice e\' corto e dice solo dov\'e\' la cassetta',
         JSON.stringify(r));
      const e = await d_entra(B, r.stanza);
      di(e && e.ok, 'A2) l\'altro telefono entra col codice', JSON.stringify(e));

      /* si fa girare finche' l'appuntamento non e' concluso */
      for (let g = 0; g < 20; g++) {
        const [sa, sb] = await Promise.all([d_stato(A), d_stato(B)]);
        if (sa.seme && sb.seme) break;
        await Promise.all([d_giro(A), d_giro(B)]);
      }
      const sa = await d_stato(A), sb = await d_stato(B);
      di(sa.seme && sa.seme === sb.seme, 'A3) i due telefoni escono con LO STESSO seme',
         'A=' + sa.seme + ' B=' + sb.seme);
      di(sa.primo && sa.primo === sb.primo, 'A4) e con lo stesso primo tiratore, che non ha scelto nessuno',
         'A=' + sa.primo + ' B=' + sb.primo);
      di(sa.taglia === 5 && sb.taglia === 5, 'A5) la taglia e\' 5 — il determinismo pieno vale li\' (voce #98)',
         'A=' + sa.taglia + ' B=' + sb.taglia);
      di(sa.suaRosa && sb.suaRosa && sa.suaRosa !== sb.suaRosa,
         'A6) ognuno vede la rosa dell\'ALTRO, e le due non sono la stessa',
         'A vede ' + String(sa.suaRosa).slice(0, 24) + ' · B vede ' + String(sb.suaRosa).slice(0, 24));

      /* IL SEME NON LO SCEGLIE NESSUNO: due appuntamenti diversi devono
         dare semi diversi, o il "nonce" e' una decorazione. */
      const r2 = await d_crea(A);
      await d_entra(B, r2.stanza);
      for (let g = 0; g < 20; g++) {
        const [x, y] = await Promise.all([d_stato(A), d_stato(B)]);
        if (x.seme && y.seme && x.stanza === r2.stanza) break;
        await Promise.all([d_giro(A), d_giro(B)]);
      }
      const sa2 = await d_stato(A);
      di(sa2.seme && sa2.seme !== sa.seme, 'A7) un secondo appuntamento da\' un seme diverso',
         sa.seme + ' -> ' + sa2.seme);

      for (const P of [A, B]) { await P.ctx.close(); }
      aperti.length = aperti.length - 2;
      ca.chiudi();
    }

    /* ================================================ B) LA SIMULTANEITA' */
    if (vuole('B')) {
      console.log('\nB) LA SIMULTANEITA\' — chi parla per secondo non vince');
      const cb = await T.serviCassetta({ frenoAcceso: false });
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      await T.collega(A, cb.porta, 'ALFA'); await T.entra(A);
      const base = 'http://127.0.0.1:' + cb.porta;

      const nuovoPari = async (bugia, sale) => {
        const r = await d_crea(A);
        const cred = await T.credenziali(base);
        const P = new T.PariFinto(base, cred, r.stanza, 'b', bugia || {});
        const s0 = await d_stato(A);
        await P.saluta({ v: T.DISCHETTO_V, mv: s0.motoreV, imp: s0.impronta,
                         rosa: T.rosaFinta(sale), n: T.esa(crypto.randomBytes(8)) });
        for (let g = 0; g < 8; g++) await pariGiro(A, P);
        return P;
      };

      /* B1 — IL PARI VEGGENTE. Prima di impegnarsi aspetta di leggere la
         RIVELAZIONE dell'altro: e' il baro nel caso peggiore, perche' non
         "prova" a barare, bara sapendo tutto quel che la cassetta mostra. */
      const veg = await nuovoPari({ veggente: true }, 1);
      let sbirciate = 0, tentativi = 0;
      for (let t = 0; t < TIRI; t++) {
        const s = await d_stato(A);
        if (s.fase === 'fine') break;
        tentativi++;
        for (let g = 0; g < 6; g++) await pariGiro(A, veg);
        if (veg.trova('R', 'a', t)) sbirciate++;
        await veg.impegna(t, () => mossaPari(s.ruolo, t));
        for (let g = 0; g < 6; g++) await pariGiro(A, veg);
        await veg.rivela(t, null);
        for (let g = 0; g < 6; g++) await pariGiro(A, veg);
      }
      di(sbirciate === 0, 'B1) il veggente non vede MAI la mossa dell\'altro prima di impegnarsi',
         sbirciate + ' sbirciate su ' + tentativi + ' tiri');

      /* B2 — IL TESTIMONE (lezione 18). Lo stesso pari, veggenza SPENTA,
         DEVE vedere la rivelazione dell'altro — dopo essersi impegnato.
         Senza, «zero sbirciate» e «cassetta vuota» sono lo stesso referto. */
      const onesto = await nuovoPari({}, 2);
      const sOn = await d_stato(A);
      await onesto.impegna(0, () => mossaPari(sOn.ruolo, 0));
      let vista = false;
      for (let g = 0; g < 30; g++) {
        await pariGiro(A, onesto);
        if (onesto.trova('R', 'a', 0)) { vista = true; break; }
      }
      di(vista, 'B2) TESTIMONE — a veggenza spenta la rivelazione dell\'altro ARRIVA, dopo l\'impegno',
         vista ? 'vista' : 'MAI VISTA: il banco B1 non stava misurando niente');

      /* B3 — IL PARI BUGIARDO. Impegna una mossa e ne rivela un'altra.
         Qui il dubbio non c'e': l'hash non ricompone, e questa e' l'UNICA
         strada di questo cantiere che porta a un'accusa invece che a
         un'astensione. Se il gioco non se ne accorgesse, l'impegno
         sarebbe una decorazione. */
      const bug = await nuovoPari({ bugiardo: m => Object.assign({}, m, { z: (m.z + 1) % 3 }) }, 3);
      const sBu = await d_stato(A);
      await bug.impegna(0, () => mossaPari(sBu.ruolo, 0));
      for (let g = 0; g < 12; g++) await pariGiro(A, bug);
      await bug.rivela(0, null);
      let sFin = null;
      for (let g = 0; g < 30; g++) {
        await pariGiro(A, bug);
        sFin = await d_stato(A);
        if (sFin.fase === 'fine') break;
      }
      di(sFin && sFin.fase === 'fine' && sFin.causa === 'impegno-non-torna',
         'B3) il pari bugiardo (impegna una mossa, ne rivela un\'altra) viene SMASCHERATO',
         'fase=' + (sFin && sFin.fase) + ' causa=' + (sFin && sFin.causa));

      await A.ctx.close(); aperti.pop();
      cb.chiudi();
    }

    /* ======================================================== C) LA SERIE */
    if (vuole('C')) {
      console.log('\nC) LA SERIE — lo stesso punteggio sui due telefoni, tiro per tiro');
      const cs = await T.serviCassetta({ frenoAcceso: false });
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      const B = await T.apri(browser, sg.porta); aperti.push(B);
      await T.collega(A, cs.porta, 'ALFA'); await T.collega(B, cs.porta, 'BETA');
      await T.entra(A); await T.entra(B);

      const r = await d_crea(A);
      await d_entra(B, r.stanza);
      const fine = await giocaSerie(A, B, 600);
      di(!fine.scaduto, 'C1) la serie arriva in fondo', 'giri di rete: ' + fine.giri);

      const [ea, eb] = await Promise.all([d_esiti(A), d_esiti(B)]);
      di(ea.length > 0 && ea.length === eb.length, 'C2) i due telefoni hanno lo stesso numero di tiri',
         'A=' + ea.length + ' B=' + eb.length);
      const diversi = ea.filter((x, i) => !eb[i] || x.esito !== eb[i].esito).length;
      di(ea.length > 0 && diversi === 0, 'C3) e lo STESSO esito tiro per tiro (non solo lo stesso totale)',
         diversi + ' tiri diversi su ' + ea.length);
      di(fine.sa && fine.sb && JSON.stringify(fine.sa.serie) === JSON.stringify(fine.sb.serie),
         'C4) il punteggio finale coincide',
         JSON.stringify(fine.sa && fine.sa.serie) + ' vs ' + JSON.stringify(fine.sb && fine.sb.serie));

      /* IL TESTIMONE DELLA SERIE: se tutti gli esiti fossero uguali fra
         loro (per esempio "parata" sempre), C3 sarebbe verde senza
         misurare niente. */
      const gusti = new Set(ea.map(x => x.esito));
      di(gusti.size >= 2, 'C5) TESTIMONE — gli esiti non sono tutti uguali fra loro',
         [...gusti].join(','));

      for (const P of [A, B]) await P.ctx.close();
      aperti.length = aperti.length - 2;

      /* C6 — IL PARI CHE DICHIARA UN ESITO SUO. Qui NON c'e' un'accusa:
         due esiti diversi possono nascere da due motori diversi, e davanti
         a un dubbio ci si astiene (il principio che regge tutta l'onda D).
         Percio' la serie si ferma dicendo «esiti-diversi», non «hai
         barato». Se il gioco credesse all'esito dichiarato dall'altro
         invece di calcolare il proprio, chi bara vincerebbe scrivendo la
         parola «gol».

         L'ESITO FALSO E' COSTRUITO PER ESSERE DIVERSO, non sperato tale:
         si legge l'esito che il telefono vero ha calcolato e si dichiara
         l'altro. Un falso che mandasse sempre «gol» sarebbe morso solo
         quando il vero non e' gol, cioe' a volte — e un falso che morde a
         volte non prova niente. */
      const A2 = await T.apri(browser, sg.porta); aperti.push(A2);
      await T.collega(A2, cs.porta, 'GAMMA'); await T.entra(A2);
      const baseC = 'http://127.0.0.1:' + cs.porta;
      const rc = await d_crea(A2);
      const credC = await T.credenziali(baseC);
      const buge = new T.PariFinto(baseC, credC, rc.stanza, 'b', {});
      const sc0 = await d_stato(A2);
      await buge.saluta({ v: T.DISCHETTO_V, mv: sc0.motoreV, imp: sc0.impronta,
                          rosa: T.rosaFinta(4), n: T.esa(crypto.randomBytes(8)) });
      for (let g = 0; g < 8; g++) await pariGiro(A2, buge);

      let sEs = null;
      for (let t = 0; t < 5; t++) {
        const s = await d_stato(A2);
        if (s.fase === 'fine') break;
        await buge.impegna(t, () => mossaPari(s.ruolo, t));
        for (let g = 0; g < 8; g++) await pariGiro(A2, buge);
        /* l'esito del tiro prima, dichiarato al contrario */
        const veri = await d_esiti(A2);
        const vero = (t > 0 && veri[t - 1]) ? veri[t - 1].esito : null;
        const falso = vero ? (vero === 'gol' ? 'parata' : 'gol') : null;
        await buge.rivela(t, falso);
        for (let g = 0; g < 10; g++) {
          await pariGiro(A2, buge);
          sEs = await d_stato(A2);
          if (sEs.fase === 'fine') break;
        }
        if (sEs && sEs.fase === 'fine') break;
      }
      di(sEs && sEs.fase === 'fine' && sEs.causa === 'esiti-diversi',
         'C6) il pari che dichiara un esito suo ferma la serie per ASTENSIONE, non per accusa',
         'fase=' + (sEs && sEs.fase) + ' causa=' + (sEs && sEs.causa));
      await A2.ctx.close(); aperti.pop();
      cs.chiudi();
    }

    /* ===================================================== D) LA CUCITURA */
    if (vuole('D')) {
      console.log('\nD) LA CUCITURA — il duello non sa quale filo ha sotto');
      const cd = await T.serviCassetta({ frenoAcceso: false });
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      const B = await T.apri(browser, sg.porta); aperti.push(B);
      await T.collega(A, cd.porta, 'ALFA'); await T.collega(B, cd.porta, 'BETA');
      await T.entra(A); await T.entra(B);

      /* stesso appuntamento, stesse mosse, due fili diversi */
      const conFilo = async filo => {
        await A.pag.evaluate(f => window.__test.dischetto.filo(f), filo);
        await B.pag.evaluate(f => window.__test.dischetto.filo(f), filo);
        const r = await d_crea(A);
        await d_entra(B, r.stanza);
        await giocaSerie(A, B, 600);
        return d_esiti(A);
      };
      const viaOrdine = await conFilo('cassetta');
      const viaSballo = await conFilo('sballato');
      const uguali = viaOrdine.length > 0 && viaOrdine.length === viaSballo.length &&
                     viaOrdine.every((x, i) => x.esito === viaSballo[i].esito);
      di(uguali, 'D1) stesso copione sul filo ordinato e su uno che ritarda e mescola -> stesso esito',
         'ordinato ' + viaOrdine.map(x => x.esito[0]).join('') + ' · sballato ' + viaSballo.map(x => x.esito[0]).join(''));
      di(viaOrdine.length >= 2, 'D2) TESTIMONE — la serie non e\' vuota: ci sono tiri da confrontare',
         viaOrdine.length + ' tiri');

      for (const P of [A, B]) await P.ctx.close();
      aperti.length = aperti.length - 2;
      cd.chiudi();
    }

    /* ======================================================== E) I FRENI */
    if (vuole('E')) {
      console.log('\nE) I FRENI — le richieste al minuto vere, contro il tetto di ' + T.FRENO_TETTO);
      const ce = await T.serviCassetta();
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      const B = await T.apri(browser, sg.porta); aperti.push(B);
      await T.collega(A, ce.porta, 'ALFA'); await T.collega(B, ce.porta, 'BETA');
      await T.entra(A); await T.entra(B);
      ce.azzeraConto();

      const r = await d_crea(A);
      await d_entra(B, r.stanza);
      const t0 = Date.now();
      const fine = await giocaSerie(A, B, 600);
      const durata = (Date.now() - t0) / 1000;

      /* IL BANCO NON ASPETTA: fa girare la rete il piu' in fretta
         possibile, quindi il tempo vero e' piu' corto del tempo di una
         serie giocata da due persone. Percio' il numero che conta non e'
         "richieste al minuto misurate col cronometro di questo banco" —
         sarebbe il ritmo del banco, non del gioco. Il numero onesto e'
         RICHIESTE PER TIRO: quello non dipende da quanto in fretta il
         banco pedala, e si converte nel tetto con la durata vera di un
         tiro dichiarata dal gioco. */
      const tiri = (await d_esiti(A)).length || 1;
      const richA = ce.conta(null, 'imbuca') + ce.conta(null, 'ritira');
      const perTiro = richA / tiri / 2;   /* per telefono */
      const secPerTiro = fine.sa && fine.sa.secPerTiro ? fine.sa.secPerTiro : 10;
      const alMinuto = perTiro * (60 / secPerTiro);
      di(alMinuto <= T.FRENO_TETTO, 'E1) le richieste al minuto stanno sotto il tetto del freno',
         perTiro.toFixed(1) + ' per tiro · ' + alMinuto.toFixed(1) + '/min contro ' + T.FRENO_TETTO +
         '   (serie di ' + tiri + ' tiri in ' + durata.toFixed(1) + ' s di banco)');

      /* IL FRENO C'E' DAVVERO: una raffica deve prendere 429. Senza
         questa, E1 potrebbe essere verde perche' il freno non esiste. */
      const cred = await T.credenziali('http://127.0.0.1:' + ce.porta);
      const raff = new T.PariFinto('http://127.0.0.1:' + ce.porta, cred, r.stanza, 'b', {});
      const rifiuti = await raff.raffica(T.FRENO_TETTO + 20);
      di(rifiuti > 0, 'E2) TESTIMONE — il freno morde: una raffica prende 429',
         rifiuti + ' rifiuti su ' + (T.FRENO_TETTO + 20) + ' richieste');

      for (const P of [A, B]) await P.ctx.close();
      aperti.length = aperti.length - 2;
      ce.chiudi();
    }

    /* ====================================================== F) ZERO RETE */
    if (vuole('F')) {
      console.log('\nF) ZERO RETE — la prima richiesta parte quando un dito preme, e mai prima');
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      const bloccate = [];
      await A.pag.route('**/*', route => {
        const u = route.request().url();
        if (u.includes('CALCETTO-il-gioco.html') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
        bloccate.push(u); return route.abort();
      });
      await A.pag.evaluate(() => { const t = window.__test; t.sfida.apri(); });
      await A.pag.waitForTimeout(250);
      /* LA TACCA: si conta il DELTA dopo l'apertura, non il totale.
         `Sfida.apri()` chiede /api/entra PER PROGETTO, e quella non e'
         una colpa di questa funzione (idioma di _q-carta.js D5). */
      const tacca = bloccate.length;
      await A.pag.evaluate(() => { const d = window.__test.dischetto; d.apri && d.apri(); });
      await A.pag.waitForTimeout(400);
      const nuove = bloccate.length - tacca;
      di(nuove === 0, 'F1) aprire il pannello del dischetto non fa una sola richiesta',
         nuove + ' richieste nuove dopo la tacca (tacca a ' + tacca + ')');

      await A.ctx.close(); aperti.pop();
    }

    /* ======================================================== G) IL GUASTO */
    if (vuole('G')) {
      console.log('\nG) IL GUASTO — che cosa vede chi resta');
      const cg = await T.serviCassetta({ frenoAcceso: false });
      const A = await T.apri(browser, sg.porta); aperti.push(A);
      const B = await T.apri(browser, sg.porta); aperti.push(B);
      await T.collega(A, cg.porta, 'ALFA'); await T.collega(B, cg.porta, 'BETA');
      await T.entra(A); await T.entra(B);

      /* G1 — un RITIRO perso: chi resta non deve vedere NIENTE */
      const r1 = await d_crea(A); await d_entra(B, r1.stanza);
      cg.stato.perdiRitiro = 3;
      const f1 = await giocaSerie(A, B, 600);
      const e1 = await d_esiti(A);
      di(!f1.scaduto && e1.length > 0, 'G1) tre ritiri persi: la serie arriva in fondo lo stesso',
         'tiri ' + e1.length + ' · ' + (f1.scaduto ? 'SCADUTA' : 'finita'));

      /* G2 — un IMBUCO perso: si ritenta, e l'idempotenza lo permette */
      const r2 = await d_crea(A); await d_entra(B, r2.stanza);
      cg.stato.perdiImbuco = 3;
      const f2 = await giocaSerie(A, B, 600);
      const e2 = await d_esiti(A);
      di(!f2.scaduto && e2.length > 0, 'G2) tre imbuchi persi: il ritentativo li recupera',
         'tiri ' + e2.length + ' · ' + (f2.scaduto ? 'SCADUTA' : 'finita'));

      /* G3 — la rete singhiozza: 429, e il gioco rallenta invece di fermarsi */
      const r3 = await d_crea(A); await d_entra(B, r3.stanza);
      cg.stato.mille429 = 8;
      const f3 = await giocaSerie(A, B, 800);
      const e3 = await d_esiti(A);
      di(!f3.scaduto && e3.length > 0, 'G3) otto 429 di fila: la serie rallenta e non si ferma',
         'tiri ' + e3.length + ' · ' + (f3.scaduto ? 'SCADUTA' : 'finita'));

      /* G4 — L'ALTRO SPARISCE. Il caso che decide il disegno: chi resta
         NON deve vincere, o spegnere il telefono dell'altro diventa una
         strategia. */
      const r4 = await d_crea(A); await d_entra(B, r4.stanza);
      for (let g = 0; g < 40; g++) {
        const s = await d_stato(A);
        if (s.tiro >= 2) break;
        await passoDiSerie(A, B);
      }
      await B.pag.evaluate(() => window.__test.dischetto.chiudi());
      for (let g = 0; g < 200; g++) {
        const s = await d_stato(A);
        if (s.fase === 'fine') break;
        if (s.fase === 'scegli') await d_scegli(A, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
        await d_giro(A);
      }
      const s4 = await d_stato(A);
      di(s4.fase === 'fine' && s4.causa === 'incompiuta',
         'G4) l\'altro sparisce: la serie si chiude INCOMPIUTA, non con una vittoria',
         'fase=' + s4.fase + ' causa=' + s4.causa + ' esito=' + s4.fine);
      di(s4.fine === null || s4.fine === 'incompiuta' || s4.fine === '',
         'G5) e non assegna punti a chi resta (chi spegne il telefono dell\'altro non vince)',
         'fine=' + JSON.stringify(s4.fine));

      /* G6 — il server spento del tutto */
      const r6 = await d_crea(A); await d_entra(B, r6.stanza);
      cg.stato.su = false;
      await d_giro(A).catch(() => {});
      const s6 = await d_stato(A);
      cg.stato.su = true;
      di(s6 && typeof s6.rete === 'string' && s6.rete !== 'su',
         'G6) col server spento il gioco dice che la rete e\' assente, e non si schianta',
         'rete=' + (s6 && s6.rete));

      for (const P of [A, B]) await P.ctx.close();
      aperti.length = aperti.length - 2;
      cg.chiudi();
    }

    sg.chiudi();
  } catch (e) {
    esploso = e;
  } finally {
    for (const P of aperti) { try { await P.ctx.close(); } catch (x) {} }
    try { await browser.close(); } catch (x) {}
    try { sg.chiudi(); } catch (x) {}
  }

  if (esploso) {
    console.error('\nIL BANCO E\' ESPLOSO: ' + (esploso && esploso.message));
    console.error(esploso && esploso.stack);
    process.exit(2);
  }
  const rossi = esiti.filter(x => !x).length;
  console.log('\n  ' + (esiti.length - rossi) + ' su ' + esiti.length + (rossi ? ('   ROSSI: ' + rossi) : '   verde'));
  process.exit(rossi ? 1 : 0);
})();
