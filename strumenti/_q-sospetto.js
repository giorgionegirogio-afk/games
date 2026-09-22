/* =====================================================================
   _q-sospetto.js — L'ABBINAMENTO PER PUNTI E IL SOSPETTO (voce #137).

   NASCE ROSSO: `rete/lib/abbinamento.js` e `rete/lib/verdetto.js` non
   esistono ancora, e finche' non esistono ogni prova qui dentro e'
   rossa. E' la regola di casa — ogni funzione nuova ha prima un test che
   nasce rosso — applicata a un cantiere che non tocca il gioco.

   PERCHE' NON APRE IL GIOCO. Non c'e' niente da aprire: il sospetto non
   si vede per disegno e l'abbinamento migliore si sente giocando, non si
   legge in un pixel. Questo cancello costa meno di un secondo e non
   accende un browser — e' l'unico della batteria che misura il SERVER.

   PERCHE' NON PARLA COL DATABASE. La stessa ragione di `_q-rete.js`: un
   banco che chiama Internet e' un banco che un giorno diventa rosso da
   solo, e quel giorno nessuno guarda piu' il colore. Qui la popolazione
   e' simulata e il database e' un oggetto in memoria.

   E QUEL CHE QUESTO BANCO NON PUO' FARE, detto subito perche' un banco
   che tace un limite e' un banco che mente: **l'SQL non si esegue**. Non
   c'e' un Postgres nel repo. Allora la regola sta in JavaScript — dove
   si esegue e si misura davvero — e l'SQL ne e' la traduzione; il
   gruppo D confronta le due PER TESTO e lo dichiara: quello e' l'unico
   gruppo che attesta invece di misurare.

   uso:  node strumenti/_q-sospetto.js
         node strumenti/_q-sospetto.js --rete fuori/rete-crit-largo
         node strumenti/_q-sospetto.js --solo A,C
   esce 0 se passa tutto, 1 se una prova fallisce, 2 se il banco esplode.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const urlmod = require('url');

const RADICE = path.resolve(__dirname, '..');
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
/* --rete punta a una COPIA dell'intera cartella del server: e' cosi' che
   i falsi (_crit-*) si fanno giudicare. Senza la bandiera si misura il
   server del repo. */
const RETE = path.resolve(RADICE, arg('rete', 'rete'));
const gruppiChiesti = String(arg('solo', 'A,B,C,D')).toUpperCase().split(',').map(s => s.trim());
const vuole = g => gruppiChiesti.includes(g);

let ok = 0, no = 0;
const esiti = [];
const di = (buono, nome, det) => {
  esiti.push(!!buono);
  if (buono) { ok++; console.log('  OK  ' + nome + (det !== undefined && det !== '' ? '  [' + det + ']' : '')); }
  else { no++; console.log('  NO  ' + nome + (det !== undefined && det !== '' ? '  [' + det + ']' : '')); }
};
const titolo = t => console.log('\n' + t);

/* Generatore riproducibile, lo stesso della sonda e di rete/prove: un
   banco di popolazioni che non si puo' rigiocare non e' un banco, e' un
   sondaggio. */
