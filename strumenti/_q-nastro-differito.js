/* =====================================================================
   _q-nastro-differito.js — UNA SERIE ONESTA DAL DISCHETTO SI CONFERMA
   (voce #148, compito 1)

   NASCE ROSSO, ed e' dichiarato: sul gioco del merge-base `01265bc` il
   nastro di una serie dal dischetto non porta le rose, e il giudice si
   astiene con `INCOMPLETO/rose-assenti` (misurato,
   strumenti/_sonda-148-differita.js).

   CHE COSA MISURA, e perche' ogni lettera e' li'.

   A) LA SERIE ONESTA ARRIVA A «TORNA». E' il cuore, ed e' la cosa che
      l'onda D ha costruito per tutti tranne che per il dischetto: un
      verificatore differito che, mesi dopo, rigioca il nastro e
      CONFERMA il punteggio che le due persone hanno visto. Si gioca una
      serie vera fra due telefoni, fino in fondo, e si giudica il nastro
      di TUTTI E DUE i capi su una TERZA pagina pulita — che e'
      esattamente quel che fa la staffetta, e che impedisce al banco di
      giudicare dentro la stessa pagina che ha appena giocato.

      LE SETTE PROVE DEL GRUPPO A, e nessuna e' un doppione:

        A1  il nastro di chi ha creato la stanza torna
        A2  e quello di chi e' entrato col codice, con lo stesso verdetto
        A3  le due righe di tipo 7 sono identiche sui due capi
        A4  TESTIMONE: lo stesso nastro con un punteggio dichiarato
            sbagliato di uno deve dare NON TORNA
        A5  la rigiocata costa i passi di una SERIE, non di una partita
        A6  e le rose scritte sono quelle VERE dei due telefoni, per lato
        A7  e la riga 15 dichiara chi ha tirato per primo

      A4 E' IL TESTIMONE, e senza di lui A1/A2 non provano niente (lezione
      18): un giudice che dicesse TORNA a qualunque cosa li darebbe verdi
      senza discriminare niente.

      A3, A6 E A7 GUARDANO IL NASTRO E NON IL VERDETTO, e non e' una
      ridondanza: e' una misura. In una serie di rigori il punteggio NON
      DIPENDE dalle rose (il duello legge le zone, la banda e D.save, non
      gli attributi), quindi tre falsi che scrivono rose sbagliate danno
      TORNA lo stesso; e un falso che dichiara il primo tiratore
      sbagliato fa cadere A1 QUASI sempre, cioe' non abbastanza per
      condannarlo. Le tre prove che confrontano il nastro con la verita'
      sono deterministiche, e sono quelle che prendono quelle bugie.

   B) LE ASTENSIONI GIUSTE RESTANO. La cura non deve comprare il verde di
      A spegnendo i rifiuti che l'onda D e il #147 hanno gia' pagato:
      testimonianze tolte, motore diverso, MOTORE_V diverso, rose tolte.
      Sono i quattro «non lo so» che non muovono un punto.

      E DAL #149 SONO OTTO. La revisione d'insieme dell'onda E ha giudicato
      lo stesso nastro onesto cambiando UNA COSA ALLA VOLTA, e tre modi su
      dieci davano NON TORNA a due persone oneste; il quarto (la versione
      del protocollo) dava TORNA a un nastro che il gioco non sa leggere.
      B5..B8 sono quei quattro casi, e pretendono la CAUSA e non solo il
      verdetto:

        B5  tolta SOLO la riga 15, le 14 restano   dischetto-assente
        B6  tolte la 15 E tutte le 14 (il residuo) duelli-senza-atti
        B7  il bit «chi ha tirato per primo» girato dischetto-primo-incoerente
        B8  la riga 15 con una versione ignota     dischetto-versione

   C) LA STAFFETTA LI SA LAVORARE. Un nastro giudicabile che il
      verificatore differito non sa prendere in mano non serve a niente.
      C1 misura il raggruppamento (un nastro del dischetto non porta
      pixel, quindi va in «qualunque@<impronta>»: e' la regola del #144
      per la finestra e quella del #142 per il motore); C2 fa girare la
      staffetta VERA, con il suo `giro()`, sopra una riga che porta quel
      nastro, e guarda la parola che manda al database.

   B E C LEGGONO IL NASTRO CHE A HA PRODOTTO: chiesti da soli con
   `--solo` non hanno niente da leggere. Il verde che conta e' quello
   della corsa intera.

   uso:  node strumenti/_q-nastro-differito.js [--gioco f.html] [--solo A,B]
   esce  0 verde · 1 il gioco e' rosso · 2 il banco e' esploso ·
         3 prova nulla (il file non esiste, o non ha la sfida dal
           dischetto, o la serie non e' mai arrivata in fondo)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const T = require('./_dischetto-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');
const S = require('./staffetta.js');

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

/* LE MOSSE SONO UNA TAVOLA FISSA, non un sorteggio: due esecuzioni dello
   stesso banco devono essere confrontabili (la stessa tavola di
   _q-dischetto.js, e per la stessa ragione). */
