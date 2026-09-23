/* =====================================================================
   _q-finestra.js — LA FINESTRA CHE CAMBIA, E L'ONESTO CHE VIENE ACCUSATO
   (voce #139, compito 1). Nasce ROSSO sul difetto vero.

   CHE COSA MISURA. L'onda D ha costruito un giudice che rigioca il
   nastro di una sfida, e `NON TORNA` e' l'unico verdetto che muove
   punti: toglie i punti a DUE persone (delta_a e delta_d), alza
   `allenatore.sospetto` — che non decade mai, per disegno — e chiude la
   riga per sempre (`and verificata = 0`). Il #133 aveva visto il canale
   dei pixel e messo nel nastro la misura della finestra (riga di tipo
   10), ma la scriveva UNA VOLTA SOLA, prima del fischio d'inizio, mentre
   `addEventListener('resize', resize)` resta vivo per tutta la partita e
   ricuoce SCALE/OX/OY. La guardia verificava che il nastro e il giudice
   DICESSERO LA STESSA COSA, non che quella cosa FOSSE STATA VERA
   dall'inizio alla fine.

   IL BANCO E' A BRACCI, e cambia UNA cosa sola: la finestra. Stesso
   seme, stesso copione di dita, stesse due rose, e i dischi calcolati
   una volta sola alla misura di partenza — cosi' fra un braccio e
   l'altro cambia la finestra e NON il copione. Tutti e tre i bracci
   giocati pagano le STESSE DUE PAUSE agli stessi fotogrammi (il banco
   deve tornare in Node per ridimensionare davvero il browser): se una
   pausa bastasse a far divergere una rigiocata lo direbbe il braccio
   FERMO, che dev'essere TORNA.

     FERMA    915x412 per tutta la partita
     CAMBIA   915x412 -> 915x352 al fotogramma 1200
     TORNA    915x412 -> 915x352 al 1200 -> 915x412 al 3000
     RAFFICA  niente partita: il registro acceso a mano e la finestra che
              scende a gradini, con piu' eventi di resize per gradino e
              RESIZE_FORZA acceso (e' quel che fa setTaglia)

   IL TERZO BRACCIO ESISTE PER UN FALSO. Un gioco che scrivesse solo la
   PRIMA e l'ULTIMA misura sarebbe verde su FERMA e su CAMBIA, e
   accuserebbe un innocente su TORNA — dove la finestra se ne va e
   ritorna. Senza quel braccio, `_crit-finestra-estremi` passerebbe.

   LE PROVE
     A) IL GIOCO SCRIVE
       A1) il nastro del braccio FERMO porta UNA misura sola, ed e' quella;
       A2) il nastro del braccio CHE CAMBIA ne porta DUE, nell'ordine;
       A3) e la seconda e' scritta QUANDO la finestra si muove (il suo
           tick sta fra il taglio e la fine), non buttata in coda;
       A4) il braccio che TORNA porta TRE righe e DUE misure distinte;
       A5) RAFFICA: una riga per MISURA, non una per evento di resize.
     B) IL GIUDICE SI ASTIENE
       B1) FERMA, giudicato alla misura che dichiara: TORNA;
       B2) CAMBIA, giudicato alla misura di PARTENZA (quella che il
           nastro dichiara per prima, cioe' la finestra che la staffetta
           aprirebbe): INCOMPLETO / schermo-cambiato;
       B3) lo STESSO nastro alla misura di ARRIVO: ancora
           schermo-cambiato — non si ripara aprendo un'altra finestra,
           e' una proprieta' del nastro;
       B4) su nessuna delle due finestre il braccio CHE CAMBIA riceve il
           verdetto che muove punti;
       B5) TORNA (la finestra che va e torna), giudicato alla misura di
           partenza: schermo-cambiato, e MAI NON TORNA.
     C) I NASTRI VECCHI NON SI ROMPONO
       C1) la sfida congelata (_nastro-duello-congelato.js, un duello
           vero dal dischetto) da' ancora TORNA, con gli stessi gol;
       C2) il nastro FERMO su una finestra diversa: INCOMPLETO /
           schermo-diverso, la parola di sempre, e dichiara quale
           schermo serve;
       C3) il nastro FERMO senza nessuna riga di tipo 10: INCOMPLETO /
           schermo-ignoto, la parola di sempre;
       C4) il nastro FERMO con una SECONDA riga di tipo 10 IDENTICA
           infilata a meta': resta giudicabile (TORNA). Si contano le
           MISURE distinte, non le righe;
       C5) e con una seconda riga DIVERSA infilata in Node — non dal
           gioco: schermo-cambiato. Il vaglio guarda il NASTRO, non la
           partita che l'ha prodotto.
     D) LA FORMA E LA PAROLA
       D1) nessun verdetto fuori dalla tavola dei cinque, e
           `schermo-cambiato` non e' mai un VERDETTO: e' una causa di
           INCOMPLETO;
       D2) la frase che l'occhio di chi gioca legge nomina le due misure
           invece di dare la colpa alla rosa cresciuta di un altro;
       D3) la PRIMA riga resta la misura di PARTENZA, cosi' il
           raggruppamento della staffetta (#138) continua a funzionare;
       D4) l'astensione non dipende dal PUNTEGGIO: lo stesso nastro con
           tre attesi diversi — quello dichiarato, quello che la
           rigiocata produce e uno assurdo — da' tre volte la stessa
           risposta. Condanna la cura pigra — «mi astengo solo quando
           non torna» — che lascerebbe passare per buono proprio il
           nastro che non si puo' verificare (prima della cura, col
           secondo dei tre, il giudice diceva TORNA);
       D5) e non si offre nessuna finestra da riaprire (il campo
           `schermo`, che e' quel che la staffetta usa per riaprire, non
           c'e'): al suo posto ci sono le misure, tutte. Cosi' la regola
           della «finestra negata» del #138 non scatta, e il referto
           dice la verita' senza promettere una cura che non esiste.

   QUEL CHE NON MISURA, dichiarato invece che taciuto:
     · i nastri di `window.__test.registra()` (il registro acceso fuori
       da una sfida) non portano la prima riga di tipo 10, che la scrive
       Sfida.gioca: se durante una di quelle registrazioni la finestra si
       muove, la prima riga che compare e' quella del CAMBIO. Non e' un
       cammino di produzione — quei nastri non si giudicano come sfide —
       e il braccio RAFFICA ci gira apposta;
     · la finestra che cambia DURANTE UN REPLAY non si misura qui: in
       rilettura il registro non scrive (modo 2) e non c'e' niente da
       dire;
     · il verticale resta affare di checkOrientation (G.rotateHold), che
       questo cantiere non tocca.

   uso:  node strumenti/_q-finestra.js
         node strumenti/_q-finestra.js --gioco fuori/falso.html
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode,
   3 se il gioco indicato non ha la schermata della sfida o se le sfide
   non arrivano al fischio finale (prova non fatta).
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./_sfida-due-telefoni.js');
const N = require('./_nastri-bugiardi.js');
const FIX_DUELLO = require('./_nastro-duello-congelato.js');

const RADICE = B.RADICE;
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const provaRel = arg('gioco', process.env.GIOCO_PROVA || '');

const ALTA = [915, 412];        /* la misura di taratura del gioco */
const BASSA = [915, 352];       /* 60 px in meno, e resta ORIZZONTALE */
const TAGLIO = 1200;            /* il fotogramma in cui la finestra si muove */
const RITORNO = 3000;           /* e quello in cui torna, nel terzo braccio */
/* i gradini del braccio RAFFICA, e quanti eventi di resize per gradino */
const GRADINI = [404, 396, 388, 376, 364, 352];
const PER_GRADINO = 4;

