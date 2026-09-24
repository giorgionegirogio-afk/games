/* =====================================================================
   _q-volto.js — IL VOLTO DELLA SFIDA DAL DISCHETTO (voce #147, compito 1)

   NASCE ROSSO, ed e' dichiarato: sul gioco del merge-base `999fbf8` non
   esistono `#sfidaDischetto`, `__test.respiro`, ne' la riga di nastro di
   tipo 15. Il banco stampa la causa vera invece di un'eccezione.

   SETTE GRUPPI, e ognuno risponde a una domanda che il cantiere ha
   dichiarato PRIMA nel suo progetto.

   A) LA PIEGA. E' il vincolo che comanda tutto il cantiere. Il commento
      accanto a `btnSfidaCarta` porta tre numeri che non si possono
      muovere, e questo banco li ricontrolla ai due formati che gli altri
      usano gia'. I numeri di PRIMA sono MISURATI, non indovinati
      (strumenti/_sonda-147-piega.js, 24 settembre 2026, merge-base
      999fbf8, identici a 800x360 e a 915x412):

        CERCA AVVERSARIO@220 · prima riga@329 · primo GUARDA@308
        SFIDA DI CARTA a lista vuota@347 · TORNA AL MENU@418
        altezza scorribile 466

      Si noti il 418: la riga delle azioni sta GIA' sotto la piega ai due
      formati, e `.ov` ha `overflow-y:auto`. Quindi «sotto la piega» in
      questa schermata significa «una scrollata», non «perduto» — e la
      voce nuova si giudica con quel metro, dichiarando il numero.

   B) IL PANNELLO ESISTE E FA. Non «c'e' un div»: si preme CREA e ne esce
      un codice di sei caratteri; l'altro telefono lo incolla, preme
      ENTRA, e l'appuntamento si chiude su tutti e due. Un pannello che
      si apre e non fa niente e' il falso `_crit-volto-muto`.

   C) IL TABELLONE. Durante la serie si deve vedere il punteggio, il
      tiro, il proprio ruolo e i tiri gia' fatti; alla fine si deve
      vedere come e' finita. E — la meta' che conta — NON si deve vedere
      la mossa dell'altro prima della rivelazione: e' il falso
      `_crit-volto-spione`, e il banco lo cerca confrontando il testo che
      il pannello mostra su A con la mossa che B ha davvero posato.

   D) IL DITO CHE DIVENTA UNA MOSSA. Le tre porte del duello, in
      cattura, devono POSARE la mossa e NON risolvere il duello: se
      risolvessero, `Dischetto.risolviDuello` non troverebbe mai
      `phase==='zone'` e le righe di tipo 6 uscirebbero doppie. Si
      misura che dopo un giro di dito la fase del dischetto e'
      `attesa-impegno`, che `Duel.phase` e' ancora `zone`, e che il
      numero di tick della barra e' finito nella mossa.

   E) IL RESPIRO. Quattro numeri, non un'impressione:
        E1  dura esattamente K: colmo al tick K, e i valori a 0, K/2 e K
            sono distinti e crescenti (contro `_crit-respiro-piatto`);
        E2  a orologio fermo TIENE, e non e' zero (contro
            `_crit-respiro-rotella`);
        E3  la partita non cambia di un bit: impronta, punteggio e
            conto dei sorteggi identici con e senza (contro
            `_crit-respiro-motore`);
        E4  non consuma un sorteggio di GIOCO: il contatore non si
            muove di uno (contro `_crit-respiro-dado`).

   F) ZERO RETE. L'idioma di `_q-carta` D5, copiato e non reinventato:
      rete gia' bloccata, TACCA dopo l'apertura di SFIDA (che chiede
      /api/entra per progetto, e non e' una colpa del dischetto), e da
      li' in avanti il contatore non si muove finche' un dito non preme.
      SI CONTA IL DELTA, NON IL TOTALE.

   G) LA CURA DEL BUCO DI VERIFICA DIFFERITA. Qui il banco e' nato da una
      MISURA e non da una lettura, e il numero ha cambiato il disegno
      della cura (strumenti/_sonda-147-quattordici.js, 24 settembre 2026,
      merge-base 999fbf8, serie vera fra due telefoni, tre tiri):

        righe in memoria 17 · righe rilette 11 · nastro 173 caratteri
        per tipo nel testo: {3: 2, 6: 9}      <- ZERO righe di tipo 14
        verdetto del giudice: INCOMPLETO / rose-assenti

      Cioe': il #146 ha scritto «vagliaNastro non pretende le righe di
      tipo 14», ma le 14 NON ARRIVANO NEMMENO NEL NASTRO — `serializza`
      non ha un ramo per il tipo 14 e `deserializza` nemmeno. La
      testimonianza vive in memoria e muore alla prima serializzazione.
      Quindi la cura e' doppia: le 14 devono VIAGGIARE, e il giudice le
      deve PRETENDERE.

      G misura i due versi:
        G1  un nastro di una serie vera porta le sue testimonianze;
        G2  lo stesso nastro con le 14 TOLTE (e la 15 lasciata: e' la
            carta d'identita' della partita) -> INCOMPLETO /
            testimonianze-assenti, mai un'accusa.

   uso:  node strumenti/_q-volto.js [--gioco f.html] [--solo A,B,C]
   esce  0 verde · 1 il gioco e' rosso · 2 il banco e' esploso ·
         3 prova nulla (il file indicato non esiste)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
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
const vuole = g => !SOLO || SOLO.includes(g);

const esiti = [];
function di(ok, nome, det) {
  esiti.push(!!ok);
  console.log((ok ? '  OK  ' : '  NO  ') + nome + (det ? '   [' + det + ']' : ''));
}

/* =====================================================================
   I NUMERI DI PRIMA, MISURATI E NON INDOVINATI.
   Fonte: strumenti/_sonda-147-piega.js sul merge-base 999fbf8, il
   24 settembre 2026, identici a 800x360 e a 915x412.
   ===================================================================== */