const mossaTiro = t => ({ ruolo: 't', z: t % 3, u: ((t * 317) % 1600) - 800, v: 200 + ((t * 211) % 600), ps: 30 + (t * 7) % 40 });
const mossaPara = t => ({ ruolo: 'p', z: (t * 2 + 1) % 3 });

const d_stato = P => P.pag.evaluate(() => window.__test.dischetto.stato);
const d_giro = P => P.pag.evaluate(async () => await window.__test.dischetto.giro());
const d_scegli = (P, m) => P.pag.evaluate(m => window.__test.dischetto.scegli(m), m);

/* le righe del nastro crudo, per tipo e per riga: si legge QUI, in Node,
   e non chiedendolo al gioco — un banco che chiede al gioco se il gioco
   ha fatto il suo lavoro non misura niente. */
function contaTipi(testo) {
  const c = {};
  for (const z of (String(testo).split('|')[3] || '').split(';')) {
    if (!z) continue;
    const t = Number(z.split(',')[1]);
    c[t] = (c[t] || 0) + 1;
  }
  return c;
}
function rigaDiTipo(testo, tipo) {
  for (const z of (String(testo).split('|')[3] || '').split(';'))
    if (z && Number(z.split(',')[1]) === tipo) return z;
  return '';
}
/* GLI ARGOMENTI DI UNA RIGA, SENZA I DUE SCARTI DI TESTA (tick e
   millisecondi). E' una riparazione del banco, non del gioco, e il banco
   l'ha pagata al primo verde: confrontando le righe INTERE, A3 diceva
   «le due rose sono DIVERSE» su due nastri che il giudice faceva tornare
   tutti e due — perche' `0,7,0,…` e `0,7,1,…` differiscono di UN
   MILLISECONDO di orologio da muro, non di una rosa. Un banco che
   accusasse il gioco del proprio cronometro sarebbe peggio di nessun
   banco: gli scarti di tempo di due telefoni non possono coincidere, e
   non devono. */
const argomentiDi = riga => riga ? riga.split(',').slice(3).join(',') : '';

/* =====================================================================
   LA ROSA IMPACCHETTATA, RIFATTA QUI IN NODE.

   E' la stessa regola di `impaccaRosa` nel gioco — numero di uomini, poi
   quattro attributi a testa, ognuno arrotondato e tenuto fra 1 e 99, con
   62 al posto di un assente — e la ripetizione e' voluta. Un banco che
   chiedesse al GIOCO quali rose ha scritto nel nastro non misurerebbe
   niente: chiederebbe all'imputato se e' innocente. E' la stessa ragione
   per cui `_nastri-bugiardi.js` legge lo schermo del nastro in Node e
   non dal gioco.
   ===================================================================== */
const attr = v => (v === null || v === undefined) ? 62
  : (Number.isFinite(Math.round(+v)) ? Math.max(1, Math.min(99, Math.round(+v))) : 62);
function impacca(rosa) {
  const r = Array.isArray(rosa) ? rosa : [];
  const n = Math.max(0, Math.min(24, r.length));
  const v = [n];
  for (let i = 0; i < n; i++) {
    const g = r[i] || {};
    v.push(attr(g.vel), attr(g.tiro), attr(g.tecnica), attr(g.tackle));
  }
  return v;
}
/* le righe di un tipo spente (diventano tipo 3, che in rilettura non fa
   niente): e' lo stesso `spegniTipo` di _nastri-bugiardi.js, che per i
   tipi del dischetto non e' esportato. */