const VERDETTI = ['TORNA', 'NON TORNA', 'INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'];

const esiti = [];
const di = (ok, nome, det) => { esiti.push(ok); console.log('  ' + (ok ? 'OK  ' : 'NO  ') + nome + (det ? '  [' + det + ']' : '')); };
const titolo = t => console.log('\n' + t);
const info = (nome, det) => console.log('  --  ' + nome + (det ? '  [' + det + ']' : ''));

/* =====================================================================
   IL COPIONE, SPEZZATO. E' quello di _sfida-due-telefoni.js, con lo
   stato su window.__FIN invece che nelle variabili di una chiusura:
   serve perche' fra una tappa e l'altra il banco deve tornare in Node a
   ridimensionare davvero il browser. I DISCHI ARRIVANO DA FUORI e si
   calcolano una volta sola, alla misura di partenza: cosi' fra i bracci
   cambia la finestra e non il copione delle dita.
   ===================================================================== */
const FASE = `(function(fino, dischi){
  const t = window.__test;
  const D = t.Duel;
  const S = window.__FIN;
  const LX = 180, LY = 300;
  const grande = dischi[0], piccolo = dischi[1];
  while(S.f < fino){
    if(t.state === 'end') break;
    if(t.state === 'freekick'){
      S.duello = true;
      if(D.phase === 'zone' && D.shooterHuman) D.pickZone(2, 0.74, 0.44);
      else if(D.phase === 'power' && D.shooterHuman) D.stopPower();
      else if(D.phase === 'wait' && D.keeperHuman && D.keeperZone < 0) D.pickKeeper(0);
      t.simulate(1/60); S.f++;
      continue;
    }
    const f = S.f;
    const a = f * 0.037;
    const rr = 34 + 22 * Math.sin(f * 0.011);
    const x = LX + Math.cos(a) * rr, y = LY + Math.sin(a) * rr;
    if(!S.giu){ Touch5.start(S.idL, LX, LY); S.giu = true; }
    else Touch5.move(S.idL, x, y);
    if(f % 97 === 96){ Touch5.chiudi(S.idL, false); S.giu = false; S.idL += 2; }
    if(f % 71 === 0 && !S.giuB){ Touch5.start(S.idB, grande.x, grande.y); S.giuB = true; }
    else if(S.giuB && f % 71 === 18){ Touch5.move(S.idB, grande.x - 26, grande.y - 14); }
    else if(S.giuB && f % 71 === 26){ Touch5.chiudi(S.idB, false); S.giuB = false; S.idB += 2; }
    if(f % 53 === 11){ const j = 900 + f; Touch5.start(j, piccolo.x, piccolo.y); Touch5.chiudi(j, false); }
    t.simulate(1/60); S.f++;
  }
  const finita = (t.state === 'end');
  if(finita){
    if(S.giu){ Touch5.chiudi(S.idL, false); S.giu = false; }
    if(S.giuB){ Touch5.chiudi(S.idB, false); S.giuB = false; }
  }
  return { score:[G.score[0],G.score[1]], scena:t.state, passi:S.f, finita:finita,
           misura:[innerWidth|0, innerHeight|0], quadro:[VW|0, VH|0],
           scala:+SCALE.toFixed(4), ox:Math.round(OX),
           righe: t.registroRighe, duello: S.duello };
})`;