function generatore(seme) {
  let s = (seme >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* =====================================================================
   LA POPOLAZIONE SIMULATA, e il modello e' dichiarato perche' e' l'unica
   cosa che si puo' sbagliare qui dentro.

     abilita     0..1, quanto e' bravo chi tiene il telefono
     esperienza  0..1 con la coda lunga (r*r): molti nuovi, pochi veterani
     forza       parte da 63 (nuovaRosa tira fra 50 e 76) e cresce
                 giocando, con un tetto — e' la ROSA
     punti       parte da 1000 e si allarga per ABILITA', non per
                 anzianita' — e' l'ELO

   La cosa che conta: forza ed Elo NON sono la stessa cosa, e la prova
   C0 misura quanto si sparpagliano dentro una stessa fascia di forza.
   ===================================================================== */
function popolazione(n, seme) {
  const r = generatore(seme);
  const gente = [];
  for (let i = 0; i < n; i++) {
    const abilita = r(), esperienza = r() * r();
    gente.push({
      id: 'a' + i, i,
      forza: Math.max(40, Math.min(95, Math.round(63 + 32 * esperienza * (0.55 + 0.45 * abilita)))),
      punti: Math.max(100, Math.round(1000 + 1500 * (abilita - 0.5) * (0.25 + 0.75 * esperienza))),
      sospetto: 0,
    });
  }
  return gente;
}

/* LA FINESTRA DI PRIMA, quella che questo cantiere ESTENDE e non
   riscrive: `for (const banda of [8, 20, 99])` in rete/api/avversario.js,
   e in trova_avversario il solo `abs(forza - mia) <= banda`. Sta qui
   dentro perche' il «prima» e il «dopo» si misurano nella STESSA corsa:
   un prima preso ieri e un dopo preso oggi sono due numeri che parlano
   di due macchine. */
const PRIMA = [8, 20, 99];
function cercaPrima(io, gente, dado) {
  for (let k = 0; k < PRIMA.length; k++) {
    const buoni = gente.filter(c => c.id !== io.id && Math.abs(c.forza - io.forza) <= PRIMA[k]);
    if (buoni.length) return { avv: buoni[Math.floor(dado() * buoni.length)], gradino: k + 1 };
  }
  return { avv: null, gradino: 0 };
}

function statistica(v) {
  if (!v.length) return { n: 0, media: 0, mediana: 0, p90: 0, vicini: 0, lontani: 0 };
  const s = [...v].sort((a, b) => a - b);
  const q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return {
    n: s.length,
    media: Math.round(s.reduce((a, b) => a + b, 0) / s.length),
    mediana: q(0.5), p90: q(0.9),
    vicini: Math.round(100 * s.filter(x => x <= 150).length / s.length),
    lontani: Math.round(100 * s.filter(x => x > 500).length / s.length),
  };
}

/* =====================================================================
   IL BANCO IN MEMORIA — quattro tabelle e nient'altro.

   Non e' una copia del database: e' la sua FORMA. `applica` (il modulo)
   ci lavora sopra come `segna_verdetto` lavora sulle tabelle vere, e le
   prove del gruppo B guardano che cosa e' cambiato.
   ===================================================================== */
function bancoNuovo() {
  return { allenatore: new Map(), punti: new Map(), sfida: [] };
}
function allenatoreNuovo(b, id, punti) {
  b.allenatore.set(id, { id, sospetto: 0, bandito: false });
  b.punti.set(id, { allenatore: id, punti: punti === undefined ? 1000 : punti,
                    vinte: 0, pari: 0, perse: 0, fatti: 0, subiti: 0, serie: 0 });
}
/* Una sfida COME IL SERVER LA REGISTRA: gol, delta mossi, verificata a 0.
   I delta sono quelli che /api/sfida ha scritto davvero (delta_a
   all'attaccante, delta_d al difensore), e sono l'unico modo di disfare. */
function sfidaNuova(b, att, dif, gol_a, gol_d, delta_a, delta_d) {
  const id = b.sfida.length + 1;
  b.sfida.push({ id, attaccante: att, difensore: dif, seme: 1000 + id, taglia: 5,
                 gol_a, gol_d, delta_a, delta_d, verificata: 0 });
  /* e i punti si muovono come li ha mossi il server */
  const pa = b.punti.get(att), pd = b.punti.get(dif);
  pa.punti = Math.max(100, pa.punti + delta_a);
  pa.fatti += gol_a; pa.subiti += gol_d;
  if (gol_a > gol_d) { pa.vinte++; pa.serie++; } else if (gol_a < gol_d) { pa.perse++; pa.serie = 0; } else { pa.pari++; pa.serie = 0; }
  if (pd) {
    pd.punti = Math.max(100, pd.punti + delta_d);
    pd.fatti += gol_d; pd.subiti += gol_a;
    if (gol_d > gol_a) pd.vinte++; else if (gol_d < gol_a) pd.perse++; else pd.pari++;
  }
  return id;
}

/* -------------------------------------------------------------------- */
(async () => {
  /* I DUE MODULI. Se non ci sono, il banco NON esplode: dice rosso. Un
     cancello che esce 2 perche' la cosa da misurare non e' stata ancora
     scritta manderebbe a riparare il banco invece di scrivere la cura. */
  const carica = async nome => {
    const f = path.join(RETE, 'lib', nome);
    if (!fs.existsSync(f)) return null;
    try { return await import(urlmod.pathToFileURL(f).href); } catch (e) { return { __rotto: e.message }; }
  };
  const A = await carica('abbinamento.js');
  const V = await carica('verdetto.js');

  console.log('=== L\'ABBINAMENTO PER PUNTI E IL SOSPETTO — server, senza rete e senza browser ===');
  console.log('    cartella misurata: ' + path.relative(RADICE, RETE).replace(/\\/g, '/'));
  if (!A) console.log('    rete/lib/abbinamento.js: NON C\'E\'');
  else if (A.__rotto) console.log('    rete/lib/abbinamento.js: ROTTO — ' + A.__rotto);
  if (!V) console.log('    rete/lib/verdetto.js: NON C\'E\'');
  else if (V.__rotto) console.log('    rete/lib/verdetto.js: ROTTO — ' + V.__rotto);

  const haV = !!(V && !V.__rotto && typeof V.conseguenza === 'function');
  const haA = !!(A && !A.__rotto && typeof A.ammissibile === 'function');
  /* chiamata difensiva: un modulo che lancia non deve far esplodere il
     banco, deve far diventare rossa LA SUA prova */
  const prova = (f, d) => { try { return f(); } catch (e) { return d === undefined ? { __err: e.message } : d; } };

  /* ===================================================================
     A) LA TAVOLA DEI CINQUE VERDETTI
     Il cuore del cantiere. Quattro verdetti su cinque sono «non lo so»
     o «tutto a posto»; UNO SOLO e' un'accusa.
     =================================================================== */
  if (vuole('A')) {
    titolo('A) LA TAVOLA DEI CINQUE — e solo NON TORNA muove qualcosa');

    const cinque = ['TORNA', 'NON TORNA', 'INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'];
    const c = v => haV ? prova(() => V.conseguenza(v), null) : null;

    di(haV && Array.isArray(V.VERDETTI) && V.VERDETTI.length === 5 &&
       cinque.every(x => V.VERDETTI.includes(x)),
       'A1) i cinque verdetti sono quelli del giudice, alla lettera',
       haV && Array.isArray(V.VERDETTI) ? V.VERDETTI.join(' / ') : 'il modulo non c\'e\'');

    const t = c('TORNA');
    di(!!t && t.verificata === 1 && t.sospetto === 0 && t.disfa === false,
       'A2) TORNA chiude la riga e non muove ne\' punti ne\' sospetto',
       t ? JSON.stringify(t) : 'il modulo non c\'e\'');

    const nt = c('NON TORNA');
    di(!!nt && nt.verificata === -1 && nt.sospetto === 1 && nt.disfa === true,
       'A3) NON TORNA chiude la riga a -1, disfa i punti e alza il sospetto di UNO',
       nt ? JSON.stringify(nt) : 'il modulo non c\'e\'');

    const nonSo = ['INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'].map(c);
    di(nonSo.every(x => x && x.verificata === 0 && x.sospetto === 0 && x.disfa === false),
       'A4) i tre «non lo so» lasciano la riga APERTA (verificata 0) e non muovono niente',
       nonSo.map((x, i) => ['INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'][i] + '=' +
                  (x ? x.verificata + '/' + x.sospetto : '?')).join(' '));

    /* L'ASSERZIONE CENTRALE, e si scrive contando invece di elencare: se
       domani qualcuno aggiungesse un sesto verdetto che accusa, questa
       riga lo prenderebbe e A3/A4 no. */
    const accusano = haV ? cinque.filter(v => { const x = c(v); return x && x.sospetto > 0; }) : [];
    di(accusano.length === 1 && accusano[0] === 'NON TORNA',
       'A5) SU CINQUE VERDETTI, UNO SOLO alza il sospetto — e si chiama NON TORNA',
       accusano.length ? accusano.join(', ') : 'nessuno lo alza');

    /* IL RIPIEGO E' L'INNOCENZA. Una parola storpiata, un nullo, un
       verdetto inventato fra un anno: tutto cade nel «non lo so». Anche
       il minuscolo, e apposta: il giudice restituisce ESATTAMENTE
       'NON TORNA', e accettare varianti vuol dire accettare un giorno
       una variante che non voleva dire quello. */
    const spazzatura = ['', ' ', 'non torna', 'NONTORNA', 'NON  TORNA', 'NON TORNA ', 'BARATO',
                        'non lo so', '-1', 'TORNA?', 'undefined'];
    const strani = [null, undefined, 0, -1, 1, {}, [], NaN, true, false, { verdetto: 'NON TORNA' }];
    const tuttoIlResto = haV ? [...spazzatura, ...strani].map(v => ({ v, x: prova(() => V.conseguenza(v), null) })) : [];
    const colpevoli = tuttoIlResto.filter(o => !o.x || o.x.sospetto !== 0 || o.x.verificata !== 0 || o.x.disfa !== false);
    di(haV && tuttoIlResto.length === 22 && colpevoli.length === 0,
       'A6) il ripiego e\' l\'INNOCENZA: ventidue ingressi storti, nullo compreso, non muovono niente',
       colpevoli.length ? colpevoli.slice(0, 3).map(o => JSON.stringify(o.v)).join(', ') : (haV ? '22 su 22' : 'il modulo non c\'e\''));

    /* Una tavola che restituisce lo STESSO oggetto a ogni chiamata e' una
       tavola che il primo chiamante puo' riscrivere per tutti. */
    const uno = c('INCOMPLETO');
    if (uno && typeof uno === 'object') uno.sospetto = 99;
    const due = c('INCOMPLETO');
    di(!!due && due.sospetto === 0,
       'A7) la tavola e\' pura: chi tocca la risposta non riscrive la regola per il prossimo',
       due ? 'sospetto ' + due.sospetto : 'il modulo non c\'e\'');
  }

  /* ===================================================================
     B) IL SOSPETTO DENTRO UN DATABASE FINTO
     =================================================================== */
  if (vuole('B')) {
    titolo('B) IL SOSPETTO IN UN DATABASE IN MEMORIA — quel che un verdetto fa davvero');

    const haApplica = haV && typeof V.applica === 'function';
    const app = (b, id, v) => haApplica ? prova(() => V.applica(b, id, v), null) : null;

    /* --- B1: TORNA chiude e basta --- */
    let b = bancoNuovo();
    allenatoreNuovo(b, 'att', 1000); allenatoreNuovo(b, 'dif', 1000);
    let id = sfidaNuova(b, 'att', 'dif', 3, 1, 20, -10);
    let puntiPrima = b.punti.get('att').punti, difPrima = b.punti.get('dif').punti;
    let r1 = app(b, id, 'TORNA');
    di(!!r1 && r1.mosso === true && b.sfida[id - 1].verificata === 1 &&
       b.punti.get('att').punti === puntiPrima && b.punti.get('dif').punti === difPrima &&
       b.allenatore.get('att').sospetto === 0,
       'B1) TORNA: la riga si chiude a 1, i punti restano dove sono, il sospetto non nasce',
       r1 ? 'verificata ' + b.sfida[id - 1].verificata + ', punti ' + b.punti.get('att').punti +
            ', sospetto ' + b.allenatore.get('att').sospetto : 'applica non c\'e\'');

    /* --- B2/B3/B4: NON TORNA disfa --- */
    b = bancoNuovo();
    allenatoreNuovo(b, 'att', 1000); allenatoreNuovo(b, 'dif', 1000);
    id = sfidaNuova(b, 'att', 'dif', 3, 1, 20, -10);
    const dopoSfida = { att: { ...b.punti.get('att') }, dif: { ...b.punti.get('dif') } };
    const r2 = app(b, id, 'NON TORNA');
    const pa = b.punti.get('att'), pd = b.punti.get('dif');
    di(!!r2 && r2.mosso === true && b.sfida[id - 1].verificata === -1 &&
       pa.punti === 1000 && pd.punti === 1000 && b.allenatore.get('att').sospetto === 1,
       'B2) NON TORNA: la riga va a -1, i punti tornano dov\'erano, il sospetto sale di UNO',
       r2 ? 'att ' + dopoSfida.att.punti + '->' + pa.punti + ', dif ' + dopoSfida.dif.punti + '->' + pd.punti +
            ', sospetto ' + b.allenatore.get('att').sospetto : 'applica non c\'e\'');
    di(pa.vinte === 0 && pa.perse === 0 && pa.fatti === 0 && pa.subiti === 0 &&
       pd.vinte === 0 && pd.perse === 0 && pd.fatti === 0 && pd.subiti === 0,
       'B3) e i contatori scendono di quel che erano saliti, per tutti e due',
       'att v' + pa.vinte + '/p' + pa.perse + '/f' + pa.fatti + '/s' + pa.subiti +
       ' dif v' + pd.vinte + '/p' + pd.perse + '/f' + pd.fatti + '/s' + pd.subiti);
    /* LA SERIE NON SI DISFA, e il banco lo DICE invece di tacerlo: non e'
       ricostruibile da una riga sola (servirebbe l'ordine di tutte le
       partite dopo) e vale al massimo un moltiplicatore del 30% su una
       partita. E' l'unica cosa che una sfida disfatta lascia indietro. */
    di(haApplica && pa.serie === 1,
       'B4) la SERIE non si disfa — dichiarato: non e\' ricostruibile da una riga sola',
       'serie ' + pa.serie);

    /* --- B5: i tre «non lo so» non toccano niente e lasciano la riga in lista --- */
    let tuttiFermi = true, dett = [];
    for (const v of ['INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE']) {
      const bb = bancoNuovo();
      allenatoreNuovo(bb, 'att', 1000); allenatoreNuovo(bb, 'dif', 1000);
      const i2 = sfidaNuova(bb, 'att', 'dif', 5, 0, 30, -15);
      const prima = bb.punti.get('att').punti;
      app(bb, i2, v);
      const fermo = bb.sfida[i2 - 1].verificata === 0 && bb.punti.get('att').punti === prima &&
                    bb.allenatore.get('att').sospetto === 0;
      if (!fermo) { tuttiFermi = false; dett.push(v + ' verificata=' + bb.sfida[i2 - 1].verificata +
                                                  ' sospetto=' + bb.allenatore.get('att').sospetto); }
    }
    di(haApplica && tuttiFermi,
       'B5) INCOMPLETO / ALTRO MOTORE / NON FINISCE: riga ancora APERTA, zero punti mossi, zero sospetto',
       dett.length ? dett.join(' | ') : (haApplica ? 'tre su tre' : 'applica non c\'e\''));

    /* --- B6: il doppio conteggio --- */
    b = bancoNuovo();
    allenatoreNuovo(b, 'att', 1000); allenatoreNuovo(b, 'dif', 1000);
    id = sfidaNuova(b, 'att', 'dif', 3, 1, 20, -10);
    const uno1 = app(b, id, 'NON TORNA');
    const puntiDopoUno = b.punti.get('att').punti, sospDopoUno = b.allenatore.get('att').sospetto;
    const due1 = app(b, id, 'NON TORNA');
    di(!!uno1 && uno1.mosso === true && !!due1 && due1.mosso === false &&
       b.punti.get('att').punti === puntiDopoUno && b.allenatore.get('att').sospetto === sospDopoUno &&
       sospDopoUno === 1,
       'B6) lo stesso verdetto applicato DUE VOLTE muove tutto una volta sola',
       due1 ? 'secondo giro mosso=' + due1.mosso + ', sospetto ' + b.allenatore.get('att').sospetto : 'applica non c\'e\'');

    /* --- B7: una riga gia' chiusa con TORNA non si riapre --- */
    b = bancoNuovo();
    allenatoreNuovo(b, 'att', 1000); allenatoreNuovo(b, 'dif', 1000);
    id = sfidaNuova(b, 'att', 'dif', 2, 0, 18, -9);
    app(b, id, 'TORNA');
    const riapre = app(b, id, 'NON TORNA');
    di(!!riapre && riapre.mosso === false && b.sfida[id - 1].verificata === 1 &&
       b.allenatore.get('att').sospetto === 0,
       'B7) una riga gia\' chiusa con TORNA non si riapre con un NON TORNA arrivato dopo',
       riapre ? 'verificata ' + b.sfida[id - 1].verificata + ', sospetto ' + b.allenatore.get('att').sospetto : 'applica non c\'e\'');

    /* --- B8/B9: i pavimenti --- */
    b = bancoNuovo();
    allenatoreNuovo(b, 'att', 120); allenatoreNuovo(b, 'dif', 120);
    id = sfidaNuova(b, 'att', 'dif', 9, 0, 40, -40);
    app(b, id, 'NON TORNA');
    di(haApplica && b.punti.get('att').punti >= 100 && b.punti.get('dif').punti >= 100,
       'B8) disfare non porta nessuno sotto i cento punti, come muovi_punti',
       'att ' + b.punti.get('att').punti + ', dif ' + b.punti.get('dif').punti);
    b = bancoNuovo();
    allenatoreNuovo(b, 'att', 1000); allenatoreNuovo(b, 'dif', 1000);
    b.punti.get('att').vinte = 0; b.punti.get('att').fatti = 0;
    b.sfida.push({ id: 1, attaccante: 'att', difensore: 'dif', seme: 1, taglia: 5,
                   gol_a: 4, gol_d: 0, delta_a: 25, delta_d: -12, verificata: 0 });
    app(b, 1, 'NON TORNA');
    const p9 = b.punti.get('att');
    di(haApplica && p9.vinte >= 0 && p9.perse >= 0 && p9.pari >= 0 && p9.fatti >= 0 && p9.subiti >= 0,
       'B9) i contatori non scendono sotto zero nemmeno disfacendo una partita mai contata',
       'v' + p9.vinte + ' p' + p9.perse + ' f' + p9.fatti + ' s' + p9.subiti);

    /* --- B10: L'INVARIANTE, che e' la ragione per cui un sospetto si
       puo' scrivere: non e' un'opinione, e' il CONTO delle righe a -1.
       Chi e' segnato lo e' per partite che chiunque abbia la chiave puo'
       rigiocare una per una. --- */
    b = bancoNuovo();
    const cinqueV = ['TORNA', 'NON TORNA', 'INCOMPLETO', 'ALTRO MOTORE', 'NON FINISCE'];
    const rr = generatore(13701);
    for (let i = 0; i < 20; i++) allenatoreNuovo(b, 'g' + i, 1000 + Math.floor(rr() * 600));
    const semi = [];
    for (let i = 0; i < 100; i++) {
      const a2 = 'g' + Math.floor(rr() * 20);
      let d2 = 'g' + Math.floor(rr() * 20);
      if (d2 === a2) d2 = 'g' + ((+a2.slice(1) + 1) % 20);
      const ga = Math.floor(rr() * 6), gd = Math.floor(rr() * 6);
      semi.push({ id: sfidaNuova(b, a2, d2, ga, gd, 20 - Math.floor(rr() * 40), -10 + Math.floor(rr() * 20)),
                  v: cinqueV[Math.floor(rr() * 5)] });
    }
    /* mescolato: alcuni verdetti arrivano due volte, alcuni mai */
    for (const s of semi) { app(b, s.id, s.v); if (rr() < 0.3) app(b, s.id, s.v); }
    let rotte = [];
    for (const [idg, a2] of b.allenatore) {
      const conto = b.sfida.filter(s => s.attaccante === idg && s.verificata === -1).length;
      if (a2.sospetto !== conto) rotte.push(idg + ': sospetto ' + a2.sospetto + ' contro ' + conto + ' righe');
    }
    const quantiSosp = [...b.allenatore.values()].reduce((s, a2) => s + a2.sospetto, 0);
    di(haApplica && rotte.length === 0 && quantiSosp > 0,
       'B10) L\'INVARIANTE: il sospetto di ognuno E\' il numero delle sue sfide a -1, dopo cento verdetti mescolati',
       rotte.length ? rotte.slice(0, 3).join(' | ') : (haApplica ? quantiSosp + ' sospetti su 20 allenatori, venti conti su venti' : 'applica non c\'e\''));

    /* --- B11/B12: gli ingressi che non esistono --- */
    b = bancoNuovo();
    allenatoreNuovo(b, 'att', 1000); allenatoreNuovo(b, 'dif', 1000);
    id = sfidaNuova(b, 'att', 'dif', 1, 0, 15, -7);
    const fantasma = app(b, 999, 'NON TORNA');
    di(!!fantasma && fantasma.mosso === false && b.allenatore.get('att').sospetto === 0,
       'B11) un verdetto su una sfida che non esiste non rompe niente e non accusa nessuno',
       fantasma ? 'mosso ' + fantasma.mosso : 'applica non c\'e\'');
    const ignoto = app(b, id, 'BOH');
    di(!!ignoto && ignoto.mosso === false && b.sfida[id - 1].verificata === 0 &&
       b.allenatore.get('att').sospetto === 0,
       'B12) un verdetto ignoto lascia la riga aperta e intatta: e\' un «non lo so», non un\'accusa',
       ignoto ? 'verificata ' + b.sfida[id - 1].verificata : 'applica non c\'e\'');
  }

  /* ===================================================================
     C) L'ABBINAMENTO, MISURATO
     =================================================================== */
  if (vuole('C')) {
    titolo('C) L\'ABBINAMENTO — la seconda coordinata, misurata prima e dopo nella STESSA corsa');

    const SCALA = haA && Array.isArray(A.SCALA) ? A.SCALA : null;
    const amm = (io, c, g) => haA ? prova(() => A.ammissibile(io, c, g), false) : false;
    const cerca = (io, gente, dado) => (haA && typeof A.cerca === 'function')
      ? prova(() => A.cerca(io, gente, dado), { avv: null, gradino: 0 }) : { avv: null, gradino: 0 };

    /* --- C1: la scala --- */
    let monotona = !!SCALA && SCALA.length >= 2;
    if (SCALA) for (let k = 1; k < SCALA.length; k++)
      if (!(SCALA[k].forza >= SCALA[k - 1].forza && SCALA[k].punti >= SCALA[k - 1].punti)) monotona = false;
    const ultimo = SCALA ? SCALA[SCALA.length - 1] : null;
    di(monotona && !!ultimo && ultimo.forza >= 99 && !Number.isFinite(ultimo.punti),
       'C1) la scala si allarga in tutte e due le coordinate, e l\'ULTIMO gradino ammette chiunque',
       SCALA ? SCALA.map(g => g.forza + '/' + (Number.isFinite(g.punti) ? g.punti : 'inf')).join(' -> ') : 'il modulo non c\'e\'');

    /* --- C2: il caso che oggi passa e domani no --- */
    const io = { id: 'io', forza: 70, punti: 1000 }, vicinoDiForza = { id: 'x', forza: 72, punti: 1900 };
    di(haA && SCALA && amm(io, vicinoDiForza, SCALA[0]) === false &&
       amm(io, { id: 'y', forza: 72, punti: 1040 }, SCALA[0]) === true,
       'C2) due a forza 70 e 72 ma a 1000 e 1900 punti NON sono piu\' un abbinamento; a 1000 e 1040 si\'',
       haA ? 'fuori=' + amm(io, vicinoDiForza, SCALA[0]) + ', dentro=' + amm(io, { id: 'y', forza: 72, punti: 1040 }, SCALA[0]) : 'il modulo non c\'e\'');

    /* --- C3: l'ultimo gradino non affama nessuno. E' la proprieta' che
       rende sicuro il RICONTROLLO fatto dall'endpoint: se l'SQL e il
       JavaScript un giorno divergessero, il peggio che puo' capitare e'
       finire sull'ultimo gradino, cioe' l'abbinamento di oggi. --- */
    const dd = generatore(9001);
    let semprePassa = haA && !!SCALA;
    for (let k = 0; k < 2000 && semprePassa; k++) {
      const a2 = { id: 'a', forza: 1 + Math.floor(dd() * 99), punti: 100 + Math.floor(dd() * 4000) };
      const b2 = { id: 'b', forza: 1 + Math.floor(dd() * 99), punti: 100 + Math.floor(dd() * 4000) };
      if (amm(a2, b2, SCALA[SCALA.length - 1]) !== true) semprePassa = false;
    }
    di(semprePassa, 'C3) sull\'ultimo gradino QUALUNQUE coppia e\' ammissibile: duemila coppie a caso, agli estremi',
       haA ? '2000 su 2000' : 'il modulo non c\'e\'');

    /* --- C4/C5/C6: LA MISURA, prima e dopo, stessa corsa --- */
    const misura = (quanti, seme, N) => {
      const gente = popolazione(quanti, seme);
      const conto = scelta => {
        const dado = generatore(777);
        const dist = []; let vuoti = 0, chiamate = 0;
        for (let k = 0; k < N; k++) {
          const me = gente[Math.floor(dado() * gente.length)];
          const out = scelta(me, gente, dado);
          chiamate += out.gradino;
          if (!out.avv) { vuoti++; continue; }
          dist.push(Math.abs(out.avv.punti - me.punti));
        }
        return { ...statistica(dist), vuoti, chiamate: dist.length ? +(chiamate / dist.length).toFixed(2) : 0 };
      };
      return { prima: conto(cercaPrima), dopo: conto(cerca) };
    };
    const m400 = misura(400, 20260922 + 400, 5000);
    const m60 = misura(60, 20260922 + 60, 5000);
    const m12 = misura(12, 20260922 + 12, 5000);
    const mostra = (n, m) => console.log('      ' + n + '  prima: mediana ' + m.prima.mediana + ', entro150 ' +
      m.prima.vicini + '%, oltre500 ' + m.prima.lontani + '%, senza avv. ' + m.prima.vuoti +
      '  ->  dopo: mediana ' + m.dopo.mediana + ', entro150 ' + m.dopo.vicini + '%, oltre500 ' +
      m.dopo.lontani + '%, senza avv. ' + m.dopo.vuoti + ', chiamate/ricerca ' + m.dopo.chiamate);
    mostra('400 allenatori:', m400); mostra(' 60 allenatori:', m60); mostra(' 12 allenatori:', m12);

    di(m400.dopo.n > 0 && m400.dopo.mediana <= 100 && m400.prima.mediana >= 150,
       'C4) su 400 allenatori lo scarto MEDIANO di punti scende sotto 100 (era sopra 150)',
       m400.prima.mediana + ' -> ' + m400.dopo.mediana);
    di(m400.dopo.vicini >= 90 && m400.prima.vicini <= 60,
       'C4b) e gli abbinamenti «entro 150 punti» — quelli che si possono ancora perdere — passano sopra il 90%',
       m400.prima.vicini + '% -> ' + m400.dopo.vicini + '%');
    /* Sulla base da DODICI — quella vera di oggi — la soglia non e' un
       numero assoluto ma un CONFRONTO: gli abbinamenti sbilanciati
       devono almeno DIMEZZARSI. Con dodici persone nessuna finestra fa
       miracoli, e chiedere un numero fisso vorrebbe dire chiedere alla
       finestra di inventare giocatori che non ci sono. */
    di(m12.dopo.n > 0 && m12.dopo.mediana <= 160 && m12.prima.lontani >= 10 &&
       m12.dopo.lontani * 2 <= m12.prima.lontani,
       'C5) sulla base da DODICI persone — quella vera — gli abbinamenti sbilanciati almeno DIMEZZANO',
       'mediana ' + m12.prima.mediana + '->' + m12.dopo.mediana + ', oltre500 ' +
       m12.prima.lontani + '%->' + m12.dopo.lontani + '%');
    di(m400.dopo.vuoti <= m400.prima.vuoti && m60.dopo.vuoti <= m60.prima.vuoti && m12.dopo.vuoti <= m12.prima.vuoti,
       'C6) NESSUNA SFIDA SI PERDE: le ricerche senza avversario non aumentano su nessuna delle tre popolazioni',
       [m400, m60, m12].map(m => m.prima.vuoti + '->' + m.dopo.vuoti).join(', '));

    /* =====================================================================
       C7) LA VARIETA', e il PEGGIO SERVITO.

       Dentro la banda si SORTEGGIA: se si prendesse il piu' vicino, due
       della stessa fascia si incontrerebbero all'infinito — e' scritto
       sopra `trova_avversario` dal primo giorno, ed e' la ragione
       dell'`order by random()`.

       Ma la cosa che conta non e' la media, e' il PEGGIO SERVITO: una
       finestra piu' stretta puo' lasciare QUALCUNO con un avversario
       solo, e la media non lo direbbe. Quindi si guarda ogni allenatore
       della popolazione, non uno.

       DUE TRAPPOLE PAGATE QUI DENTRO, tutte e due il 22 settembre 2026:

         1. la prima stesura tirava 200 generatori con semi consecutivi
            (`generatore(5000 + k)`) e ne usava la PRIMA uscita. Misurato:
            200 semi consecutivi di questo xorshift danno SEDICI valori
            distinti su mille. Il banco misurava il generatore, non la
            ricerca, e dichiarava «4 avversari» dove ce n'erano 99. Ora si
            tira UN generatore solo, duecento volte.
         2. con la misura riparata e' venuto fuori il difetto vero: senza
            il pavimento del mazzo il peggio servito ERA un avversario
            solo. Il pavimento (`minimo` nella scala) e' nato da qui.
       ===================================================================== */
    const gente = popolazione(400, 20260922 + 400);
    const distinti = (scelta, elenco) => {
      const dado = generatore(4242);
      return elenco.map(me => {
        const visti = new Set();
        for (let k = 0; k < 200; k++) { const o = scelta(me, elenco, dado); if (o.avv) visti.add(o.avv.id); }
        return visti.size;
      }).sort((a, b) => a - b);
    };
    /* IL CONTROFATTUALE, misurato e non raccontato: la stessa scala col
       pavimento tolto (`minimo` a uno dappertutto). Usa `ammissibile` e
       `separati` del modulo, cioe' la cura vera: l'unica cosa che cambia
       e' il pavimento. Senza questa riga la frase «senza il pavimento
       c'e' chi resta con un avversario solo» sarebbe un racconto. */
    const cercaSenzaPavimento = (io2, elenco, dado) => {
      if (!haA || !SCALA) return { avv: null, gradino: 0 };
      for (let k = 0; k < SCALA.length; k++) {
        const buoni = elenco.filter(x => amm(io2, x, SCALA[k]) &&
          (typeof A.separati === 'function' ? !A.separati(io2, x) : true));
        if (!buoni.length) continue;
        return { avv: buoni[Math.floor(dado() * buoni.length)], gradino: k + 1 };
      }
      return { avv: null, gradino: 0 };
    };
    const vPrima = distinti(cercaPrima, gente);
    const vDopo = distinti(cerca, gente);
    const vSenza = distinti(cercaSenzaPavimento, gente);
    console.log('      avversari distinti in 200 ricerche, su tutti e ' + gente.length +
      ' gli allenatori:  prima peggio ' + vPrima[0] + ', p10 ' + vPrima[Math.floor(0.1 * vPrima.length)] +
      ', mediana ' + vPrima[Math.floor(0.5 * vPrima.length)] +
      '  ->  dopo peggio ' + vDopo[0] + ', p10 ' + vDopo[Math.floor(0.1 * vDopo.length)] +
      ', mediana ' + vDopo[Math.floor(0.5 * vDopo.length)] +
      '   (la stessa scala SENZA il pavimento: peggio ' + vSenza[0] + ', p10 ' +
      vSenza[Math.floor(0.1 * vSenza.length)] + ')');
    di(vDopo[0] >= 5 && vSenza[0] < vDopo[0],
       'C7) IL PEGGIO SERVITO: nessuno resta con meno di cinque avversari possibili — e senza il pavimento del mazzo ce n\'e\' chi ne ha UNO',
       'peggio: oggi ' + vPrima[0] + ', senza pavimento ' + vSenza[0] + ', col pavimento ' + vDopo[0]);
    /* e il pavimento c'e' davvero nella scala, con l'ultimo gradino a uno
       cosi' nessuna sfida si perde per colpa sua */
    di(!!SCALA && SCALA.every(g => (g.minimo | 0) >= 1) &&
       SCALA[SCALA.length - 1].minimo === 1 && SCALA[0].minimo > 1,
       'C7b) la scala porta il pavimento, e l\'ULTIMO gradino ne chiede UNO: il pavimento non puo\' far perdere una sfida',
       SCALA ? SCALA.map(g => g.minimo).join('/') : 'il modulo non c\'e\'');

    /* --- C8/C9/C10: la separazione --- */
    const soglia = haA ? A.SOSPETTO_SEPARA : null;
    const conSosp = popolazione(400, 20260922 + 400);
    const rs = generatore(4242);
    for (const g of conSosp) g.sospetto = rs() < 0.03 ? 3 : 0;
    const incontri = (chi, che) => {
      const dado = generatore(777);
      let tot = 0, colpi = 0;
      for (let k = 0; k < 5000; k++) {
        const m2 = conSosp[Math.floor(dado() * conSosp.length)];
        if (chi === 'onesto' ? m2.sospetto >= 3 : m2.sospetto < 3) continue;
        const out = cerca(m2, conSosp, dado);
        tot++;
        if (out.avv && (che === 'sospetto' ? out.avv.sospetto >= 3 : out.avv.sospetto < 3)) colpi++;
      }
      return { tot, colpi };
    };
    const on = incontri('onesto', 'sospetto');
    di(haA && on.tot > 100 && on.colpi === 0,
       'C8) un ONESTO non incontra mai un sospetto: zero su ' + on.tot + ' ricerche',
       haA ? on.colpi + ' incontri su ' + on.tot : 'il modulo non c\'e\'');
    const so = incontri('sospetto', 'onesto');
    di(haA && so.tot > 20 && so.colpi === 0,
       'C9) e vale nei due versi: un SOSPETTO non incontra un onesto',
       haA ? so.colpi + ' incontri su ' + so.tot : 'il modulo non c\'e\'');

    /* LA SOGLIA E' TRE E NON UNO, e si prova: due NON TORNA non separano
       ancora. Un solo verdetto puo' essere un difetto del nostro giudice,
       che e' nuovo; tre sono un comportamento. */
    const g2 = popolazione(200, 4711);
    for (const g of g2) g.sospetto = 0;
    g2[0].sospetto = 2; g2[1].sospetto = 3;
    const puoDue = haA && typeof A.separati === 'function'
      ? prova(() => A.separati(g2[0], { ...g2[2], sospetto: 0 }), null) : null;
    const puoTre = haA && typeof A.separati === 'function'
      ? prova(() => A.separati(g2[1], { ...g2[2], sospetto: 0 }), null) : null;
    di(soglia === 3 && puoDue === false && puoTre === true,
       'C10) la soglia e\' TRE: due verdetti NON TORNA non separano ancora, tre si\'',
       'soglia ' + soglia + ', a 2 separati=' + puoDue + ', a 3 separati=' + puoTre);
  }

  /* ===================================================================
     D) LE PORTE CHIUSE — e questo gruppo ATTESTA, non misura
     =================================================================== */
  if (vuole('D')) {
    titolo('D) LE PORTE CHIUSE — lettura di testo, dichiarata: qui non c\'e\' un Postgres da interrogare');

    const leggi = p => { try { return fs.readFileSync(path.join(RETE, p), 'utf8'); } catch (e) { return ''; } };
    const schema = leggi('schema.sql');
    const apiDir = path.join(RETE, 'api');
    const api = fs.existsSync(apiDir) ? fs.readdirSync(apiDir).filter(f => f.endsWith('.js')) : [];
    const testoApi = api.map(f => ({ f, t: leggi('api/' + f) }));

    /* --- D1: RLS su ogni tabella --- */
    const tabelle = [...schema.matchAll(/create table if not exists\s+(\w+)/gi)].map(m => m[1]);
    const senzaRls = tabelle.filter(t =>
      !new RegExp('alter table\\s+' + t + '\\s+enable row level security', 'i').test(schema));
    const revokeTab = (schema.match(/revoke all on ([\w,\s]+?) from anon, authenticated/i) || [, ''])[1];
    const fuoriRevoke = tabelle.filter(t => !new RegExp('\\b' + t + '\\b').test(revokeTab));
    di(tabelle.length >= 6 && senzaRls.length === 0 && fuoriRevoke.length === 0,
       'D1) OGNI tabella ha RLS acceso ed e\' nel revoke: nessuna porta aperta, nemmeno una nuova',
       tabelle.length + ' tabelle: ' + tabelle.join(', ') +
       (senzaRls.length ? ' — SENZA RLS: ' + senzaRls.join(', ') : '') +
       (fuoriRevoke.length ? ' — FUORI DAL REVOKE: ' + fuoriRevoke.join(', ') : ''));

    /* --- D2: ogni funzione e' revocata, con la firma giusta --- */
    const funzioni = [...schema.matchAll(/create or replace function\s+(\w+)\s*\(([^)]*)\)/gi)]
      .map(m => ({ nome: m[1], args: m[2] }));
    const tipoDi = a => {
      const p = a.trim().split(/\s+/);
      if (p.length < 2) return '';
      return p[1].replace(/,$/, '').toLowerCase();
    };
    const firmaDi = f => f.args.split(',').map(a => a.split(/\s+default\s+/i)[0]).map(tipoDi).filter(Boolean).join(', ');
    const nonRevocate = funzioni.filter(f =>
      !new RegExp('revoke all on function\\s+' + f.nome + '\\s*\\(\\s*' +
        firmaDi(f).replace(/, /g, '\\s*,\\s*') + '\\s*\\)', 'i').test(schema));
    di(funzioni.length >= 4 && nonRevocate.length === 0,
       'D2) OGNI funzione del database e\' revocata ad anon e authenticated, con la firma esatta',
       funzioni.map(f => f.nome + '(' + firmaDi(f) + ')').join(' · ') +
       (nonRevocate.length ? ' — NON REVOCATE: ' + nonRevocate.map(f => f.nome).join(', ') : ''));

    /* --- D3: la trappola di Postgres, pagata --- */
    const iDrop = schema.search(/drop function if exists\s+trova_avversario\s*\(\s*uuid\s*,\s*int\s*\)/i);
    const iCreate = schema.search(/create or replace function\s+trova_avversario/i);
    di(iDrop >= 0 && iCreate > iDrop,
       'D3) la firma vecchia di trova_avversario viene DROPPATA prima della nuova (se no ne convivono due)',
       iDrop >= 0 ? 'drop a ' + iDrop + ', create a ' + iCreate : 'nessun drop');

    /* --- D4: le due dimensioni nuove sono nel predicato --- */
    const haBandaPunti = /banda_punti\s+int/i.test(schema) &&
      /banda_punti is null or abs\(/i.test(schema.replace(/\s+/g, ' '));
    const haSeparazione = /\(\s*a\.sospetto\s*>=\s*separa\s*\)\s*=\s*\(/i.test(schema.replace(/\s+/g, ' '));
    const haPavimento = /minimo\s+int/i.test(schema) &&
      /\(select count\(\*\) from buoni\) >= minimo/i.test(schema.replace(/\s+/g, ' '));
    di(haBandaPunti && haSeparazione && haPavimento,
       'D4) lo schema porta i tre predicati nuovi: i PUNTI (null = nessun limite), la separazione, il pavimento del mazzo',
       'banda_punti ' + haBandaPunti + ', separazione ' + haSeparazione + ', pavimento ' + haPavimento);

    /* --- D5: segna_verdetto, la guardia e la tavola --- */
    const sv = (schema.match(/create or replace function\s+segna_verdetto[\s\S]*?\$\$;/i) || [''])[0];
    const piatto = sv.replace(/\s+/g, ' ');
    const haGuardia = /where id = s_id and verificata = 0/i.test(piatto);
    const haTavola = /case verdetto when 'TORNA' then 1 when 'NON TORNA' then -1 else 0 end/i.test(piatto);
    const sospSoloNelRamo = (() => {
      const i = piatto.search(/sospetto = .*?sospetto \+ 1/i);
      if (i < 0) return false;
      /* il +1 deve stare DOPO il `if e = -1`, cioe' nel ramo del solo NON TORNA */
      const j = piatto.search(/if e = -1 then/i);
      return j >= 0 && i > j;
    })();
    di(!!sv && haGuardia && haTavola && sospSoloNelRamo,
       'D5) segna_verdetto: guardia su verificata=0, tavola dei cinque in SQL, e il sospetto SOLO nel ramo -1',
       sv ? 'guardia ' + haGuardia + ', tavola ' + haTavola + ', ramo ' + sospSoloNelRamo : 'la funzione non c\'e\'');

    /* --- D6: IL SOSPETTO NON ESCE. La tupla di trova_avversario finisce
       dritta nel corpo della risposta (`avversario: avv`), quindi una
       colonna in piu' li' dentro e' una colonna sul telefono di un
       altro. La separazione resta DOVE STA IL DATO, e non si puo'
       ricontrollare fuori senza portarlo fuori. --- */
    const tupla = (schema.match(/create or replace function\s+trova_avversario[\s\S]*?language sql/i) || [''])[0];
    const tuplaSpia = /returns table \([^)]*sospetto/i.test(tupla.replace(/\s+/g, ' ')) ||
                      /select[\s\S]*?a\.sospetto[\s\S]*?from squadra/i.test(tupla);
    const classSpia = /create or replace function\s+classifica[\s\S]*?sospetto/i.test(schema);
    /* L'endpoint PUO' nominare la soglia (`SOSPETTO_SEPARA` la manda al
       database), e non e' una fuga: e' un numero nostro. Quel che non
       puo' fare e' LEGGERE il sospetto di qualcuno — chiederlo in una
       select, pescarlo da un oggetto, rimandarlo in una chiave. */
    const apiSpia = testoApi.filter(x =>
      /\.sospetto/.test(x.t) || /sospetto\s*:/.test(x.t) || /select=[^'"`]*sospetto/i.test(x.t));
    di(!tuplaSpia && !classSpia && apiSpia.length === 0,
       'D6) il SOSPETTO non esce: non nella tupla dell\'avversario, non nella classifica, non in un endpoint',
       tuplaSpia ? 'e\' nella tupla di trova_avversario' :
       classSpia ? 'e\' nella classifica' :
       apiSpia.length ? 'e\' in ' + apiSpia.map(x => x.f).join(', ') : 'nessuna delle tre');

    /* --- D7/D8: i freni e il numero degli endpoint --- */
    const freni = new Map();
    for (const x of testoApi) {
      const m = [...x.t.matchAll(/frenato\(\s*'([\w:]+)'/g)].map(y => y[1]);
      if (m.length) freni.set(x.f, m);
    }
    const senzaFreno = testoApi.filter(x => !freni.has(x.f) && x.f !== 'entra.js');
    di(api.length > 0 && senzaFreno.length === 0 && [...freni.values()].flat().length >= 6,
       'D7) ogni endpoint ha il suo freno nel database (le funzioni Vercel non condividono memoria)',
       [...freni.entries()].map(([f, k]) => f + ':' + k.join('+')).join(' · ') +
       (senzaFreno.length ? ' — SENZA FRENO: ' + senzaFreno.map(x => x.f).join(', ') : ''));
    di(api.length === 5,
       'D8) gli endpoint sono ancora CINQUE: questo cantiere non ne apre nessuno',
       api.join(', '));
  }

  /* ------------------------------------------------------------- fine */
  console.log('\n' + (ok + no) + ' controlli, ' + ok + ' passati, ' + no + ' falliti');
  process.exit(no ? 1 : 0);
})().catch(e => { console.error('FALLITO (banco): ' + (e && e.stack ? e.stack : e)); process.exit(2); });