function togliTipo(testo, tipo) {
  const p = String(testo).split('|');
  let tolti = 0;
  const pezzi = (p[3] || '').split(';').filter(Boolean).map(z => {
    const v = z.split(',');
    if (v[1] !== String(tipo)) return z;
    tolti++;
    return v[0] + ',3,' + v[2];
  });
  return { testo: p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';'), tolti };
}

/* =====================================================================
   UN ARGOMENTO SOLO, CAMBIATO IN UNA RIGA SOLA (voce #149).

   `i` conta DOPO i tre scarti di testa (dT, tipo, dMs), quindi per la riga
   15 l'indice 0 e' la versione del protocollo e l'indice 1 e' chi ha tirato
   per primo. Si cambia la PRIMA riga di quel tipo, che e' quella che
   `vagliaNastro` legge (`&& !disco`).

   UNA COSA ALLA VOLTA, ed e' la regola di `_nastri-bugiardi.js`: dT e dMs
   non si toccano, la catena dei tick resta intatta, e il nastro falso e'
   falso per UNA ragione sola. Se fosse falso per due, un rosso non direbbe
   quale delle due ha morso. */
function cambiaArg(testo, tipo, i, v) {
  const p = String(testo).split('|');
  let fatto = false, prima = null;
  const pezzi = (p[3] || '').split(';').filter(Boolean).map(z => {
    const c = z.split(',');
    if (fatto || c[1] !== String(tipo) || c.length <= 3 + i) return z;
    fatto = true; prima = c[3 + i];
    c[3 + i] = String(v);
    return c.join(',');
  });
  return { testo: p[0] + '|' + p[1] + '|' + p[2] + '|' + pezzi.join(';'), fatto, prima };
}

/* il giudizio su una pagina PULITA: e' quel che fa la staffetta, e
   impedisce al banco di giudicare dentro la pagina che ha appena giocato
   la serie (dove Dischetto.s e i suoi avvolgimenti sono ancora vivi). */
const giudizio = (Gi, testo, atteso, seme) => Gi.pag.evaluate(([testo, atteso, seme]) => {
  const v = window.__test.giudica(testo, atteso, { seme: String(seme), taglia: 5 });
  return { verdetto: v.verdetto, causa: v.causa, gol: v.gol, passi: v.passi, righe: v.righe };
}, [testo, atteso, seme]);