/* UNA TAPPA: si ridimensiona davvero il browser e si aspetta che il
   gioco se ne sia accorto (VW/VH, non innerWidth: la prova e' che
   resize() abbia girato, non che il viewport sia cambiato). */
async function tappa(P, misura) {
  await P.pag.setViewportSize({ width: misura[0], height: misura[1] });
  await P.pag.waitForFunction(m => (VW | 0) === m[0] && (VH | 0) === m[1], misura, { timeout: 5000 });
}

async function unBraccio(browser, sg, ss, nome, tappe) {
  /* LO STESSO SEME PER TUTTI I BRACCI: il server finto lo da' con un
     contatore, e senza questo azzeramento il secondo braccio giocherebbe
     un'altra partita. */
  ss.stato.semeProssimo = 0;
  const prima = ss.db.sfide.length;
  const At = await B.apri(browser, sg.porta, { width: ALTA[0], height: ALTA[1] });
  await B.collega(At, ss.porta, 'DOPOLAVORO');
  await B.entra(At); await B.pubblica(At);

  const via = await At.pag.evaluate(async () => {
    const t = window.__test;
    await t.sfida.cerca();
    if (!t.sfidaStato.inPartita) return { partita: false };
    window.__FIN = { f: 0, idL: 1, idB: 2, giu: false, giuB: false, duello: false };
    return { partita: true, seme: t.sfidaStato.seme, taglia: t.sfidaStato.taglia,
             dischi: t.pulsanti(0).map(b => ({ x: b.x, y: b.y, r: b.r })) };
  });
  if (!via.partita) { await At.ctx.close(); return { nome, partita: false }; }

  const passaggi = [];
  for (const tp of tappe) {
    const r = await At.pag.evaluate(([c, fino, d]) => (new Function('return ' + c))()(fino, d),
                                    [FASE, tp.a, via.dischi]);
    await tappa(At, tp.misura);
    const d = await At.pag.evaluate(() => ({ quadro: [VW | 0, VH | 0], scala: +SCALE.toFixed(4), ox: Math.round(OX) }));
    passaggi.push({ a: tp.a, prima: r, dopo: d });
  }
  const fine = await At.pag.evaluate(([c, fino, d]) => (new Function('return ' + c))()(fino, d),
                                     [FASE, 24000, via.dischi]);
  /* chiudiSfida spedisce senza che nessuno la aspetti: qui si aspetta */
  await At.pag.waitForTimeout(900);
  const riga = ss.db.sfide.length > prima ? ss.db.sfide[ss.db.sfide.length - 1] : null;
  const errori = At.errori.slice();
  await At.ctx.close();
  const crudo = riga ? N.allarga(riga.replay) : '';
  return { nome, partita: true, via, passaggi, fine, riga, crudo, errori,
           misure: crudo ? N.schermiDi(crudo) : [],
           dieci: crudo ? N.righeSchermoDi(crudo) : [] };
}