const PIEGA_PRIMA = { cerca: 220, primaRiga: 329, primoGuarda: 308, cartaVuota: 347 };

/* La lettura della disposizione sta in un posto solo: due misure della
   stessa cosa scritte in due modi sono due misure che aspettano di
   divergere. E' la stessa di _sonda-147-piega.js, parola per parola. */
const LEGGI_PIEGA = async () => {
  const t = window.__test;
  t.sfida.sfide = [];
  for (let i = 0; i < 5; i++) t.sfida.sfide.push({
    id: i + 1, attaccante: 'x', seme: '7' + i, taglia: 5, gol_a: 3, gol_d: 2,
    giocata: new Date().toISOString(), vista: i > 1, verificata: 0, nome: 'SQUADRA ' + i });
  t.sfida.apri();
  for (let i = 0; i < 60 && t.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
  t.sfida.dipingi();
  const r = e => { const x = e && e.getBoundingClientRect(); return x ? Math.round(x.bottom) : -1; };
  const out = {
    h: innerHeight,
    righe: document.querySelectorAll('#sfLista .sfriga').length,
    cerca: r(document.getElementById('btnSfidaCerca')),
    primaRiga: r(document.querySelector('#sfLista .sfriga')),
    primoGuarda: r(document.querySelector('#sfLista [data-guarda]')),
  };
  t.sfida.sfide = [];
  t.sfida.dipingi();
  out.cartaVuota = r(document.getElementById('btnSfidaCarta'));
  out.discoVuota = r(document.getElementById('btnSfidaDischetto'));
  const ov = document.getElementById('sfida');
  out.scorribile = ov ? ov.scrollHeight : -1;
  return out;
};

/* ---------------------------------------------- le maniglie sul gioco */
const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);

const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });

async function passoDiSerie(A, B) {
  for (const P of [A, B]) {
    const s = await d_stato(P);
    if (s && s.fase === 'scegli') await d_scegli(P, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
  }
  await Promise.all([d_giro(A), d_giro(B)]);
}

/* =====================================================================
   TOGLIERE LE RIGHE DI TIPO 14 DA UN NASTRO, SENZA ROMPERLO.

   Il nastro e' `1|MOTORE_V|tasti|pezzo;pezzo;...` e ogni pezzo comincia
   con `dTick,tipo,dMs`. I due delta sono RELATIVI al pezzo precedente:
   togliere un pezzo e basta sposterebbe in avanti tutto quel che viene
   dopo, e il falso misurerebbe la propria sbadataggine invece del
   giudice. Si tolgono i pezzi RIVERSANDO i loro due delta sul primo
   pezzo superstite: il nastro che ne esce e', riga per riga, lo stesso
   nastro meno le testimonianze.
   ===================================================================== */
function togliTipo(nastro, tipo) {
  const p = String(nastro).split('|');
  if (p.length < 4) return nastro;
  const dentro = (p[3] || '').split(';').filter(Boolean);
  const fuori = [];
  let dT = 0, dMs = 0, tolti = 0;
  for (const pezzo of dentro) {
    const v = pezzo.split(',');
    if (Number(v[1]) === tipo) { dT += Number(v[0]); dMs += Number(v[2]); tolti++; continue; }
    v[0] = String(Number(v[0]) + dT); v[2] = String(Number(v[2]) + dMs);
    dT = 0; dMs = 0;
    fuori.push(v.join(','));
  }
  return { testo: p[0] + '|' + p[1] + '|' + p[2] + '|' + fuori.join(';'), tolti };
}

function contaTipi(nastro) {
  const c = {};
  for (const pezzo of (String(nastro).split('|')[3] || '').split(';')) {
    if (!pezzo) continue;
    const t = Number(pezzo.split(',')[1]);
    c[t] = (c[t] || 0) + 1;
  }
  return c;
}

/* ===================================================================== */
(async () => {
  const srv = await T.serviGioco(PROVA);
  const browser = await chromium.launch();
  try {

    /* ================================================== A — LA PIEGA */
    if (vuole('A')) {
      console.log('\nA) LA PIEGA — la disposizione della schermata SFIDA');
      for (const vp of [{ width: 800, height: 360 }, { width: 915, height: 412 }]) {
        const C = await T.apri(browser, srv.porta, vp);
        try {
          const m = await C.pag.evaluate(LEGGI_PIEGA);
          const fermi = m.righe === 5 &&
            m.cerca === PIEGA_PRIMA.cerca &&
            m.primaRiga === PIEGA_PRIMA.primaRiga &&
            m.primoGuarda === PIEGA_PRIMA.primoGuarda;
          di(fermi, 'A1@' + vp.width + 'x' + vp.height + ') CERCA, prima riga e primo GUARDA non si muovono di un pixel',
            'CERCA@' + m.cerca + ' (prima ' + PIEGA_PRIMA.cerca + ')' +
            ' · primaRiga@' + m.primaRiga + ' (prima ' + PIEGA_PRIMA.primaRiga + ')' +
            ' · GUARDA@' + m.primoGuarda + ' (prima ' + PIEGA_PRIMA.primoGuarda + ')' +
            ' · righe ' + m.righe);
          di(m.cartaVuota === PIEGA_PRIMA.cartaVuota,
            'A2@' + vp.width + 'x' + vp.height + ') SFIDA DI CARTA a lista vuota non si muove',
            'CARTA@' + m.cartaVuota + ' (prima ' + PIEGA_PRIMA.cartaVuota + ')');
          di(m.discoVuota > m.cartaVuota && m.discoVuota <= m.scorribile,
            'A3@' + vp.width + 'x' + vp.height + ') la voce nuova esiste, sta SOTTO la carta ed e\' raggiungibile',
            'DISCHETTO@' + m.discoVuota + ' · CARTA@' + m.cartaVuota +
            ' · piega ' + m.h + ' · scorribile ' + m.scorribile);
        } finally { await C.ctx.close(); }
      }
    }

    /* ============================== B/C/D — il pannello e la serie */
    if (vuole('B') || vuole('C') || vuole('D')) {
      const cass = await T.serviCassetta({});
      const A = await T.apri(browser, srv.porta);
      const B = await T.apri(browser, srv.porta);
      try {
        await T.collega(A, cass.porta, 'ALFA');
        await T.collega(B, cass.porta, 'BETAX');
        await T.entra(A); await T.entra(B);

        /* OGNI GRUPPO STA NEL SUO `if`, e non e' pedanteria: senza, un
           `--solo D` farebbe girare anche B e C, e su un gioco FALSO la
           serie di C si inceppa e D non arriva mai a misurare. Il falso
           scapperebbe per assenza della prova, che e' il modo piu' subdolo
           di assolvere qualcuno (lezione del #146: un'assenza vale prova
           nulla, non un verde). */
        if (vuole('B')) {
          /* ------------------------------------------ B — il pannello */
          console.log('\nB) IL PANNELLO — creare e entrare col dito, non da __test');
          const apriPannello = P => P.pag.evaluate(() => {
            const t = window.__test;
            t.sfida.apri();
            const b = document.getElementById('btnSfidaDischetto');
            if (!b) return { ok: false, perche: 'btnSfidaDischetto non esiste' };
            b.click();
            const pan = document.getElementById('sfidaDischetto');
            if (!pan) return { ok: false, perche: '#sfidaDischetto non esiste' };
            return { ok: !pan.classList.contains('hidden'), perche: 'aperto' };
          });
          const a1 = await apriPannello(A);
          di(a1.ok, 'B1) dalla schermata SFIDA il pannello del dischetto si apre col dito', a1.perche);

          const a2 = await A.pag.evaluate(async () => {
            const b = document.getElementById('btnDsCrea');
            if (!b) return { ok: false, perche: 'btnDsCrea non esiste' };
            b.click();
            for (let i = 0; i < 80; i++) {
              const v = (document.getElementById('dsMio') || {}).value || '';
              if (/^[0-9A-Z]{6}$/.test(v)) return { ok: true, codice: v };
              await new Promise(r => setTimeout(r, 50));
            }
            return { ok: false, perche: 'nessun codice nel campo', codice: (document.getElementById('dsMio') || {}).value || '' };
          });
          di(a2.ok, 'B2) CREA LA SFIDA da\' un codice di sei caratteri da copiare',
            a2.ok ? 'codice ' + a2.codice : a2.perche);

          let entrata = { ok: false, perche: 'il codice non c\'era' };
          if (a2.ok) {
            await apriPannello(B);
            entrata = await B.pag.evaluate(async cod => {
              const i = document.getElementById('dsIn'), b = document.getElementById('btnDsEntra');
              if (!i || !b) return { ok: false, perche: 'dsIn o btnDsEntra non esistono' };
              i.value = cod; b.click();
              for (let k = 0; k < 120; k++) {
                const s = window.__test.dischetto.stato;
                if (s.fase === 'scegli' || s.fase === 'pronto' || s.fase === 'fine') return { ok: s.fase !== 'fine', fase: s.fase, causa: s.causa, seme: s.seme };
                await new Promise(r => setTimeout(r, 50));
              }
              return { ok: false, perche: 'l\'appuntamento non si e\' chiuso' };
            }, a2.codice);
          }
          di(entrata.ok, 'B3) ENTRA COL CODICE chiude l\'appuntamento sul secondo telefono',
            entrata.ok ? 'fase ' + entrata.fase + ' · seme ' + entrata.seme : (entrata.perche || (entrata.fase + '/' + entrata.causa)));

          /* il primo telefono deve accorgersene da se': un giro di rete */
          await d_giro(A);
          const sa0 = await d_stato(A);
          di(sa0.fase === 'scegli' || sa0.fase === 'pronto',
            'B4) anche chi ha creato arriva alla serie, senza toccare altro', 'fase ' + sa0.fase + ' · causa ' + sa0.causa);
        }

        if (vuole('C')) {
          /* ------------------------------------------ C — il tabellone */
          console.log('\nC) IL TABELLONE — che cosa si vede, e che cosa NON si deve vedere');
          const vista = P => P.pag.evaluate(() => {
            const g = id => { const e = document.getElementById(id); return e ? (e.textContent || '') : null; };
            return { stato: g('dsStato'), punti: g('dsPunti'), tiri: g('dsTiri'),
                     fascia: g('dsFascia'), mio: (document.getElementById('dsMio') || {}).value || '' };
          });

          /* C STA IN PIEDI DA SOLA. Se B non ha girato (--solo C) qui non
             c'e' nessuna serie aperta, e un gruppo che misurasse il nulla
             darebbe un referto senza prove — cioe' un falso assolto per
             assenza. Si apre l'appuntamento dal pannello, che e' anche il
             modo in cui lo aprirebbe un dito. */
          {
            const s0 = await d_stato(A);
            if (s0.fase !== 'scegli' && s0.fase !== 'attesa-impegno') {
              const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
              if (r && r.stanza) {
                await B.pag.evaluate(async c => await window.__test.dischetto.entra(c), r.stanza);
                await d_giro(A);
              }
            }
          }

          /* =====================================================================
             C1 — IL GESTO NON E' FINITO, E L'ALTRO NON PUO' AVER PARLATO.

             LA PRIMA STESURA DI QUESTA PROVA MISURAVA UNA COSA
             IRRAGGIUNGIBILE, e vale la pena scriverlo perche' il verde era
             gia' in tasca. Cercava la mossa dell'altro nel tabellone
             «prima della rivelazione». Misurando si e' scoperto che quella
             mossa NON ARRIVA MAI sul telefono prima che io mi sia
             impegnato, e non per merito del pannello: `manda()` spedisce
             la rivelazione solo se ha in casa l'impegno dell'altro, quindi
             finche' io non parlo l'altro non puo' rivelare. La proprieta'
             e' del PROTOCOLLO (#146), non del volto, e un cancello che la
             rimisura sul pannello sarebbe un attestatore: passerebbe
             sempre, anche su un pannello scritto male.

             Quel che il PANNELLO puo' rompere, e che qui si misura, e' un
             istante piu' preciso: mentre la barra corre sotto il dito, il
             gesto non e' finito e l'impegno NON deve essere partito. Un
             pannello ansioso — che si impegna appena il dito lascia la
             mira, invece di aspettare la barra — farebbe partire l'impegno
             a metto gesto, l'altro potrebbe rivelare, e la rivelazione
             arriverebbe con la barra ancora in corsa. E' il falso
             `_crit-volto-ansioso`, e questa e' la prova che lo morde.

             COL TESTIMONE: fermata la barra, la stessa sonda deve vedere
             eccome la rivelazione dell'altro. Senza il testimone, «niente
             R nella cassetta» e «cassetta vuota» sono lo stesso referto
             (lezione 18, e il #146 l'ha pagata al suo B2bis).
             ===================================================================== */
          const sA = await d_stato(A), sB = await d_stato(B);
          /* il tiratore lo decide il seme, non il banco: si prende quello che c'e' */
          const TIR = sA.ruolo === 't' ? A : B, POR = sA.ruolo === 't' ? B : A;
          const sTIR = sA.ruolo === 't' ? sA : sB;
          const latoPOR = sA.ruolo === 't' ? 'b' : 'a';
          const vistoR = P => P.pag.evaluate(t => {
            const v = window.__test.dischetto.spia().visti || [];
            return v.filter(x => x.k === 'R' && x.t === t).length;
          }, sTIR.tiro);

          /* il portiere sceglie e parla; il tiratore comincia il gesto e NON lo finisce */
          await d_scegli(POR, mossaPara(sTIR.tiro));
          const mira = await TIR.pag.evaluate(() => {
            window.__test.Duel.pickZone(2, 0.72, 0.38);
            const s = window.__test.dischetto.stato;
            return { barra: !!s.barra, fase: s.fase };
          });
          for (let k = 0; k < 4; k++) { await d_giro(TIR); await d_giro(POR); }
          await P_ridipingi(TIR);
          const vTIR = await vista(TIR);
          const rPrima = await vistoR(TIR);
          const barraViva = await TIR.pag.evaluate(() => !!window.__test.dischetto.stato.barra);
          /* IL TESTIMONE: si ferma la barra, e adesso la rivelazione deve arrivare */
          await TIR.pag.evaluate(() => { window.__test.Duel.stopPower(); });
          for (let k = 0; k < 4; k++) { await d_giro(TIR); await d_giro(POR); }
          const rDopo = await vistoR(TIR);

          const c1vivo = !!(vTIR.stato && vTIR.stato.replace(/\s+/g, '').length > 4);
          const c1 = c1vivo && mira.barra && barraViva && rPrima === 0 && rDopo > 0;
          di(c1, 'C1) mentre la barra corre l\'impegno non e\' partito, e nessuna rivelazione e\' arrivata',
            (c1vivo ? '' : 'PROVA NULLA: il tabellone non dice niente · ') +
            (rDopo > 0 ? '' : 'PROVA NULLA: il testimone non ha visto la rivelazione nemmeno dopo · ') +
            'barra alla mira ' + mira.barra + ' · barra dopo quattro giri ' + barraViva +
            ' · rivelazioni viste: ' + rPrima + ' con la barra in corsa, ' + rDopo + ' dopo il rilascio' +
            ' · pannello: ' + String(vTIR.stato || '').replace(/\s+/g, ' ').slice(0, 90));

          /* si gioca la serie fino in fondo e si guarda che cosa dice */
          let giri = 0;
          for (; giri < 400; giri++) {
            const s = await d_stato(A);
            if (s.fase === 'fine') break;
            await passoDiSerie(A, B);
          }
          await P_ridipingi(A);
          const fin = await d_stato(A), vFin = await vista(A);
          const testoFin = ((vFin.stato || '') + ' ' + (vFin.punti || '') + ' ' + (vFin.tiri || '')).toUpperCase();
          di(fin.fase === 'fine' && /VINT|PERS|PAR|FINIT/.test(testoFin),
            'C2) alla fine il pannello dice come e\' finita, in italiano',
            'fase ' + fin.fase + ' · fine ' + fin.fine + ' · causa ' + fin.causa +
            ' · pannello: ' + (vFin.stato || '(niente)').replace(/\s+/g, ' ').slice(0, 120));
          di(!!(vFin.punti && /\d\s*[-–]\s*\d/.test(vFin.punti)) && !!(vFin.tiri && vFin.tiri.length),
            'C3) il tabellone porta il punteggio e i tiri gia\' fatti',
            'punti «' + (vFin.punti || '') + '» · tiri «' + (vFin.tiri || '').replace(/\s+/g, ' ').slice(0, 80) + '»');
        }

        /* ----------------------------- D — il dito che diventa mossa */
        console.log('\nD) IL DITO — le tre porte in cattura posano la mossa e non risolvono');
        const rD = await A.pag.evaluate(async () => {
          const t = window.__test;
          const r = await t.dischetto.crea();
          if (!r || !r.ok) return { ok: false, perche: 'crea: ' + (r && r.errore) };
          return { ok: true, stanza: r.stanza };
        });
        if (!rD.ok) { di(false, 'D0) una seconda sfida per provare il dito', rD.perche); }
        else {
          await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), rD.stanza);
          await d_giro(A);
          const s = await d_stato(A);
          if (s.fase !== 'scegli') di(false, 'D0) la seconda sfida arriva a scegliere', 'fase ' + s.fase + '/' + s.causa);
          else {
            const dito = await A.pag.evaluate(() => {
              const t = window.__test, D = t.Duel;
              const prima = { fase: t.dischetto.stato.fase, duel: D.phase, righe: t.registroRighe };
              if (t.dischetto.stato.ruolo === 't') {
                D.pickZone(2, 0.72, 0.38);
                for (let i = 0; i < 25; i++) t.simulate(1 / 60);
                D.stopPower();
              } else {
                D.pickKeeper(1);
              }
              const s = t.dischetto.stato;
              return { prima, ruolo: s.ruolo, fase: s.fase, duel: D.phase,
                       mossa: s.mossa || null, righe: t.registroRighe };
            });
            di(dito.fase === 'attesa-impegno' && dito.duel === 'zone',
              'D1) il dito posa la mossa e il duello resta in attesa (phase zone)',
              'ruolo ' + dito.ruolo + ' · fase ' + dito.fase + ' · Duel.phase ' + dito.duel +
              ' (prima ' + dito.prima.duel + ')');
            const m = dito.mossa;
            const buona = dito.ruolo === 't'
              ? !!(m && m.ruolo === 't' && m.z === 2 && m.ps > 0)
              : !!(m && m.ruolo === 'p' && m.z === 1);
            di(buona, 'D2) la mossa posata porta la zona e — se tira — i tick della barra',
              'mossa ' + JSON.stringify(m));
            di(dito.righe === dito.prima.righe,
              'D3) la cattura non scrive una riga di comando: le 6 le scrive chi risolve',
              'righe ' + dito.prima.righe + ' -> ' + dito.righe);
          }
        }
      } finally {
        await A.ctx.close(); await B.ctx.close(); cass.chiudi();
      }
    }

    /* ================================================ E — IL RESPIRO */
    if (vuole('E')) {
      console.log('\nE) IL RESPIRO — dura K, tiene, e non costa un sorteggio di gioco');
      const P = await T.apri(browser, srv.porta);
      try {
        const c = await P.pag.evaluate(() => !!(window.__test && window.__test.respiro));
        if (!c) di(false, 'E0) il gioco espone window.__test.respiro', 'assente sul gioco di oggi');
        else {
          const e1 = await P.pag.evaluate(() => {
            const t = window.__test;
            t.semina(20260924);
            t.startMatch(1, 1, { size: 5, sponde: 'gabbia' });
            t.ritardo(12);
            t.respiro.accendi();
            /* un comando entra in coda: da qui il fiato deve partire */
            t.dita(0.8, 0, false);
            const letto = [];
            for (let i = 0; i <= 12; i++) {
              t.disegna();
              letto.push(+t.respiro.stato.carica.toFixed(4));
              t.simulate(1 / 60);
            }
            return { letto, K: t.respiro.stato.K };
          });
          const a0 = e1.letto[0], aM = e1.letto[6], aK = e1.letto[12];
          di(e1.K === 12 && aK >= 0.999 && aM > a0 && aK > aM,
            'E1) il fiato dura esattamente K e cresce: colmo sul tick del comando',
            'K ' + e1.K + ' · carica a 0/' + Math.round(12 / 2) + '/12 = ' + a0 + ' / ' + aM + ' / ' + aK);

          const e2 = await P.pag.evaluate(() => {
            const t = window.__test;
            t.semina(20260924);
            t.startMatch(1, 1, { size: 5, sponde: 'gabbia' });
            t.ritardo(24);
            t.respiro.accendi();
            t.dita(0.8, 0, false);
            for (let i = 0; i < 12; i++) { t.disegna(); t.simulate(1 / 60); }
            const prima = +window.__test.respiro.stato.carica.toFixed(6);
            /* l'orologio si ferma: non si simula piu' niente, si disegna
               e basta. E' il fiato trattenuto. */
            for (let i = 0; i < 90; i++) t.disegna();
            const dopo = +window.__test.respiro.stato.carica.toFixed(6);
            return { prima, dopo };
          });
          di(e2.prima > 0.05 && Math.abs(e2.dopo - e2.prima) < 1e-6,
            'E2) a orologio fermo il fiato TIENE e non e\' zero: nessuna rotella',
            'carica ' + e2.prima + ' -> ' + e2.dopo + ' dopo 90 fotogrammi fermi');

          const e34 = await P.pag.evaluate(() => {
            const gira = (respiro) => {
              const t = window.__test;
              t.semina(20260924);
              t.startMatch(1, 1, { size: 5, sponde: 'gabbia' });
              t.ritardo(10);
              if (respiro) t.respiro.accendi(); else t.respiro.spegni();
              const s0 = t.sorteggi;
              t.dita(0.8, 0.2, true);
              for (let i = 0; i < 240; i++) { t.disegna(); t.simulate(1 / 60); }
              t.dita(null);
              const out = { impronta: 0, score: t.score.slice(), sorteggi: t.sorteggi - s0,
                            palla: [Math.round(t.ball.x * 1e6), Math.round(t.ball.y * 1e6)] };
              out.impronta = t.players.reduce((a, p, i) =>
                (a * 31 + Math.round(p.x * 1e4) + Math.round(p.y * 1e4) * 7 + i) >>> 0, 17);
              t.ritardo(0);
              return out;
            };
            return { con: gira(true), senza: gira(false) };
          });
          const ug = e34.con.impronta === e34.senza.impronta &&
            e34.con.score[0] === e34.senza.score[0] && e34.con.score[1] === e34.senza.score[1] &&
            e34.con.palla[0] === e34.senza.palla[0] && e34.con.palla[1] === e34.senza.palla[1];
          di(ug, 'E3) la partita non cambia di un bit con e senza respiro',
            'impronta ' + e34.con.impronta + ' / ' + e34.senza.impronta +
            ' · palla ' + e34.con.palla.join(',') + ' / ' + e34.senza.palla.join(',') +
            ' · punteggio ' + e34.con.score.join('-') + ' / ' + e34.senza.score.join('-'));
          di(e34.con.sorteggi === e34.senza.sorteggi,
            'E4) il respiro non consuma un sorteggio di GIOCO',
            'sorteggi ' + e34.con.sorteggi + ' con · ' + e34.senza.sorteggi + ' senza · delta ' +
            (e34.con.sorteggi - e34.senza.sorteggi));
        }
      } finally { await P.ctx.close(); }
    }

    /* ================================================ F — ZERO RETE */
    if (vuole('F')) {
      console.log('\nF) ZERO RETE — la prima richiesta parte quando un dito preme');
      const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, isMobile: true, hasTouch: true, locale: 'it-IT' });
      const pag = await ctx.newPage();
      const chiamate = [];
      await pag.route('**/*', route => {
        const u = route.request().url();
        if (/CALCETTO-il-gioco\.html/.test(u)) return route.continue();
        chiamate.push(u);
        return route.abort();
      });
      try {
        await pag.goto(`http://127.0.0.1:${srv.porta}/CALCETTO-il-gioco.html`, { waitUntil: 'load' });
        await pag.waitForFunction('window.__test !== undefined', null, { timeout: 30000 });
        await pag.evaluate(() => { window.requestAnimationFrame = () => 0; });
        await pag.evaluate(() => { const t = window.__test; t.dismissSplash && t.dismissSplash(); if (t.save) t.save.tutorialDone = 1; });
        await pag.evaluate(async () => {
          window.__test.sfida.apri();
          for (let i = 0; i < 40 && window.__test.sfida.occupato; i++) await new Promise(r => setTimeout(r, 50));
        });
        await pag.waitForTimeout(250);
        const tacca = chiamate.length;
        const apre = await pag.evaluate(async () => {
          const b = document.getElementById('btnSfidaDischetto');
          if (!b) return false;
          b.click();
          await new Promise(r => setTimeout(r, 300));
          const p = document.getElementById('sfidaDischetto');
          return !!(p && !p.classList.contains('hidden'));
        });
        await pag.waitForTimeout(400);
        const delta = chiamate.length - tacca;
        di(apre && delta === 0,
          'F1) aprire il pannello del dischetto non chiede niente alla rete',
          'delta ' + delta + ' (tacca ' + tacca + ') · pannello aperto: ' + apre +
          (delta ? ' · ' + chiamate.slice(tacca).join(' ') : ''));
      } finally { await ctx.close(); }
    }

    /* ======================================= G — LA CURA DEL GIUDICE */
    if (vuole('G')) {
      console.log('\nG) LA CURA — le testimonianze viaggiano, e il giudice le pretende');
      const cass = await T.serviCassetta({});
      const A = await T.apri(browser, srv.porta);
      const B = await T.apri(browser, srv.porta);
      try {
        await T.collega(A, cass.porta, 'ALFA');
        await T.collega(B, cass.porta, 'BETAX');
        await T.entra(A); await T.entra(B);
        const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
        await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);
        for (let g = 0; g < 300; g++) {
          const s = await d_stato(A);
          if (s.fase === 'fine' || s.tiro >= 4) break;
          await passoDiSerie(A, B);
        }
        const nastro = await A.pag.evaluate(() => window.__test.nastro());
        const st = await d_stato(A);
        const tipi = contaTipi(nastro);
        di((tipi[14] || 0) >= 2 && (tipi[15] || 0) === 1,
          'G1) il nastro di una serie dal dischetto porta le sue testimonianze e la sua carta d\'identita\'',
          'per tipo ' + JSON.stringify(tipi) + ' · ' + nastro.length + ' caratteri · tiri ' + st.tiro);

        const giudizio = (P, testo) => P.pag.evaluate(([testo, seme]) => {
          const v = window.__test.giudica(testo, [0, 0], { seme: String(seme), taglia: 5 });
          return { verdetto: v.verdetto, causa: v.causa };
        }, [testo, st.seme]);

        const conLe14 = await giudizio(A, nastro);
        const spogliato = togliTipo(nastro, 14);
        const senzaLe14 = await giudizio(A, spogliato.testo);
        di(senzaLe14.causa === 'testimonianze-assenti' && senzaLe14.verdetto === 'INCOMPLETO',
          'G2) tolte le testimonianze, il giudice SI ASTIENE: INCOMPLETO, mai un\'accusa',
          'con le 14: ' + conLe14.verdetto + '/' + conLe14.causa +
          ' · senza (tolte ' + spogliato.tolti + '): ' + senzaLe14.verdetto + '/' + senzaLe14.causa);
        /* IL TESTIMONE DELLA CURA (lezione 18, e il #146 l'ha pagata al
           suo B2bis). Un controllo che dicesse SEMPRE
           «testimonianze-assenti» darebbe G2 verde senza discriminare
           niente. G3 pretende due cose insieme: che con le 14 al loro
           posto quella causa NON esca, e che togliere le 14 non produca
           mai un'accusa — NON TORNA e' l'unico verdetto che muove punti,
           e per un nastro spogliato sarebbe un innocente condannato da
           una prova mancante. */
        di(conLe14.causa !== 'testimonianze-assenti' && senzaLe14.verdetto !== 'NON TORNA' && spogliato.tolti > 0,
          'G3) il controllo DISCRIMINA: con le 14 non si astiene per quella causa, e non accusa nessuno',
          'tolte ' + spogliato.tolti + ' · con le 14: ' + conLe14.verdetto + '/' + conLe14.causa +
          ' · senza: ' + senzaLe14.verdetto + '/' + senzaLe14.causa);
      } finally {
        await A.ctx.close(); await B.ctx.close(); cass.chiudi();
      }
    }

  } finally {
    await browser.close();
    srv.chiudi();
  }

  const no = esiti.filter(x => !x).length;
  console.log('\n' + (esiti.length - no) + '/' + esiti.length + ' verdi' + (no ? ' — ' + no + ' ROSSI' : ''));
  process.exit(no ? 1 : 0);
})().catch(e => { console.error('BANCO ESPLOSO: ' + (e && e.stack || e)); process.exit(2); });

/* un ridipinto del pannello senza aspettare il timer: il battito e' la
   STESSA porta che usa l'orologio del gioco, chiamata a mano. Un banco
   che aspetta un orologio misura l'orologio. */
async function P_ridipingi(P) {
  return P.pag.evaluate(() => { const d = window.__test.dischetto; if (d.ridipingi) d.ridipingi(); });
}