(async () => {
  console.log('\nIL NASTRO DEL DISCHETTO, GIUDICATO IN DIFFERITA' + (GIOCO ? '   [' + GIOCO + ']' : ''));

  const srv = await T.serviGioco(PROVA);
  /* LA CASSETTA SENZA FRENO, ed e' una riparazione pagata con un rosso.
     Il freno finto vale 60 richieste al minuto per identita', come quello
     vero, e il banco puo' aver bisogno di piu' di un appuntamento (vedi
     la scelta della serie, piu' sotto). MISURATO col freno acceso: il
     terzo appuntamento finisce «incompiuta», il quarto e il quinto
     muoiono su «rete» prima di cominciare, e il banco dichiarava PROVA
     NULLA dando la colpa alla serie. Il freno non e' quel che si misura
     qui: lo misura _q-dischetto E1, che e' il suo posto. */
  const cass = await T.serviCassetta({ frenoAcceso: false });
  const browser = await chromium.launch();
  let esploso = null;
  const aperti = [];
  try {
    const A = await T.apri(browser, srv.porta); aperti.push(A);
    const B = await T.apri(browser, srv.porta); aperti.push(B);
    const Gi = await T.apri(browser, srv.porta); aperti.push(Gi);

    const c = await A.pag.evaluate(() => ({
      disco: !!(window.__test && window.__test.dischetto),
      giudice: !!(window.__test && typeof window.__test.giudica === 'function'),
    }));
    if (!c.disco || !c.giudice) {
      console.error('PROVA NULLA: questo gioco non ha la sfida dal dischetto o non ha giudica().');
      for (const P of aperti) await P.ctx.close();
      await browser.close(); srv.chiudi(); cass.chiudi();
      process.exit(3);
    }

    await T.collega(A, cass.porta, 'ALFA');
    await T.collega(B, cass.porta, 'BETAX');
    await T.entra(A); await T.entra(B);

    /* =====================================================================
       LA SERIE, FINO IN FONDO — E CON UN PUNTEGGIO DISTINGUIBILE.

       Non basta una serie qualunque, e la ragione e' una prova che il
       banco deve poter esercitare. Dopo una serie `G.score` vale 1-0 o
       0-1: e' la rete che decide, aggiunta da `programmaRigore`. Un
       giudice che guardasse `G.score` invece dei rigori segnati
       (_crit-giudice-punteggio) sbaglierebbe — ma su una serie finita
       1-0 i due numeri COINCIDONO, e la bugia passerebbe.

       Percio' si cerca una serie il cui punteggio NON sia 1-0 ne' 0-1, e
       se in cinque appuntamenti non arriva SI DICHIARA PROVA NULLA
       invece di misurare con un metro che non distingue. E' lo stesso
       modo del G4 di _q-dischetto.js, e per la stessa ragione.
       ===================================================================== */
    const decisiva = s => (s[0] === 1 && s[1] === 0) || (s[0] === 0 && s[1] === 1);
    let sA = null, sB = null, nA = '', nB = '', giri = 0, tent = 0;
    let rosaDiA = null, rosaDiB = null;
    for (tent = 1; tent <= 5; tent++) {
      /* =====================================================================
         LE DUE ROSE SI LEGGONO PRIMA DELLA SERIE, NON DOPO.

         E' un rosso che il banco si e' preso da solo al primo giro di A6:
         due attributi su quaranta risultavano piu' bassi di UNO nel
         nastro che nel salvataggio. Non era il gioco a scrivere storto —
         era il banco a leggere tardi: una partita che finisce fa crescere
         qualche giocatore, e il nastro l'aveva scritta prima. Un banco
         che accusa il gioco della propria cronologia e' peggio di nessun
         banco (lezione 4). */
      rosaDiA = await A.pag.evaluate(() => window.__test.save.rosa);
      rosaDiB = await B.pag.evaluate(() => window.__test.save.rosa);
      const r = await A.pag.evaluate(async () => await window.__test.dischetto.crea());
      await B.pag.evaluate(async s => await window.__test.dischetto.entra(s), r.stanza);
      for (giri = 0; giri < 400; giri++) {
        for (const P of [A, B]) {
          const s = await d_stato(P);
          if (s && s.fase === 'scegli') await d_scegli(P, s.ruolo === 't' ? mossaTiro(s.tiro) : mossaPara(s.tiro));
        }
        await Promise.all([d_giro(A), d_giro(B)]);
        const sa = await d_stato(A), sb = await d_stato(B);
        if (sa.fase === 'fine' && sb.fase === 'fine') break;
      }
      sA = await d_stato(A); sB = await d_stato(B);
      nA = await A.pag.evaluate(() => window.__test.nastro());
      nB = await B.pag.evaluate(() => window.__test.nastro());
      const fin = sA.fase === 'fine' && sA.causa === 'finita' && sB.fase === 'fine' && sB.causa === 'finita';
      if (fin && !decisiva([sA.serie.seg[0] | 0, sA.serie.seg[1] | 0])) break;
      console.log('    appuntamento ' + tent + ' scartato: ' +
                  (fin ? ('serie ' + sA.serie.seg.join('-') + ', indistinguibile dalla rete che decide')
                       : ('A ' + sA.fase + '/' + sA.causa + ' · B ' + sB.fase + '/' + sB.causa)));
      sA = null;
    }

    if (!sA) {
      console.error('PROVA NULLA: in cinque appuntamenti non e\' uscita una serie finita con un punteggio distinguibile');
      for (const P of aperti) await P.ctx.close();
      await browser.close(); srv.chiudi(); cass.chiudi();
      process.exit(3);
    }

    /* LE DUE ROSE VERE, PER LATO. Chi ha creato la stanza e' il lato 'a'
       e sta nella squadra 0 su TUTTI E DUE i telefoni: e' la riga che il
       commento sopra Dischetto.avvia dichiara, ed e' quella che A6
       verifica nel nastro invece di crederci. */
    const rosaLatoA = (sA.lato === 'a') ? rosaDiA : rosaDiB;
    const rosaLatoB = (sA.lato === 'a') ? rosaDiB : rosaDiA;

    const seg = [sA.serie.seg[0] | 0, sA.serie.seg[1] | 0];
    console.log('    serie vera: ' + seg[0] + '-' + seg[1] + ' in ' + sA.serie.tiri.join('+') +
                ' tiri · seme ' + sA.seme + ' · ' + giri + ' giri di rete · appuntamento ' + tent);
    console.log('    nastro A ' + nA.length + ' caratteri ' + JSON.stringify(contaTipi(nA)) +
                ' · nastro B ' + nB.length + ' caratteri ' + JSON.stringify(contaTipi(nB)));

    /* ======================================================= GRUPPO A */
    if (vuole('A')) {
      console.log('\n  A) LA SERIE ONESTA SI CONFERMA IN DIFFERITA');
      const vA = await giudizio(Gi, nA, seg, sA.seme);
      const vB = await giudizio(Gi, nB, seg, sB.seme);
      di(vA.verdetto === 'TORNA',
         'A1) il nastro del telefono che ha creato la stanza torna',
         vA.verdetto + (vA.causa ? '/' + vA.causa : '') + ' · atteso ' + JSON.stringify(seg) +
         ' · rigiocato ' + JSON.stringify(vA.gol) + ' · passi ' + vA.passi);
      di(vB.verdetto === 'TORNA',
         'A2) e quello del telefono che e\' entrato col codice, con lo stesso verdetto',
         vB.verdetto + (vB.causa ? '/' + vB.causa : '') + ' · rigiocato ' + JSON.stringify(vB.gol) +
         ' · passi ' + vB.passi);
      const r7a = argomentiDi(rigaDiTipo(nA, 7)), r7b = argomentiDi(rigaDiTipo(nB, 7));
      di(!!r7a && r7a === r7b,
         'A3) le due rose stanno negli stessi posti sui due telefoni (riga 7 identica)',
         r7a ? (r7a === r7b ? 'identiche, ' + r7a.split(',').length + ' numeri'
                            : 'DIVERSE\n        A: ' + r7a + '\n        B: ' + r7b)
             : 'assente da tutti e due');
      /* IL TESTIMONE: senza, «TORNA» e «un giudice che dice sempre
         TORNA» sono lo stesso referto. */
      const sballato = [seg[0] + 1, seg[1]];
      const vT = await giudizio(Gi, nA, sballato, sA.seme);
      di(vT.verdetto === 'NON TORNA',
         'A4) TESTIMONE: con un punteggio dichiarato sbagliato di uno, lo stesso nastro NON torna',
         'dichiarato ' + JSON.stringify(sballato) + ' -> ' + vT.verdetto + (vT.causa ? '/' + vT.causa : '') +
         ' · rigiocato ' + JSON.stringify(vT.gol));
      /* E IL SECONDO TESTIMONE, che e' la meta' scomoda: la rigiocata
         deve costare i passi di una SERIE, non quelli di una partita
         intera. Un giudice che rigiocasse novanta secondi di calcio e
         poi indovinasse il punteggio darebbe A1 verde per sbaglio.

         NON GUARDA IL VERDETTO, e il banco se l'e' pagata: la prima
         stesura chiedeva «TORNA E pochi passi», quindi cadeva insieme ad
         A1 su qualunque falso — e due falsi (primo-storto e punteggio)
         risultavano «non discriminati» da una prova che non stava
         misurando quel che diceva. I passi sono un metro a se'. */
      di(vA.passi > 0 && vA.passi < 4000,
         'A5) e la rigiocata e\' una SERIE, non una partita intera (passi sotto i 4000)',
         'passi ' + vA.passi + ' · righe lette ' + vA.righe);

      /* =====================================================================
         A6 — LE ROSE SONO QUELLE VERE, E NON BASTA CHE COINCIDANO.

         MISURATO, ed e' la ragione per cui questa prova esiste: in una
         serie di rigori il punteggio NON DIPENDE dalle rose. Il duello
         legge le zone, la banda di potenza e la manopola della
         difficolta' (`D.save`, `pkCopertura`), e non tocca nessun
         attributo di nessun giocatore — grep «reflex» dentro Duel. Tre
         falsi lo dimostrano: rose scambiate, rose per possesso e due
         volte la propria rosa danno TUTTI E TRE lo stesso punteggio
         rigiocato, quindi A1 e A2 restano verdi.

         Percio' «il giudice direbbe NON TORNA a un onesto», che era il
         timore da cui nasce questo cantiere, su una SERIE non si
         verifica — e su una sfida asincrona si', perche' li' le rose
         scendono in campo davvero. Le rose nel nastro di una serie
         servono a passare il vaglio e a dire chi ha giocato; il giorno
         in cui il duello leggesse un attributo diventerebbero un'accusa.

         Un banco che si fermasse a «i due capi coincidono» sarebbe cieco
         a una bugia coerente. Qui le rose scritte si confrontano con
         quelle VERE dei due telefoni, impacchettate in Node. */
      const attese = [1, 1].concat(impacca(rosaLatoA), impacca(rosaLatoB), [-1]).join(',');
      di(r7a === attese && r7b === attese,
         'A6) e sono le rose VERE dei due telefoni, per LATO (non per possesso)',
         r7a === attese && r7b === attese ? 'tutte e due come attese, ' + attese.split(',').length + ' numeri'
           : ('attese  ' + attese + '\n        nel nastro A ' + (r7a || '(niente)') +
              '\n        nel nastro B ' + (r7b || '(niente)')));

      /* =====================================================================
         A7 — E LA RIGA 15 DICE CHI HA TIRATO DAVVERO PER PRIMO.

         QUESTA PROVA E' NATA DA UN FALSO SCAPPATO, ed e' il secondo caso
         di questo cantiere in cui il banco dichiarava di saper prendere
         una bugia e non la prendeva. `_crit-nastro-primo-storto` scrive
         `1 - G.kickTeam`: il giudice apre la serie col tiratore
         sbagliato, rigioca una serie DIVERSA, e quasi sempre ne esce un
         punteggio diverso — quindi A1 e A2 cadono. QUASI sempre: nella
         batteria intera del compito 3 la serie sbagliata ha dato per caso
         lo stesso punteggio di quella vera, il falso e' passato e il
         banco l'ha dichiarato sfuggito. Un falso che morde a caso non
         condanna nessuno: condanna chi lo rilancia.

         Qui il confronto e' con la verita' e non col punteggio: chi tira
         per primo lo sa lo stato del dischetto (`primo`, che viene dal
         seme), e la riga 15 deve dire lo stesso. Deterministica su
         qualunque serie. */
      const primoVero = (sA.primo === 'a') ? 0 : 1;
      const r15a = argomentiDi(rigaDiTipo(nA, 15)).split(',');
      const r15b = argomentiDi(rigaDiTipo(nB, 15)).split(',');
      const dice = v => (v.length > 1 && (v[1] | 0) === primoVero);
      di(dice(r15a) && dice(r15b),
         'A7) e la riga 15 dichiara CHI HA TIRATO PER PRIMO, su tutti e due i capi',
         'primo vero ' + sA.primo + ' (squadra ' + primoVero + ') · riga 15 di A [' +
         r15a.join(',') + '] · di B [' + r15b.join(',') + ']');
    }

    /* ======================================================= GRUPPO B */
    if (vuole('B')) {
      console.log('\n  B) LE ASTENSIONI GIUSTE RESTANO (nessuna accusa, otto «non lo so»)');
      const sp14 = togliTipo(nA, 14);
      const v14 = sp14.tolti ? await giudizio(Gi, sp14.testo, seg, sA.seme) : null;
      di(!!v14 && v14.verdetto === 'INCOMPLETO' && v14.causa === 'testimonianze-assenti',
         'B1) tolte le testimonianze, il giudice si astiene (la cura del #147)',
         v14 ? ('tolte ' + sp14.tolti + ' -> ' + v14.verdetto + '/' + v14.causa) : 'PROVA NON ESERCITATA: nessuna riga 14');

      const altraImp = N.conMotore(nA, 12345);
      const vIm = await giudizio(Gi, altraImp, seg, sA.seme);
      di(vIm.verdetto === 'INCOMPLETO' && vIm.causa === 'motore-js-diverso',
         'B2) impronta del motore diversa: astensione, mai un\'accusa (voce #142)',
         vIm.verdetto + '/' + vIm.causa);

      const altroMv = N.altroMotore(nA, 99);
      const vMv = await giudizio(Gi, altroMv, seg, sA.seme);
      di(vMv.verdetto === 'ALTRO MOTORE',
         'B3) MOTORE_V del nastro diverso: ALTRO MOTORE (voce #107)',
         vMv.verdetto + '/' + vMv.causa);

      const senzaRose = N.senzaRose(nA);
      const vRo = senzaRose ? await giudizio(Gi, senzaRose, seg, sA.seme) : null;
      di(!!vRo && vRo.verdetto === 'INCOMPLETO' && vRo.causa === 'rose-assenti',
         'B4) tolte le rose: INCOMPLETO/rose-assenti, come per ogni altro nastro',
         vRo ? (vRo.verdetto + '/' + vRo.causa) : 'PROVA NON ESERCITATA: il nastro non porta nessuna riga 7');

      /* =====================================================================
         I QUATTRO MODI DI FARSI ACCUSARE DA ONESTI (voce #149).

         NASCONO ROSSE, ed e' dichiarato: sul gioco del merge-base `b87f512`
         B5 e B6 danno NON TORNA (misurato dalla revisione d'insieme: atteso
         [2,1], rigiocato [1,3] in 7839 passi), B7 da' NON TORNA (rigiocato
         [1,2] in 646 passi) e B8 da' TORNA a un nastro di un protocollo che
         il gioco non conosce.

         UNA COSA ALLA VOLTA. Ognuna di queste quattro prove parte dal
         NASTRO VERO della serie di sopra e ne cambia UN dettaglio. E' la
         forma della revisione: un banco che cambiasse due cose non saprebbe
         quale delle due ha morso.

         E TUTTE E QUATTRO PRETENDONO UN'ASTENSIONE, mai un'accusa. E' lo
         standard che il #133 (`schermo-ignoto`) e il #142
         (`motore-js-ignoto`) hanno gia' scritto due volte: un nastro senza
         la riga che serve NON SI PUO' SAPERE, e procedere alla cieca
         produce accuse false in una sola direzione. Il verdetto giusto e'
         INCOMPLETO, che non muove un punto a nessuno.

         LA CAUSA SI PRETENDE, non solo il verdetto: quattro astensioni con
         la causa sbagliata sarebbero un banco che attesta. E ognuna ha la
         SUA causa, perche' ognuna morde per una ragione diversa — un banco
         che chiedesse solo «INCOMPLETO» resterebbe verde su una cura che
         cura il caso sbagliato (e' quel che il falso
         `_crit-giudice-mezza-guardia` mette alla prova). */
      const sp15 = togliTipo(nA, 15);
      const v15 = sp15.tolti ? await giudizio(Gi, sp15.testo, seg, sA.seme) : null;
      di(!!v15 && v15.verdetto === 'INCOMPLETO' && v15.causa === 'dischetto-assente',
         'B5) tolta SOLO la riga 15 (le 14 restano), il giudice si astiene: non rigioca calcio',
         v15 ? ('tolte ' + sp15.tolti + ' -> ' + v15.verdetto + (v15.causa ? '/' + v15.causa : '') +
                ' · rigiocato ' + JSON.stringify(v15.gol) + ' · passi ' + v15.passi)
             : 'PROVA NON ESERCITATA: nessuna riga 15');

      /* IL RESIDUO, che il #147 dichiarava «indistinguibile da una partita
         normale». Era vero per IDENTIFICARE la serie e falso per ASTENERSI:
         il nastro porta trenta comandi di duello che una partita di calcio
         non raccoglie mai, e quello si vede senza nessuna firma. */
      const sp1514 = togliTipo(togliTipo(nA, 15).testo, 14);
      const v1514 = (sp15.tolti && sp1514.tolti) ? await giudizio(Gi, sp1514.testo, seg, sA.seme) : null;
      di(!!v1514 && v1514.verdetto === 'INCOMPLETO' && v1514.causa === 'duelli-senza-atti',
         'B6) IL RESIDUO: tolte la 15 E tutte le 14, si astiene lo stesso (è un nastro di soli duelli)',
         v1514 ? ('tolte ' + sp15.tolti + '+' + sp1514.tolti + ' -> ' + v1514.verdetto +
                  (v1514.causa ? '/' + v1514.causa : '') + ' · rigiocato ' + JSON.stringify(v1514.gol) +
                  ' · passi ' + v1514.passi)
               : 'PROVA NON ESERCITATA: mancano la riga 15 o le righe 14');

      /* IL BIT CAPOVOLTO. Il #148 ha scelto apposta di non ri-dedurre
         `primo` dentro `giudica` per non duplicare la regola del sorteggio,
         e il prezzo accettato era questa accusa. Il riscontro col seme
         ASTIENE senza duplicare: la regola vive in un posto solo e la
         chiamano tutti e due i capi. */
      const gir = cambiaArg(nA, 15, 1, ((argomentiDi(rigaDiTipo(nA, 15)).split(',')[1] | 0) ? 0 : 1));
      const vGir = gir.fatto ? await giudizio(Gi, gir.testo, seg, sA.seme) : null;
      di(!!vGir && vGir.verdetto === 'INCOMPLETO' && vGir.causa === 'dischetto-primo-incoerente',
         'B7) capovolto il bit «chi ha tirato per primo», si astiene invece di rigiocare un\'altra serie',
         vGir ? ('primo ' + gir.prima + ' -> ' + (gir.prima | 0 ? 0 : 1) + ' · ' + vGir.verdetto +
                 (vGir.causa ? '/' + vGir.causa : '') + ' · rigiocato ' + JSON.stringify(vGir.gol) +
                 ' · passi ' + vGir.passi)
              : 'PROVA NON ESERCITATA: la riga 15 non porta il secondo numero');

      /* LA VERSIONE DEL PROTOCOLLO, scritta dal #147 e mai letta in
         differita: `:47888` la definisce, `:48147` la scrive, `:48647` la
         controlla SOLO DAL VIVO. Un nastro di un dischetto che non
         conosciamo non si puo' rigiocare — e' la stessa cosa che il #107
         dice del motore e il #142 del suo impronta. */
      const v2 = cambiaArg(nA, 15, 0, 2);
      const vV2 = v2.fatto ? await giudizio(Gi, v2.testo, seg, sA.seme) : null;
      di(!!vV2 && vV2.verdetto === 'INCOMPLETO' && vV2.causa === 'dischetto-versione',
         'B8) la riga 15 dichiara un protocollo che non conosciamo: astensione, non un verdetto',
         vV2 ? ('v ' + v2.prima + ' -> 2 · ' + vV2.verdetto + (vV2.causa ? '/' + vV2.causa : '') +
                ' · rigiocato ' + JSON.stringify(vV2.gol) + ' · passi ' + vV2.passi)
             : 'PROVA NON ESERCITATA: nessuna riga 15');
    }

    /* ======================================================= GRUPPO C */
    if (vuole('C')) {
      console.log('\n  C) LA STAFFETTA LI SA LAVORARE');
      const riga = { id: 1, replay: nA, seme: String(sA.seme), taglia: 5, gol_a: seg[0], gol_d: seg[1] };
      const gruppi = S.raggruppa([riga]);
      const imp = S.improntaDelNastro(nA);
      const mis = S.misuraDelNastro(nA);
      di(gruppi.length === 1 && imp !== 0 && mis === null && gruppi[0].chiave === 'qualunque@' + imp,
         'C1) il nastro si raggruppa come gli altri: nessuna finestra chiesta, il motore dichiarato',
         'chiave ' + (gruppi[0] && gruppi[0].chiave) + ' · misura ' + JSON.stringify(mis) + ' · impronta ' + imp);

      /* IL GIRO VERO della staffetta, con un banco finto che fa due sole
         cose: dare la riga e ricevere la parola. Non si traduce niente —
         e' la riga piu' importante di staffetta.js — quindi il banco
         registra la parola COSI' COM'E'. */
      const mandate = [];
      const banco = {
        pesca: async (tetto, dopo) => [riga].filter(x => x.id > (dopo | 0)).slice(0, tetto),
        segna: async (id, parola) => { mandate.push([id, parola]); return { mosso: false, sospetto: 0 }; },
      };
      const ref = await S.giro({ banco, browser, tetto: 5, pausa: 0,
        indirizzo: 'http://127.0.0.1:' + srv.porta + '/CALCETTO-il-gioco.html' });
      const e0 = (ref.esiti || [])[0] || {};
      di(!ref.guasto && ref.giudicate === 1 && e0.verdetto === 'TORNA' &&
         mandate.length === 1 && mandate[0][1] === 'TORNA',
         'C2) la staffetta lo pesca, lo giudica e manda la parola TORNA al database',
         'giudicate ' + ref.giudicate + ' · verdetti ' + JSON.stringify(ref.verdetti) +
         ' · mandato ' + JSON.stringify(mandate) + (ref.guasto ? ' · GUASTO ' + ref.guasto : ''));
    }
  } catch (e) {
    esploso = e;
  } finally {
    for (const P of aperti) { try { await P.ctx.close(); } catch (x) {} }
    try { await browser.close(); } catch (x) {}
    try { srv.chiudi(); } catch (x) {}
    try { cass.chiudi(); } catch (x) {}
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