/* IL BRACCIO DELLA RAFFICA. Nessuna partita: il registro si accende a
   mano e la finestra scende a gradini. A ogni gradino il resize viene
   rilanciato PER_GRADINO volte con RESIZE_FORZA acceso, che e' quel che
   fa setTaglia — se no la guardia che resize() ha gia' («se la misura
   non e' cambiata non si ricuoce niente») fermerebbe tutto prima e la
   prova non eserciterebbe niente. */
async function raffica(browser, sg) {
  const P = await B.apri(browser, sg.porta, { width: ALTA[0], height: ALTA[1] });
  await P.pag.evaluate(() => { window.__test.registra(); });
  let eventi = 0;
  for (const h of GRADINI) {
    await tappa(P, [ALTA[0], h]);
    eventi++;
    const n = await P.pag.evaluate(k => {
      for (let i = 0; i < k; i++) { RESIZE_FORZA = true; dispatchEvent(new Event('resize')); }
      return k;
    }, PER_GRADINO - 1);
    eventi += n;
  }
  const r = await P.pag.evaluate(() => ({
    dieci: Reg.righe.filter(x => x[1] === 10).map(x => [x[3] | 0, x[4] | 0]),
    righe: Reg.righe.length,
  }));
  await P.ctx.close();
  return { eventi, dieci: r.dieci, righe: r.righe };
}

const giudizio = (P, nastro, atteso, opz) => P.pag.evaluate(([n, a, o]) => {
  const t = window.__test;
  if (typeof t.giudica !== 'function') return { manca: true };
  try {
    const r = t.giudica(n, a, o);
    return Object.assign({ manca: false }, r && typeof r === 'object' ? r : { verdetto: String(r) });
  } catch (e) { return { manca: false, eccezione: e.message }; }
}, [nastro, atteso, opz]);

const v = g => (g && g.verdetto) || (g && g.eccezione ? 'ECCEZIONE' : '?');
const vc = g => v(g) + (g && g.causa ? '/' + g.causa : '');
const mis = l => (l && l.length ? l.map(s => s[0] + 'x' + s[1]).join(' -> ') : 'nessuna');

(async () => {
  const prova = provaRel ? path.resolve(RADICE, provaRel) : '';
  if (prova && !fs.existsSync(prova)) { console.error('PROVA NULLA: non esiste ' + prova); process.exit(3); }
  const sg = await B.serviGioco(prova);
  const ss = await B.serviServer();
  let browser;
  try {
    browser = await chromium.launch();
    console.log('=== LA FINESTRA CHE CAMBIA — un onesto non si accusa per una barra del browser (voce #139) ===');
    console.log('    gioco ' + (provaRel || 'CALCETTO-il-gioco.html') + ', taglia 5, ' +
                ALTA.join('x') + ' -> ' + BASSA.join('x') + ' al fotogramma ' + TAGLIO + '\n');

    const Bt = await B.apri(browser, sg.porta, { width: ALTA[0], height: ALTA[1] });
    const c = await Bt.pag.evaluate(() => ({ schermata: !!document.getElementById('sfida'),
                                             giudice: typeof window.__test.giudica === 'function' }));
    if (!c.schermata) {
      console.error('PROVA NULLA: questo gioco non ha la schermata della sfida.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    if (!c.giudice) {
      console.error('PROVA NULLA: questo gioco non ha window.__test.giudica.');
      await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
    }
    /* IL DIFENSORE, una volta sola: senza una seconda squadra pubblicata
       il server finto non ha un difensore e non archivia la riga. */
    await B.collega(Bt, ss.porta, 'BORGATA');
    await B.entra(Bt); await B.pubblica(Bt);

    const fermo = await unBraccio(browser, sg, ss, 'FERMA', [
      { a: TAGLIO, misura: ALTA }, { a: RITORNO, misura: ALTA }]);
    const cambia = await unBraccio(browser, sg, ss, 'CAMBIA', [
      { a: TAGLIO, misura: BASSA }, { a: RITORNO, misura: BASSA }]);
    const torna = await unBraccio(browser, sg, ss, 'TORNA', [
      { a: TAGLIO, misura: BASSA }, { a: RITORNO, misura: ALTA }]);

    for (const b of [fermo, cambia, torna]) {
      if (!b.partita || !b.riga) {
        console.error('PROVA NULLA: il braccio ' + b.nome + ' non e\' arrivato al fischio finale.');
        await browser.close(); sg.chiudi(); ss.chiudi(); process.exit(3);
      }
      console.log('  braccio ' + b.nome.padEnd(6) + ' ' + b.fine.passi + ' passi, tabellone ' +
                  b.riga.gol_a + '-' + b.riga.gol_d + ', SCALE ' +
                  b.passaggi.map(p => p.prima.scala).concat([b.fine.scala]).join(' -> ') +
                  ', misure nel nastro: ' + mis(b.misure) +
                  ' (' + b.dieci.length + ' righe di tipo 10)');
      if (b.errori.length) console.log('      ERRORI DI PAGINA: ' + b.errori.slice(0, 2).join(' | '));
    }

    const raff = await raffica(browser, sg);
    console.log('  braccio RAFFIC ' + raff.eventi + ' eventi di resize su ' + GRADINI.length +
                ' misure -> ' + raff.dieci.length + ' righe di tipo 10');

    /* =================================================================
       LE DUE FINESTRE DEL GIUDICE. Pagine che non hanno mai giocato, con
       la rosa vergine del salvataggio nuovo: se il giudice leggesse il
       profilo vivo invece del nastro, ogni verdetto qui sarebbe NON
       TORNA (lezione della voce #133).
       ================================================================= */
    const G1 = await B.apri(browser, sg.porta, { width: ALTA[0], height: ALTA[1] });
    const G2 = await B.apri(browser, sg.porta, { width: BASSA[0], height: BASSA[1] });
    for (const P of [G1, G2]) await P.pag.evaluate(() => { window.__test.save.teamName = 'GIUDICE'; });

    const opz = b => ({ seme: b.riga.seme, taglia: b.riga.taglia | 0 });
    const att = b => [b.riga.gol_a | 0, b.riga.gol_d | 0];
    const r = {};
    r.fermoAlta = await giudizio(G1, fermo.crudo, att(fermo), opz(fermo));
    r.fermoBassa = await giudizio(G2, fermo.crudo, att(fermo), opz(fermo));
    r.cambiaAlta = await giudizio(G1, cambia.crudo, att(cambia), opz(cambia));
    r.cambiaBassa = await giudizio(G2, cambia.crudo, att(cambia), opz(cambia));
    r.tornaAlta = await giudizio(G1, torna.crudo, att(torna), opz(torna));
    /* LO STESSO NASTRO CON TRE PUNTEGGI DIVERSI, e nessuno dei tre deve
       cambiare la risposta: l'astensione e' una proprieta' del NASTRO,
       non del conto. Serve a condannare una cura pigra — «mi astengo
       solo quando il conto non torna» — che lascerebbe passare per
       buono proprio il nastro che non si puo' verificare. Il secondo
       dei tre e' il punteggio del braccio FERMO, che e' quello che la
       rigiocata di questo nastro produce (la rigiocata ignora il cambio
       di finestra e rifa' la partita a finestra ferma): prima della
       cura quel giudizio diceva TORNA su un nastro inverificabile. */
    r.cambiaConFermo = await giudizio(G1, cambia.crudo, att(fermo), opz(cambia));
    r.cambiaAssurdo = await giudizio(G1, cambia.crudo, [99, 0], opz(cambia));

    /* i nastri vecchi: la fixture congelata e i tre bisturi in Node */
    /* LA FIXTURE E' DI PRIMA DELLA VOCE #142 e non porta l'impronta del
       motore JavaScript (riga di tipo 11): dal #142 il giudice si astiene
       su un nastro cosi' (INCOMPLETO/motore-js-ignoto), e questa prova —
       che misura la FINESTRA, non il motore — smetterebbe di misurare
       quel che dice. Si completa a runtime con l'impronta di chi giudica,
       che e' vera: quel nastro fu registrato su un Chromium di questa
       macchina ed e' un Chromium di questa macchina a rigiocarlo. Che un
       nastro senza riga 11 faccia astenere il giudice e' misurato dove
       deve esserlo, nella prova E di _q-motore-nastro.js. */
    const impQui = await G1.pag.evaluate(() =>
      (window.__test && typeof window.__test.improntaMotore === 'function') ? window.__test.improntaMotore() : 0);
    const crudoFix = impQui ? N.conMotore(N.allarga(FIX_DUELLO.replay), impQui)
                            : N.allarga(FIX_DUELLO.replay);
    r.fix = await giudizio(G1, crudoFix, [FIX_DUELLO.gol_a | 0, FIX_DUELLO.gol_d | 0],
                           { seme: FIX_DUELLO.seme, taglia: FIX_DUELLO.taglia | 0 });
    r.senzaSchermo = await giudizio(G1, N.senzaSchermo(fermo.crudo), att(fermo), opz(fermo));
    r.doppioUguale = await giudizio(G1, N.infilaSchermo(fermo.crudo, ALTA, 0.5), att(fermo), opz(fermo));
    r.doppioDiverso = await giudizio(G1, N.infilaSchermo(fermo.crudo, BASSA, 0.5), att(fermo), opz(fermo));

    /* la frase che l'occhio legge, chiesta al gioco con un sigillo finto */
    const frasi = await G1.pag.evaluate(([a, b]) => ({
      cambiato: Sfida.causaSigillo({ causa: 'schermo-cambiato', schermo: a, schermi: [a, b] }),
      diverso: Sfida.causaSigillo({ causa: 'schermo-diverso', schermo: b }),
    }), [ALTA, BASSA]);

    /* =================================================================
       A) IL GIOCO SCRIVE LA MISURA A OGNI CAMBIO
       ================================================================= */
    titolo('A) IL GIOCO SCRIVE — una riga per misura, quando la misura cambia');
    di(fermo.misure.length === 1 && fermo.misure[0][0] === ALTA[0] && fermo.misure[0][1] === ALTA[1],
       'A1) il nastro a finestra FERMA porta una misura sola, ed e\' quella',
       mis(fermo.misure));
    di(cambia.misure.length === 2 &&
       cambia.misure[0][0] === ALTA[0] && cambia.misure[0][1] === ALTA[1] &&
       cambia.misure[1][0] === BASSA[0] && cambia.misure[1][1] === BASSA[1],
       'A2) il nastro della finestra CHE CAMBIA ne porta DUE, nell\'ordine',
       mis(cambia.misure));
    {
      /* LA RIGA DELLA MISURA NUOVA, cercata per MISURA e non per
         posizione: se un giorno ne comparisse una in piu' in testa, la
         prova deve continuare a misurare quel che dice di misurare. */
      const nuova = cambia.dieci.filter(x => x.w === BASSA[0] && x.h === BASSA[1])[0];
      di(!!nuova && nuova.tick >= TAGLIO && nuova.tick <= cambia.fine.passi,
         'A3) la riga della misura nuova e\' scritta QUANDO la finestra si muove, non in coda',
         nuova ? 'tick ' + nuova.tick + ' (taglio ' + TAGLIO + ', fine ' + cambia.fine.passi + ')'
               : 'la riga della misura nuova non c\'e\'');
    }
    di(torna.dieci.length === 3 && torna.misure.length === 2,
       'A4) la finestra che va e TORNA lascia tre righe e due misure distinte',
       torna.dieci.length + ' righe, ' + mis(torna.misure));
    di(raff.dieci.length === GRADINI.length,
       'A5) il resize a raffica non riempie il nastro: una riga per MISURA, non per evento',
       raff.eventi + ' eventi, ' + GRADINI.length + ' misure, ' + raff.dieci.length + ' righe');

    /* =================================================================
       B) IL GIUDICE SI ASTIENE INVECE DI ACCUSARE
       ================================================================= */
    titolo('B) IL GIUDICE SI ASTIENE — mai NON TORNA per colpa di una finestra');
    di(v(r.fermoAlta) === 'TORNA',
       'B1) a finestra ferma, giudicato alla misura che dichiara: TORNA',
       vc(r.fermoAlta) + (r.fermoAlta.gol ? ' ' + r.fermoAlta.gol.join('-') + ' in ' + r.fermoAlta.passi + ' passi' : ''));
    di(v(r.cambiaAlta) === 'INCOMPLETO' && r.cambiaAlta.causa === 'schermo-cambiato',
       'B2) la finestra che cambia, alla misura di PARTENZA: INCOMPLETO / schermo-cambiato',
       vc(r.cambiaAlta) + (r.cambiaAlta.gol ? ' ' + r.cambiaAlta.gol.join('-') + ' contro ' + att(cambia).join('-') : ''));
    di(v(r.cambiaBassa) === 'INCOMPLETO' && r.cambiaBassa.causa === 'schermo-cambiato',
       'B3) e alla misura di ARRIVO: ancora schermo-cambiato — non si ripara con un\'altra finestra',
       vc(r.cambiaBassa));
    di(v(r.cambiaAlta) !== 'NON TORNA' && v(r.cambiaBassa) !== 'NON TORNA',
       'B4) su nessuna delle due finestre esce il verdetto che muove punti',
       vc(r.cambiaAlta) + ' / ' + vc(r.cambiaBassa));
    di(v(r.tornaAlta) === 'INCOMPLETO' && r.tornaAlta.causa === 'schermo-cambiato',
       'B5) la finestra che va e TORNA: schermo-cambiato, e mai NON TORNA',
       vc(r.tornaAlta) + (r.tornaAlta.gol ? ' ' + r.tornaAlta.gol.join('-') + ' contro ' + att(torna).join('-') : ''));

    /* =================================================================
       C) I NASTRI VECCHI NON SI ROMPONO
       ================================================================= */
    titolo('C) I NASTRI VECCHI — una misura sola si giudica come sempre');
    di(v(r.fix) === 'TORNA' && r.fix.gol && r.fix.gol[0] === (FIX_DUELLO.gol_a | 0) && r.fix.gol[1] === (FIX_DUELLO.gol_d | 0),
       'C1) la sfida congelata (un duello vero dal dischetto) da\' ancora TORNA',
       vc(r.fix) + (r.fix.gol ? ' ' + r.fix.gol.join('-') + ' in ' + r.fix.passi + ' passi' : '') +
       ', dichiarata ' + FIX_DUELLO.gol_a + '-' + FIX_DUELLO.gol_d);
    di(v(r.fermoBassa) === 'INCOMPLETO' && r.fermoBassa.causa === 'schermo-diverso' &&
       Array.isArray(r.fermoBassa.schermo) && r.fermoBassa.schermo[1] === ALTA[1],
       'C2) una misura sola su una finestra diversa: schermo-diverso, e dice quale schermo serve',
       vc(r.fermoBassa) + ' ' + (r.fermoBassa.schermo ? r.fermoBassa.schermo.join('x') : '?'));
    di(v(r.senzaSchermo) === 'INCOMPLETO' && r.senzaSchermo.causa === 'schermo-ignoto',
       'C3) senza nessuna riga di tipo 10: schermo-ignoto, la parola di sempre',
       vc(r.senzaSchermo));
    di(v(r.doppioUguale) === 'TORNA',
       'C4) due righe di tipo 10 IDENTICHE non fermano niente: si contano le misure, non le righe',
       vc(r.doppioUguale));
    di(v(r.doppioDiverso) === 'INCOMPLETO' && r.doppioDiverso.causa === 'schermo-cambiato',
       'C5) una seconda misura infilata in Node basta: il vaglio guarda il NASTRO',
       vc(r.doppioDiverso));

    /* =================================================================
       D) LA FORMA E LA PAROLA
       ================================================================= */
    titolo('D) LA FORMA — cinque verdetti, e la frase dice la causa vera');
    {
      const tutti = Object.keys(r).map(k => r[k]);
      const fuori = tutti.filter(g => VERDETTI.indexOf(v(g)) < 0).length;
      const comeVerdetto = tutti.filter(g => v(g) === 'schermo-cambiato').length;
      di(fuori === 0 && comeVerdetto === 0,
         'D1) nessun verdetto fuori dalla tavola dei cinque, e schermo-cambiato e\' una CAUSA',
         tutti.length + ' giudizi, ' + fuori + ' fuori tavola');
    }
    di(frasi.cambiato.indexOf(ALTA.join('x')) >= 0 && frasi.cambiato.indexOf(BASSA.join('x')) >= 0 &&
       frasi.cambiato.toLowerCase().indexOf('squadra') < 0,
       'D2) la frase nomina le due misure e non da\' la colpa alla rosa di un altro',
       frasi.cambiato.slice(0, 96));
    {
      const p = N.schermoDi(cambia.crudo);
      di(!!p && p[0] === ALTA[0] && p[1] === ALTA[1],
         'D3) la PRIMA riga resta la misura di PARTENZA: la staffetta raggruppa come prima',
         p ? p.join('x') : 'nessuna');
    }
    di([r.cambiaAlta, r.cambiaConFermo, r.cambiaAssurdo]
         .every(g => v(g) === 'INCOMPLETO' && g.causa === 'schermo-cambiato'),
       'D4) l\'astensione non dipende dal punteggio: tre attesi diversi, stessa risposta',
       att(cambia).join('-') + ' ' + vc(r.cambiaAlta) + ' · ' +
       att(fermo).join('-') + ' ' + vc(r.cambiaConFermo) + ' · 99-0 ' + vc(r.cambiaAssurdo));
    di(!r.cambiaAlta.schermo && !r.cambiaBassa.schermo &&
       Array.isArray(r.cambiaAlta.schermi) && r.cambiaAlta.schermi.length === 2,
       'D5) non si offre nessuna finestra da riaprire, e le due misure si dicono lo stesso',
       'schermo ' + JSON.stringify(r.cambiaAlta.schermo || null) +
       ', schermi ' + JSON.stringify(r.cambiaAlta.schermi || null));

    await browser.close();
  } catch (e) {
    console.error('BANCO ESPLOSO: ' + (e && e.stack || e));
    if (browser) await browser.close();
    sg.chiudi(); ss.chiudi();
    process.exit(2);
  }
  sg.chiudi(); ss.chiudi();
  const passati = esiti.filter(Boolean).length;
  console.log('\n  ' + esiti.length + ' controlli, ' + passati + ' passati, ' + (esiti.length - passati) + ' falliti');
  process.exit(passati === esiti.length ? 0 : 1);
})();
